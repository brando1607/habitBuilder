import { ReusableFunctions } from "../utils/reusable_functions.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { client } from "../utils/redisConfig.js";

export class ProfileDao {
  constructor(pool) {
    this.pool = pool;
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
      throw error;
    }
  }

  async profile({ username, viewer }) {
    const connection = await this.pool.getConnection();
    try {
      const cachedData = await client.get(`userInformation:${username}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

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
        `SELECT h.habit, c.times_completed FROM habit_completion c
         JOIN habits h ON h.id = c.habit_id
         WHERE user_id = ? AND c.times_completed > 0
         ORDER BY times_completed DESC LIMIT 3;`,
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
        threeMostCompletedHabits:
          getHabits.length > 0 ? getHabits : "No habits completed yet.",
      };

      await client.set(
        `userInformation:${username}`,
        JSON.stringify(userInformation),
        {
          EX: 600,
        }
      );

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
      const cachedData = await client.get(`userAchievements:${username}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );
      const [getHabitsWithBadge] = await connection.query(
        `SELECT badges.badge, badge_level, h.habit, c.times_completed FROM habit_completion c
         JOIN habits h ON h.id = c.habit_id 
         JOIN badges ON badges.id = c.badge_id 
         WHERE c.user_id = ?;`,
        [userId]
      );
      const [getHabitsWithoutBadge] = await connection.query(
        `SELECT h.habit, times_completed FROM habit_completion c
        JOIN habits h ON h.id = c.habit_id
         WHERE badge_id IS NULL AND user_id = ?;`,
        [userId]
      );

      const userAchievements = {
        badge:
          getHabitsWithBadge.length < 1 ? "No habits yet" : getHabitsWithBadge,
        noBadge:
          getHabitsWithoutBadge.length < 1
            ? "No habits yet"
            : getHabitsWithoutBadge,
      };

      await client.set(
        `userAchievements:${username}`,
        JSON.stringify(userAchievements),
        {
          EX: 600,
        }
      );

      return userAchievements;
    } catch (error) {
      throw error;
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
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async getFriendRequests({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const cachedData = await client.get("getRequests");

      if (cachedData) {
        const friendRequests = JSON.parse(cachedData);

        return friendRequests.length > 0
          ? friendRequests
          : "No friend requests at the moment.";
      }

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

      await client.set("getRequests", JSON.stringify(getRequests), {
        EX: 600,
      });

      return getRequests.length > 0
        ? getRequests
        : "No friend requests at the moment.";
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async getFriends({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const cachedData = await client.get(`getFriends:${username}`);

      if (cachedData) {
        const friends = JSON.parse(cachedData);

        return friends.length > 0 ? friends : "No friends yet.";
      }

      const userId = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );

      const [getFriends] = await connection.query(
        `SELECT first_name, last_name FROM friends
         JOIN user ON user.id = friend_2 
         WHERE friend_1 = ? AND status = 'ACCEPTED'
         UNION 
         SELECT first_name, last_name FROM friends 
         JOIN user ON user.id = friend_1 
         WHERE friend_2 = ? AND status = 'ACCEPTED';`,
        [userId, userId]
      );

      await client.set(`getFriends:${username}`, JSON.stringify(getFriends), {
        EX: 600,
      });

      return getFriends.length > 0 ? getFriends : "No friends yet.";
    } catch (error) {
      throw error;
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
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
