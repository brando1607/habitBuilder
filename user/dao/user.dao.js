import bcrypt from "bcrypt";
import { ReusableFunctions } from "../utils/reusable_functions.js";
import { encryption } from "../utils/encryptAndDecryptFunctions.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { randomUUID } from "crypto";

export class UserDAO {
  constructor(pool) {
    this.pool = pool;
  }
  async addUser({ user, encryptedEmail, hashedPassword }) {
    const { firstName, lastName, username, theme, dateOfBirth, country } = user;
    const uuid = randomUUID();

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO user(id, first_name, last_name, username, user_email, theme, date_of_birth, country) VALUES(UUID_TO_BIN(?),?,?,?,?,?,?,?);`,
        [
          uuid,
          firstName,
          lastName,
          username,
          encryptedEmail,
          theme,
          dateOfBirth,
          country,
        ]
      );
      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO user_level(user_id) VALUES(UUID_TO_BIN(?));`,
        [uuid]
      );

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO passwords(user_id, password) VALUES(UUID_TO_BIN(?),?);`,
        [uuid, hashedPassword]
      );
      await connection.commit();
      return `User created.`;
    } catch (e) {
      await connection.rollback();
      console.error(`Error adding user`, e.sqlMessage);
      if (e.code === "ER_DUP_ENTRY") {
        if (e.sqlMessage.includes("user_email")) {
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
  async storeTempPassInDB({ username, temporaryPassword }) {
    const connection = await this.pool.getConnection();
    try {
      const hashedTempPassword = await bcrypt.hash(
        temporaryPassword,
        ReusableFunctions.passwordSaltRound
      );

      await connection.beginTransaction();

      await connection.query(
        `UPDATE passwords SET temporary_password = ?, time_stamp = ? WHERE user_id = (SELECT id FROM user WHERE username = ?);`,
        [hashedTempPassword, Date.now() / 1000, username]
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
      let [temporaryPasswords] = await connection.query(
        `SELECT temporary_password, time_stamp FROM passwords WHERE user_id = (SELECT id FROM user WHERE username = ?);`,
        [username]
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
        `SELECT password FROM passwords LEFT JOIN user ON user.id = passwords.user_id WHERE username = ?;`,
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
  async profile({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const [getUserData] = await connection.query(
        `SELECT user.id, first_name, last_name, country, date_of_birth, points, themes.theme, themes.level_name FROM user
        JOIN user_level ON user.id = user_level.user_id
        JOIN themes ON themes.level_number = user_level.level_id  
        WHERE username = ?;`,
        [username]
      );

      const userData = getUserData[0];

      if (!userData) return CustomError.newError(errors.notFound.userNotFound);

      const { id, first_name, last_name, country, points, theme, level_name } =
        userData;

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
        `SELECT badges.badge, badge_level, habit, habit_completion.times_completed FROM habit_completion JOIN badges ON badges.id = habit_completion.badge_id WHERE habit_completion.user_id = ?;`,
        [userId]
      );
      const [getHabitsWithoutBadge] = await connection.query(
        `SELECT habit, habit_completion, times_completed FROM habit_completion WHERE badge_id IS NULL AND user_id = ?;`,
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
    }
  }
  async sendFriendRequest({ sender, receiver }) {
    const connection = await this.pool.getConnection();

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

      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO friends(friend_1, friend_2, status) VALUES(?,?,?);`,
        [senderId, receiverId, "PENDING"]
      );

      await connection.commit();

      return "Friend request sent.";
    } catch (error) {
      console.log(error);
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
        `SELECT first_name, last_name FROM friends
        JOIN user ON friend_1 = user.id
        WHERE friend_2 = ? AND status = 'PENDING';`,
        [receiverId]
      );

      return getRequests.length > 0
        ? getRequests
        : "No friend requests at the moment.";
    } catch (error) {
      console.error(error);
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

      return getFriends.length > 0 ? "hola" : "No friends yet.";
    } catch (error) {
      console.error(error);
    }
  }
}
