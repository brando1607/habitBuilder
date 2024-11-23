import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";
import { sendEmail } from "../utils/nodemailer.js";
import { encryption } from "../utils/encryptAndDecryptFunctions.js";

export class BadgesAndLevelsDAO {
  constructor(pool) {
    this.pool = pool;
  }
  async getUserAndBadgeLevels() {
    const connection = await this.pool.getConnection();
    try {
      const [getUserLevels] = await connection.query(
        `SELECT theme, level_name, level_number, points_or_completions_required FROM levels JOIN themes ON themes.level_number = levels.user_level;`
      );
      const [getBadgeLevels] = await connection.query(
        `SELECT badge_level, points_or_completions_required, points_given FROM levels WHERE user_level IS NULL;`
      );
      return { userLevels: getUserLevels, badgeLevels: getBadgeLevels };
    } catch (error) {
      console.error(error);
    }
  }
  async getBadges() {
    const connection = await this.pool.getConnection();
    try {
      const [getBadges] = await connection.query(
        `SELECT badge, keyword, username AS "created by" FROM badges;`
      );
      return getBadges;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async sendToPendingBadges({ input, username }) {
    const connection = await this.pool.getConnection();
    const { badge, keyword } = input;
    try {
      const [getBadges] = await connection.query(
        `SELECT badge FROM pending_badges WHERE badge = ? OR keyword = ?;`,
        [badge, keyword]
      );

      if (getBadges.length === 0) {
        await connection.beginTransaction();
        await connection.query(
          `INSERT INTO pending_badges(badge, keyword, username) VALUES(?,?,?);`,
          [badge, keyword, username]
        );
        await connection.commit();

        return `Badge sent to be evaluated`;
      } else {
        throw CustomError.newError(errors.conflict.badge);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async evaluateBadge({ id, accepted }) {
    const connection = await this.pool.getConnection();
    try {
      const [getBadge] = await connection.query(
        `SELECT badge, keyword, username FROM pending_badges WHERE id = ?;`,
        [id]
      );
      const { badge, keyword, username } = getBadge[0];

      const [getUserEmail] = await connection.query(
        `SELECT user_email FROM user WHERE username = ?;`,
        [username]
      );
      const email = encryption.decrypt(getUserEmail[0].user_email);

      const text = accepted
        ? `We appreciate your contribution to our community. We are glad to inform you your badge ${badge} has been approved!`
        : `We appreciate your contribution to our community. We have unfortunately decided not to accept your badge suggestion. Please don't hesitate to send over more of your ideas!`;

      const subject = "The habit builder badge you suggested.";

      if (accepted) {
        await connection.beginTransaction();

        await connection.query(
          `INSERT INTO badges(badge, keyword, username) VALUES(?,?,?);`,
          [badge, keyword, username]
        );

        await connection.commit();
      }

      await connection.beginTransaction();

      await connection.query(`DELETE FROM pending_badges WHERE id = ?;`, [id]);

      await connection.commit();

      await sendEmail(email, text, subject);

      return accepted
        ? "Badge accepted and email sent to user."
        : "Badge rejected and email sent to user";
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
