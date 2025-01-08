import { CustomError } from "../utils/errors/customErrors.js";
import { errors } from "../utils/errors/errors.js";
import { ReusableFunctions } from "../utils/reusable_functions.js";

export class MessagesDao {
  constructor(pool) {
    this.pool = pool;
  }
  async getChat({ sender, receiver }) {
    const connection = await this.pool.getConnection();
    try {
      const receiver_id = await ReusableFunctions.getId(
        "user",
        receiver,
        connection
      );

      const sender_id = await ReusableFunctions.getId(
        "user",
        sender,
        connection
      );

      let chat = await ReusableFunctions.getChat(
        sender_id,
        receiver_id,
        connection
      );

      return chat;
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
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
           ORDER BY sent_at DESC;`,
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
    } finally {
      connection.release();
    }
  }
  async editMessage({ messageId, newMessage }) {
    //sender id is not checked because only the sender will be given
    //the option to edit the message on the fron end
    const connection = await this.pool.getConnection();
    try {
      const isMessageTooLong = newMessage.length > 500;

      if (isMessageTooLong) {
        return CustomError.newError(errors.error.messageTooLong);
      }

      await connection.beginTransaction();

      await connection.query(
        `UPDATE messages 
         SET message = ? 
         WHERE id = ?;`,
        [newMessage, messageId]
      );

      await connection.commit();

      const [messageInfo] = await connection.query(
        `SELECT username, message FROM messages
        JOIN user ON user.id = messages.sender_id
         WHERE messages.id = ?;`,
        [messageId]
      );

      return {
        message: "message edited",
        result: {
          sent_by: messageInfo[0].username,
          newMessage: messageInfo[0].message,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  async deleteMessage({ messageId }) {
    {
      const connection = await this.pool.getConnection();
      try {
        await connection.beginTransaction();

        await connection.query(`DELETE FROM messages WHERE id = ?;`, [
          messageId,
        ]);

        await connection.commit();

        return { message: "Message deleted" };
      } catch (error) {
        connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
  }
}
