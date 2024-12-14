import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer.js";
import { encryption } from "../utils/encryptAndDecryptFunctions.js";
import { ReusableFunctions } from "../utils/reusable_functions.js";
import { DaoIndex } from "../dao/dao.index.js";

export class UserModel {
  constructor(pool) {
    this.pool = pool;
  }
  async addUser({ user }) {
    const { userEmail, password } = user;

    const connection = await this.pool.getConnection();
    const hashedPassword = await bcrypt.hash(
      password,
      ReusableFunctions.passwordSaltRound
    );

    const encryptedEmail = encryption.encrypt(userEmail);

    await connection.beginTransaction();

    const result = await DaoIndex.userDao.addUser({
      user,
      encryptedEmail,
      hashedPassword,
    });

    return result;
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
      console.error(error);
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
          await DaoIndex.userDao.storeTempPassInDB({
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
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async validateTempPassword({ username, tempPassword }) {
    try {
      const isPasswordValid = await DaoIndex.userDao.validateTempPassword({
        username,
        tempPassword,
      });

      return isPasswordValid;
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async changePassword({ password }) {
    const result = await DaoIndex.userDao.changePassword({ password });

    return result;
  }
  async changeLogin({ username, input }) {
    const result = await DaoIndex.userDao.changeLogin({ username, input });
    return result;
  }
  async profile({ username }) {
    const result = await DaoIndex.userDao.profile({ username });

    return result;
  }
  async achievements({ username }) {
    try {
      const result = await DaoIndex.userDao.achievements({ username });

      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async sendFriendRequest({ sender, receiver }) {
    try {
      const result = await DaoIndex.userDao.sendFriendRequest({
        sender,
        receiver,
      });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async getFriendRequests({ username }) {
    try {
      const result = await DaoIndex.userDao.getFriendRequests({ username });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async getFriends({ username }) {
    try {
      const result = await DaoIndex.userDao.getFriends({ username });

      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
