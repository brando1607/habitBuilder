import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";
import { ReusableFunctions } from "../utils/reusable_functions.js";

export class MessagesDao {
  constructor(pool) {
    this.pool = pool;
  }
  async sendMessage({ message, viewer, user }) {
    const connection = await this.pool.getConnection();
    try {
      const userId = await ReusableFunctions.getId("user", user, connection);
      const viewerId = await ReusableFunctions.getId(
        "user",
        viewer,
        connection
      );

      const isMessageTooLong = message.length > 500;

      if (isMessageTooLong) {
        return CustomError.newError(errors.error.messageTooLong);
      }

      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO messages (sender_id, receiver_id, message)
           VALUES(?,?,?);`,
        [viewerId, userId, message]
      );

      await connection.commit();

      const [messageInfo] = await connection.query(
        `SELECT * FROM messages 
           WHERE sender_id = ? AND receiver_id = ? AND message = ?
           ORDER BY id DESC;`,
        [viewerId, userId, message]
      );

      const result = {
        id: messageInfo[0].id,
        from: viewer,
        to: user,
        message: messageInfo[0].message,
        at: messageInfo[0].sent_at,
      };

      return { message: "Message sent", result };
    } catch (error) {
      connection.rollback();
      throw error;
    }
  }
}
