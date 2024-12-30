import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer.js";
import { ReusableFunctions } from "../utils/reusable_functions.js";
import { encryption } from "../utils/encryptAndDecryptFunctions.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { randomUUID } from "crypto";

export class UserDao {
  constructor(pool) {
    this.pool = pool;
  }
  async encryptAndHashUserInfo({ userEmail, password }) {
    try {
      const hashedPassword = await bcrypt.hash(
        password,
        ReusableFunctions.passwordSaltRound
      );

      const hashedEmail = encryption.hash(userEmail);

      const encryptedEmail = encryption.encrypt(userEmail);
      const data = {
        hashedPassword,
        hashedEmail,
        encryptedEmail,
      };

      return data;
    } catch (error) {
      throw error;
    }
  }
  async addUser({ user }) {
    const {
      firstName,
      lastName,
      username,
      userEmail,
      password,
      theme,
      dateOfBirth,
      country,
    } = user;
    const uuid = randomUUID();

    const connection = await this.pool.getConnection();
    try {
      const hashedAndEncryptedELements = await this.encryptAndHashUserInfo({
        userEmail,
        password,
      });

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO user(id, first_name, last_name, username, user_email, hashed_email, theme, date_of_birth, country)
         VALUES(UUID_TO_BIN(?),?,?,?,?,?,?,?,?);`,
        [
          uuid,
          firstName,
          lastName,
          username,
          hashedAndEncryptedELements.encryptedEmail,
          hashedAndEncryptedELements.hashedEmail,
          theme,
          dateOfBirth,
          country,
        ]
      );
      await connection.commit();

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO user_level(user_id) 
         VALUES(UUID_TO_BIN(?));`,
        [uuid]
      );
      await connection.commit();

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO passwords(user_id, password) 
         VALUES(UUID_TO_BIN(?),?);`,
        [uuid, hashedAndEncryptedELements.hashedPassword]
      );
      await connection.commit();

      return `User created.`;
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes("hashed_email")) {
          return CustomError.newError(errors.conflict.userEmail);
        } else if (error.sqlMessage.includes("username")) {
          return CustomError.newError(errors.conflict.username);
        }
      } else if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
        return CustomError.newError(errors.unprocessableEntity);
      }
      throw error;
    } finally {
      connection.release();
    }
  }
  async logIn({ user }) {
    const { login, password } = user;
    const hashedEmail = encryption.encrypt(login);
    const connection = await this.pool.getConnection();

    try {
      const getUser = await ReusableFunctions.findUser(
        login,
        connection,
        hashedEmail
      );

      if (getUser.length > 0) {
        if (
          await ReusableFunctions.validatePassword(
            password,
            getUser,
            "password"
          )
        ) {
          return getUser[0];
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async storeTempPassInDB({ username, temporaryPassword }) {
    const connection = await this.pool.getConnection();
    try {
      const hashedTempPassword = await bcrypt.hash(
        temporaryPassword,
        ReusableFunctions.passwordSaltRound
      );
      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );
      await connection.beginTransaction();

      await connection.query(
        `UPDATE passwords 
         SET temporary_password = ?, time_stamp = ? 
         WHERE user_id = ?;`,
        [hashedTempPassword, Date.now() / 1000, userId]
      );
      await connection.commit();
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async validateTempPassword({ username, tempPassword }) {
    const connection = await this.pool.getConnection();
    try {
      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );

      let [temporaryPasswords] = await connection.query(
        `SELECT temporary_password, time_stamp FROM passwords 
         WHERE user_id = ?;`,
        [username, userId]
      );
      if (
        await ReusableFunctions.validatePassword(
          tempPassword,
          temporaryPasswords,
          "temporary_password"
        )
      ) {
        if (
          Math.ceil(Date.now() / 1000 - temporaryPasswords[0].time_stamp) > 60
        ) {
          return "expired";
        } else {
          return true;
        }
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async changePassword({ password }) {
    let { username, tempPassword, newPassword } = password;
    const hashNewPassword = await bcrypt.hash(
      newPassword,
      ReusableFunctions.passwordSaltRound
    );
    const connection = await this.pool.getConnection();
    try {
      const passwordValidation = await this.validateTempPassword({
        username,
        tempPassword,
      });
      if (passwordValidation === "expired") {
        await ReusableFunctions.deleteTempPassword(
          hashNewPassword,
          username,
          connection
        );
        return CustomError.newError(errors.auth.expiredPassword);
      } else if (passwordValidation) {
        await ReusableFunctions.deleteTempPassword(
          hashNewPassword,
          username,
          connection
        );
        return `Password changed`;
      } else {
        return CustomError.newError(errors.auth.unauthorized);
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async changeLogin({ username, input }) {
    let { passwordToCheck } = input;
    const values = Object.keys(input);

    const connection = await this.pool.getConnection();
    try {
      const [passwords] = await connection.query(
        `SELECT password FROM passwords 
         LEFT JOIN user ON user.id = passwords.user_id 
        WHERE username = ?;`,
        [username]
      );

      const passwordIsValid = await ReusableFunctions.validatePassword(
        passwordToCheck,
        passwords,
        "password"
      );

      if (passwordIsValid) {
        if (values.includes("new_email")) {
          const hashedEmail = encryption.encrypt(input.new_email);

          await connection.beginTransaction();
          await connection.query(
            `UPDATE user SET user_email = ? WHERE username = ?;`,
            [hashedEmail, username]
          );
          await connection.commit();
          return `Email changed`;
        } else if (values.includes("new_username")) {
          await connection.beginTransaction();
          await connection.query(
            `UPDATE user SET username = ? WHERE username = ?;`,
            [input.new_username, username]
          );
          await connection.commit();
          return `Username changed`;
        }
      } else {
        return CustomError.newError(errors.auth.unauthorized);
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async sendTemporaryPassword({ input }) {
    let { username } = input;
    const connection = await this.pool.getConnection();

    try {
      const [userExists] = await ReusableFunctions.findUser(
        username,
        connection
      );

      if (userExists.length === 0) {
        return `Username not valid`;
      } else {
        const temporaryPassword = ReusableFunctions.generateRandomString(10);
        const text = `Your temporary password is: ${temporaryPassword} - It will expire in 1 minute.`;
        const email = encryption.decrypt(userExists.user_email);
        const subject = "Password Reset";

        try {
          await connection.beginTransaction();
          await sendEmail(email, text, subject);
          this.storeTempPassInDB({
            username,
            temporaryPassword,
          });
          await connection.commit();
          return `Temporary password sent to email for ${username}.`;
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
