import { verifyToken } from "../utils/jwt.js";

export class MessagesService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  getChat = async ({ token, receiver }) => {
    try {
      const sender = verifyToken(token);

      const result = await this.daoIndex.messagesDao.getChat({
        sender: sender.login,
        receiver,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };
  sendMessage = async ({ message, token, user }) => {
    try {
      const viewer = verifyToken(token);

      let result = await this.daoIndex.messagesDao.sendMessage({
        message,
        viewer: viewer.login,
        user,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };
  editMessage = async ({ messageId, newMessage }) => {
    try {
      const result = await this.daoIndex.messagesDao.editMessage({
        messageId,
        newMessage,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
  deleteMessage = async ({ messageId }) => {
    try {
      const result = await this.daoIndex.messagesDao.deleteMessage({
        messageId,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
}
