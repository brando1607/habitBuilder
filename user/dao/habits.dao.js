import { ReusableFunctions } from "../utils/reusable_functions.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";

export class HabitsDAO {
  constructor(pool) {
    this.pool = pool;
  }

  async assignBadge({ habit, username }) {
    let connection = await this.pool.getConnection();

    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);

      console.log(user_id);

      let [getKeyWords] = await connection.query(`SELECT keyword FROM badges`);

      let match = getKeyWords.filter((e) =>
        habit.toLowerCase().includes(e.keyword)
      );

      let [hasHabitBeenCompletedBefore] = await connection.query(
        `SELECT habit FROM habit_completion WHERE user_id = ? AND habit = ?;`,
        [user_id, habit]
      );

      if (match.length === 1) {
        await connection.beginTransaction();
        let badge_id = await ReusableFunctions.getId(
          "badge",
          match[0].keyword,
          connection
        );
        await connection.commit();

        if (hasHabitBeenCompletedBefore.length < 1) {
          await connection.beginTransaction();
          await connection.query(
            `INSERT INTO habit_completion(user_id, habit, badge_id, badge_level) VALUES (?,?,?, ?);`,
            [user_id, habit, badge_id, "NO LEVEL"]
          );
          await connection.commit();
        }

        return true;
      } else {
        await connection.beginTransaction();

        if (hasHabitBeenCompletedBefore.length < 1) {
          await connection.query(
            `INSERT INTO habit_completion(user_id, habit) VALUES (?,?);`,
            [user_id, habit]
          );
        }

        await connection.commit();
        return false;
      }
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async addFrequency({ habit, deadline }) {
    let connection = await this.pool.getConnection();

    try {
      let [dayForDeadline] = await connection.query(
        `SELECT DAYNAME(?) AS 'day';`,
        [deadline]
      );
      let { day } = dayForDeadline[0];
      let id_day = await ReusableFunctions.getId("day", day, connection);

      let [habitId] = await connection.query(
        `SELECT id FROM user_habits WHERE habit = ? AND deadline = ?;`,
        [habit, deadline]
      );
      let { id } = habitId[0];

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO frequency(habit_id, id_day) VALUES(?, ?);`,
        [id, id_day]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async addHabitAndIncreaseCounter({ habit, deadline, username }) {
    let connection = await this.pool.getConnection();

    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);

      await connection.beginTransaction();
      await connection.query(
        `INSERT INTO user_habits(user_id, habit, deadline) VALUES (?, ?, ?);`,
        [user_id, habit, deadline]
      );
      await connection.commit();

      let [getStatus] = await connection.query(
        `SELECT status FROM user_habits WHERE habit = ? AND deadline = ?;`,
        [habit, deadline]
      );
      let { status } = getStatus[0];

      if (status === "IN PROGRESS") {
        await connection.beginTransaction();
        await connection.query(
          `UPDATE user SET amount_in_progress = amount_in_progress + 1 WHERE id = ?;`,
          [user_id]
        );
        await connection.commit();
      } else {
        await connection.beginTransaction();
        await connection.query(
          `UPDATE user SET amount_scheduled = amount_scheduled + 1 WHERE id = ?;`,
          [user_id]
        );
        await connection.commit();
      }
    } catch (error) {
      await connection.rollback();
      console.error(error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async addHabit({ input, username }) {
    let connection = await this.pool.getConnection();

    let { habit, deadline } = input;

    try {
      const habitFound = await ReusableFunctions.findHabit(
        habit,
        deadline,
        connection
      );
      if (habitFound) return CustomError.newError(errors.conflict.habit);

      await this.addHabitAndIncreaseCounter({ habit, deadline, username });

      const badgeAssigned = await this.assignBadge({ habit, username });

      await this.addFrequency({ habit, deadline });

      return badgeAssigned
        ? "Habit added and badge assigned"
        : "Habit added without badge";
    } catch (error) {
      await connection.rollback();
      console.error(error);
      throw error;
    } finally {
      connection.release();
    }
  }
  async checkBadges({ habit, username }) {
    let connection = await this.pool.getConnection();
    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);
      let [getBadgeId] = await connection.query(
        `SELECT badge_id FROM habit_completion WHERE habit = ? AND user_id = ?;`,
        [habit, user_id]
      );
      let { badge_id } = getBadgeId[0];
      return badge_id;
    } catch (error) {
      console.error(error);
    }
  }
  async givePoints({ habit, username }) {
    let connection = await this.pool.getConnection();
    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);
      let [getCompletion] = await connection.query(
        `SELECT times_completed FROM habit_completion WHERE user_id = ? AND habit = ?;`,
        [user_id, habit]
      );
      let { times_completed } = getCompletion[0];
      let [getAllPoints] = await connection.query(
        `SELECT points_or_completions_required FROM levels WHERE badge_level IS NOT NULL;`
      );
      let points = getAllPoints.reduce((acc, e) => {
        if (e.points_or_completions_required <= times_completed) {
          acc.push(e.points_or_completions_required);
        }
        return acc;
      }, []);
      let required = Math.max(...points);
      let [getPoints] = await connection.query(
        `SELECT points_given FROM levels WHERE points_or_completions_required = ? AND badge_level IS NOT NULL;`,
        [required]
      );

      let { points_given } = getPoints[0];

      await connection.beginTransaction();

      await connection.query(
        `UPDATE user SET points = points + ? WHERE username = ?;`,
        [points_given, username]
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async checkUserLevel({ username }) {
    let connection = await this.pool.getConnection();
    try {
      let [getPoints] = await connection.query(
        `SELECT points FROM user WHERE username = ?;`,
        [username]
      );
      let { points } = getPoints[0];
      let [idWithNewPoints] = await connection.query(
        `SELECT id FROM levels WHERE user_level IS NOT NULL AND points_or_completions_required <= ? ORDER BY points_or_completions_required DESC LIMIT 1;`,
        [points]
      );

      let { id } = idWithNewPoints[0];
      let user_id = await ReusableFunctions.getId("user", username, connection);

      let [currendLevelId] = await connection.query(
        `SELECT level_id FROM user_level WHERE user_id = ?;`,
        [user_id]
      );

      let { level_id } = currendLevelId[0];

      if (id > level_id) {
        await connection.beginTransaction();
        await connection.query(`UPDATE user_level SET level_id = ?;`, [id]);
        await connection.commit();
      }
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async checkBadgeLevel({ username, habit }) {
    let connection = await this.pool.getConnection();

    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);
      let [getCompletion] = await connection.query(
        `SELECT times_completed FROM habit_completion WHERE user_id = ? AND habit = ?;`,
        [user_id, habit]
      );

      let [currentId] = await connection.query(
        `SELECT badge_level FROM habit_completion WHERE user_id = ? AND habit = ?;`,
        [user_id, habit]
      );
      let { badge_level } = currentId[0];

      let { times_completed } = getCompletion[0];

      let newCompletion = await ReusableFunctions.getIdForLevel(
        "new",
        times_completed,
        connection
      );

      let currentCompletion = await ReusableFunctions.getIdForLevel(
        "current",
        badge_level,
        connection
      );

      if (newCompletion > currentCompletion) {
        let [newLevelName] = await connection.query(
          `SELECT badge_level FROM levels WHERE id = ?;`,
          [newCompletion]
        );
        let { badge_level } = newLevelName[0];

        await connection.beginTransaction();

        await connection.query(
          `UPDATE habit_completion SET badge_level = ? WHERE habit = ? AND user_id = ?;`,
          [badge_level, habit, user_id]
        );
        await connection.commit();
      }
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
  async completeHabit({ username, input }) {
    let connection = await this.pool.getConnection();
    let { habit, deadline } = input;

    try {
      await this.checkUserLevel({ username });

      const habitFound = await ReusableFunctions.findHabit(
        habit,
        deadline,
        connection
      );
      if (!habitFound) return `Habit not found.`;

      let user_id = await ReusableFunctions.getId("user", username, connection);
      let habit_id = await ReusableFunctions.getId("habit", habit, connection);
      await connection.beginTransaction();
      await connection.query(
        `UPDATE user_habits SET status = 'COMPLETED' WHERE habit = ? AND id = ?;`,
        [habit, habit_id]
      );

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `DELETE FROM user_habits WHERE habit = ? AND id = ?;`,
        [habit, habit_id]
      );

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `UPDATE user SET amount_in_progress = amount_in_progress - 1 WHERE username = ?;`,
        [username]
      );
      await connection.commit();

      await this.givePoints({ habit, username });

      await connection.beginTransaction();

      await connection.query(
        `UPDATE habit_completion SET times_completed = times_completed + 1 WHERE habit = ? AND user_id = ?;`,
        [habit, user_id]
      );

      await connection.commit();

      await this.checkUserLevel({ username });

      if ((await this.checkBadges({ habit, username })) !== null) {
        await this.checkBadgeLevel({ username, habit });
      }

      return `Habit completed`;
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return error.sqlMessage;
    } finally {
      connection.release();
    }
  }
  async deleteHabit({ input, username }) {
    let { habit, deadline } = input;
    let connection = await this.pool.getConnection();

    try {
      let user_id = await ReusableFunctions.getId("user", username, connection);

      await connection.beginTransaction();

      const habitFound = await ReusableFunctions.findHabit(
        habit,
        deadline,
        connection
      );

      if (!habitFound) return `Habit not found, or not added on that day.`;

      await ReusableFunctions.decreaseCurrendOrScheduledHabits(
        habit,
        deadline,
        username,
        connection
      );
      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `DELETE FROM user_habits WHERE user_id = ? AND habit = ? AND deadline = ?;`,
        [user_id, habit, deadline]
      );

      await connection.commit();

      await connection.beginTransaction();

      await connection.query(
        `UPDATE habit_completion SET times_not_completed = times_not_completed + 1 WHERE habit = ?;`,
        [habit]
      );

      await connection.commit();

      return `Habit deleted`;
    } catch (error) {
      await connection.rollback();
      console.error(error);
    } finally {
      connection.release();
    }
  }
}
