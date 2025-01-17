import { ReusableFunctions } from "../utils/reusable_functions.js";
import { client } from "../utils/redisConfig.js";

export class StatisticsDao {
  constructor(pool) {
    this.pool = pool;
  }

  async rankingInUsersCountry({ username }) {
    const connection = await this.pool.getConnection();

    try {
      const [getUserCountry] = await connection.query(
        `SELECT country FROM user 
         WHERE username = ?;`,
        [username]
      );

      const { country } = getUserCountry[0];

      const cachedData = await client.get(`getRanking:${country}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const [getRanking] = await connection.query(
        `SELECT id, username, theme, COUNT(status) AS HabitsCompleted, country FROM user
         JOIN daily_habit_status ON daily_habit_status.user_id = user.id
         WHERE status = 'COMPLETED'
         GROUP BY user.id
         HAVING country = ?
         ORDER BY HabitsCompleted DESC;
    `,
        [country]
      );

      await client.set(`getRanking:${country}`, JSON.stringify(getRanking), {
        EX: 600,
      });

      return getRanking;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async rankingWorlWide() {
    const connection = await this.pool.getConnection();
    try {
      const cachedData = await client.get("worldRanking");

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const [worldRanking] =
        await connection.query(`SELECT id, username, COUNT(status) AS HabitsCompleted, country FROM user
           JOIN daily_habit_status ON daily_habit_status.user_id = user.id
           WHERE status = 'COMPLETED'
           GROUP BY country, user.id
           ORDER BY HabitsCompleted DESC;
`);

      await client.set("worldRanking", JSON.stringify(worldRanking), {
        EX: 600,
      });

      return worldRanking;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async themeWorldWideRanking({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const [getCountry] = await connection.query(
        `SELECT theme FROM user 
         WHERE username = ?;`,
        [username]
      );

      const { theme } = getCountry[0];

      const cachedData = await client.get(`themeWorldWideRanking:${theme}`);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const [themeWorldWideRanking] = await connection.query(
        `SELECT id, username, theme, COUNT(status) AS HabitsCompleted, country FROM user
        JOIN daily_habit_status ON daily_habit_status.user_id = user.id
        WHERE status = 'COMPLETED'
        GROUP BY theme, user.id
        HAVING theme = ?
        ORDER BY HabitsCompleted DESC;
`,
        [theme]
      );

      await client.set(
        `themeWorldWideRanking:${theme}`,
        JSON.stringify(themeWorldWideRanking),
        { EX: 600 }
      );

      return themeWorldWideRanking;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async rankingInUsersCountryByTheme({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const [getCountryAndTheme] = await connection.query(
        `SELECT country, theme FROM user 
         WHERE username = ?;`,
        [username]
      );

      const { country, theme } = getCountryAndTheme[0];

      const cachedData = await client.get(
        `rankingInUsersCountryByTheme:${country}:${theme}`
      );

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const [rankingInUsersCountryByTheme] = await connection.query(
        `SELECT id, username, theme, COUNT(status) AS HabitsCompleted, country FROM user
         JOIN daily_habit_status ON daily_habit_status.user_id = user.id
         WHERE status = 'COMPLETED'
         GROUP BY user.id
         HAVING country = ? AND theme = ?
         ORDER BY HabitsCompleted DESC;
`,
        [country, theme]
      );

      await client.set(
        `rankingInUsersCountryByTheme:${country}:${theme}`,
        JSON.stringify(rankingInUsersCountryByTheme),
        { EX: 600 }
      );

      return rankingInUsersCountryByTheme;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async atLeast45Completions({ username }) {
    const connection = await this.pool.getConnection();
    try {
      const user_id = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );
      const [search] = await connection.query(
        `SELECT habit_id FROM habit_completion 
         WHERE times_completed >= 45 AND user_id = ?;`,
        [user_id]
      );
      return search.length > 0
        ? search
        : "No habits with at least 45 completions yet";
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
  async mostFrequentDays({ username, id }) {
    const connection = await this.pool.getConnection();
    try {
      const user_id = await ReusableFunctions.getId(
        "user",
        username,
        connection
      );
      const [mostFrequentDays] = await connection.query(
        `SELECT habits.habit, day, COUNT(day) AS TimesComletedOnThatDay FROM days
         JOIN daily_habit_status ON daily_habit_status.id_day = days.id
         JOIN habits ON habits.id = habit_status.habit_id
         WHERE daily_habit_status.habit_id = ? AND daily_habit_status.user_id = ?
         GROUP BY day
         ORDER BY TimesCompletedOnThatDay DESC;
`,
        [id, user_id]
      );

      return mostFrequentDays;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}
