import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer.js";
import { ReusableFunctions } from "../utils/reusable_functions.js";
import { encryption } from "../utils/encryptAndDecryptFunctions.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { randomUUID } from "crypto";

export class UserDAO {
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
    } catch (e) {
      await connection.rollback();
      console.error(`Error adding user`, e.sqlMessage);
      if (e.code === "ER_DUP_ENTRY") {
        if (e.sqlMessage.includes("hashed_email")) {
          return CustomError.newError(errors.conflict.userEmail);
        } else if (e.sqlMessage.includes("username")) {
          return CustomError.newError(errors.conflict.username);
        }
      } else if (e.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
        return CustomError.newError(errors.unprocessableEntity);
      }
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async checkIfUsersAreFriends({ viewer, user }) {
    const connection = await this.pool.getConnection();
    try {
      const getId = await ReusableFunctions.getId("user", viewer, connection);

      const [firstCheck] = await connection.query(
        `SELECT * FROM friends 
         WHERE friend_1 = ? AND friend_2 = ?;`,
        [getId, user]
      );

      const [secondCheck] = await connection.query(
        `SELECT * FROM friends WHERE friend_2 = ? AND friend_1 = ?;`,
        [getId, user]
      );

      const firstCheckTrue = firstCheck.length > 0;
      const secondCheckTrue = secondCheck.length > 0;

      if (!firstCheckTrue && !secondCheckTrue) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async profile({ username, viewer }) {
    const connection = await this.pool.getConnection();
    try {
      const [getUserTheme] = await connection.query(
        `SELECT theme FROM user
         WHERE username = ?;`,
        [username]
      );

      const userTheme = getUserTheme[0];

      if (!userTheme) return CustomError.newError(errors.notFound.userNotFound);

      const [getUserData] = await connection.query(
        `SELECT user.id, first_name, last_name, country, date_of_birth, points, themes.theme, themes.level_name FROM user
        JOIN user_level ON user.id = user_level.user_id
        JOIN themes ON themes.level_number = user_level.level_id  
        WHERE username = ? AND themes.theme = ?;`,
        [username, userTheme.theme]
      );

      const userData = getUserData[0];

      if (!userData) return CustomError.newError(errors.notFound.userNotFound);

      const { id, first_name, last_name, country, points, theme, level_name } =
        userData;

      const userAreFriends = await this.checkIfUsersAreFriends({
        viewer,
        user: id,
      });

      const [getHabitCompletion] = await connection.query(
        `SELECT COUNT(times_completed) AS 'Habits completed', SUM(times_completed) AS 'Amount of times habits were completed' FROM user
      JOIN habit_completion ON user.id = habit_completion.user_id
      WHERE username = ?
      GROUP BY user.id;
      `,
        [username]
      );

      const [getBadges] = await connection.query(
        `SELECT badge, badge_level FROM user
        JOIN habit_completion ON habit_completion.user_id = user.id
        JOIN badges ON badges.id = habit_completion.badge_id WHERE user.username = ?;
`,
        [username]
      );

      const [getHabits] = await connection.query(
        `SELECT habit, times_completed FROM habit_completion WHERE user_id = ? ORDER BY times_completed DESC LIMIT 3;`,
        [id]
      );

      const levelAndHabitsData = getHabitCompletion[0];

      const badgesInformation = getBadges;

      const userInformation = {
        userAreFriends,
        first_name,
        last_name,
        country,
        points,
        level_name,
        theme,
        ...levelAndHabitsData,
        badges:
          badgesInformation.length > 0 ? badgesInformation : "No badges yet.",
        threeMostCompletedHabits: getHabits,
      };

      return userInformation;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async achievements({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );
      const [getHabitsWithBadge] = await connection.query(
        `SELECT badges.badge, badge_level, habit, habit_completion.times_completed FROM habit_completion 
         JOIN badges ON badges.id = habit_completion.badge_id 
         WHERE habit_completion.user_id = ?;`,
        [userId]
      );
      const [getHabitsWithoutBadge] = await connection.query(
        `SELECT habit, times_completed FROM habit_completion 
         WHERE badge_id IS NULL AND user_id = ?;`,
        [userId]
      );

      const userAchievements = {
        badge:
          getHabitsWithBadge.length < 1
            ? "No habits yet"
            : `${getHabitsWithBadge}`,
        noBadge:
          getHabitsWithoutBadge.length < 1
            ? "No habits yet"
            : `${getHabitsWithoutBadge}`,
      };
      return userAchievements;
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async sendFriendRequest({ sender, receiver }) {
    const connection = await this.pool.getConnection();

    if (sender === receiver)
      return CustomError.newError(errors.error.friendRequestSameUser);

    try {
      const senderId = await ReusableFunctions.getId(
        "user",
        sender,
        connection
      );

      const receiverId = await ReusableFunctions.getId(
        "user",
        receiver,
        connection
      );

      if (!receiverId) {
        return CustomError.newError(errors.notFound.userNotFound);
      }

      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO friends(friend_1, friend_2, status) 
         VALUES(?,?,?);`,
        [senderId, receiverId, "PENDING"]
      );

      await connection.commit();

      return "Friend request sent.";
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async getFriendRequests({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const receiverId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );

      const [getRequests] = await connection.query(
        `SELECT f.id, first_name, last_name FROM friends f
        JOIN user ON friend_1 = user.id
        WHERE friend_2 = ? AND status = 'PENDING';`,
        [receiverId]
      );

      return getRequests.length > 0
        ? getRequests
        : "No friend requests at the moment.";
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async getFriends({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );

      const [getFriends] = await connection.query(
        `SELECT first_name, last_name FROM friends
         JOIN user ON user.id = friend_1 
         WHERE friend_1 = ? AND status = 'ACCEPTED'
         UNION 
         SELECT first_name, last_name FROM friends 
         JOIN user ON user.id = friend_2 
         WHERE friend_2 = ? AND status = 'ACCEPTED';`,
        [userId, userId]
      );

      return getFriends.length > 0 ? getFriends : "No friends yet.";
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async respondToFriendRequest({ id, response }) {
    const connection = await this.pool.getConnection();
    try {
      const requestAccepted =
        response.toUpperCase() === "ACCEPTED" ? true : false;

      await connection.beginTransaction();

      await connection.query(
        `UPDATE friends 
         SET status = ?
         WHERE id = ?;`,
        [response.toUpperCase(), id]
      );

      await connection.commit();

      if (!requestAccepted) {
        await connection.beginTransaction();

        await connection.query(
          `DELETE FROM friends
           WHERE id = ?;`,
          [id]
        );
        await connection.commit();
      }

      return requestAccepted
        ? "Friend request accepted"
        : "Friend request rejected";
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  }
}
