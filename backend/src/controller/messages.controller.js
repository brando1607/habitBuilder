import { DaoIndex } from "../dao/dao.index.js";
import { verifyToken } from "../utils/jwt.js";

export class MessagesController {
  static async getChat(req, res, next) {
    try {
      const sender = verifyToken(req.cookies.token);
      const { receiver } = req.params;

      const result = await DaoIndex.messagesDao.getChat({
        sender: sender.login,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async sendMessage(req, res, next) {
    try {
      const viewer = verifyToken(req.cookies.token);

      const user = req.params.username;
      const { message } = req.body;

      let result = await DaoIndex.messagesDao.sendMessage({
        message,
        viewer: viewer.login,
        user,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async editMessage(req, res, next) {
    try {
      const { id, newMessage } = req.body;

      const result = await DaoIndex.messagesDao.editMessage({
        messageId: id,
        newMessage,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async deleteMessage(req, res, next) {
    try {
      const { id } = req.body;
      const result = await DaoIndex.messagesDao.deleteMessage({
        messageId: id,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
