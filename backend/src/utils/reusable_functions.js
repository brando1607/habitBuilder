import crypto from "crypto";
import bcrypt from "bcrypt";

export class ReusableFunctions {
  static generateRandomString(length) {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
  }

  static passwordSaltRound = 10;

  static findUser = async (login, connection, hashedEmail) => {
    try {
      const [user] = await connection.query(
        "SELECT username, password, user_email FROM user LEFT JOIN passwords ON user.id = passwords.user_id WHERE user_email = ? OR username = ?",
        [hashedEmail, login]
      );
      return user;
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  };

  static deleteTempPassword = async (newpass, username, connection) => {
    try {
      await connection.beginTransaction();
      await connection.query(
        `UPDATE passwords SET password = ?, temporary_password = NULL, time_stamp = NULL WHERE user_id = (SELECT id FROM user WHERE username = ?);`,
        [newpass, username]
      );
      await connection.commit();
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  };
  static validatePassword = async (password, table, column) => {
    //the table parameter will contain an array with an object
    // with the username, password and email for the user
    //so the second parameter in the compare function will get the user's password
    const validPassword = await bcrypt.compare(password, table[0][`${column}`]);
    return validPassword;
  };

  static getId = async (id, element, connection) => {
    try {
      if (id === "badge") {
        let [badgeId] = await connection.query(
          `SELECT id FROM badges WHERE keyword = ?;`,
          [element]
        );
        let { id } = badgeId[0];
        return id;
      } else if (id === "user") {
        let [userId] = await connection.query(
          `SELECT id FROM user WHERE username = ?;`,
          [element]
        );
        let { id } = userId[0];
        return id;
      } else if (id === "day") {
        let [dayId] = await connection.query(
          `SELECT id FROM days WHERE day = ?;`,
          [element]
        );
        let { id } = dayId[0];
        return id;
      } else if (id === "habit") {
        let [habitId] = await connection.query(
          `SELECT id FROM habits WHERE habit = ?;`,
          [element]
        );

        let { id } = habitId[0];
        return id;
      }
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  };

  static getIdForLevel = async (completion, element, connection) => {
    try {
      if (completion === "new") {
        let [idWithNewCompletion] = await connection.query(
          `SELECT id FROM levels WHERE badge_level IS NOT NULL AND points_or_completions_required <= ? ORDER BY points_or_completions_required DESC LIMIT 1;`,
          [element]
        );
        let { id } = idWithNewCompletion[0];
        return id;
      } else if (completion === "current") {
        let [idForCurrentLevel] = await connection.query(
          `SELECT id FROM levels WHERE badge_level IS NOT NULL AND badge_level = ?;`,
          [element]
        );
        let { id } = idForCurrentLevel[0];
        return id;
      }
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  };

  static decreaseCurrendOrScheduledHabits = async (
    habit_id,
    deadline,
    username,
    connection
  ) => {
    try {
      let [getStatus] = await connection.query(
        `SELECT status FROM user_habits WHERE habit_id = ? AND deadline = ?;`,
        [habit_id, deadline]
      );

      let { status } = getStatus[0];

      if (status === "IN PROGRESS") {
        await connection.beginTransaction();
        await connection.query(
          `UPDATE user SET amount_in_progress = amount_in_progress - 1 WHERE username = ?;`,
          [username]
        );
        await connection.commit();
      } else {
        await connection.beginTransaction();
        await connection.query(
          `UPDATE user SET amount_scheduled = amount_scheduled - 1 WHERE username = ?;`,
          [username]
        );
        await connection.commit();
      }
    } catch (error) {
      connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  };
  static findHabit = async (habit, connection) => {
    let [findHabit] = await connection.query(
      `SELECT habits.habit FROM user_habits JOIN habits ON habits.id = user_habits.habit_id WHERE habits.habit = ?;`,
      [habit]
    );

    return findHabit.length > 0;
  };
  static getChat = async (sender_id, receiver_id, connection) => {
    try {
      const [chat] = await connection.query(
        `SELECT id, username, message, sent_at FROM (
          SELECT m.id AS id, username, m.message, m.sent_at 
          FROM user
          JOIN messages m ON sender_id = user.id
          WHERE receiver_id = ?
          UNION
          SELECT m.id AS id, username, m.message, m.sent_at
          FROM user
          JOIN messages m ON sender_id = user.id
          WHERE receiver_id = ?
          ) AS combined_messages
        ORDER BY sent_at ASC;
`,
        [sender_id, receiver_id]
      );
      return chat;
    } catch (error) {
      throw error;
    }
  };
}
