import { verifyToken } from "../utils/jwt.js";

export class MessagesController {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  getChat = async (req, res, next) => {
    try {
      const sender = verifyToken(req.cookies.token);
      const { receiver } = req.params;

      const result = await this.daoIndex.messagesDao.getChat({
        sender: sender.login,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendMessage = async (req, res, next) => {
    try {
      const viewer = verifyToken(req.cookies.token);

      const user = req.params.username;
      const { message } = req.body;

      let result = await this.daoIndex.messagesDao.sendMessage({
        message,
        viewer: viewer.login,
        user,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  editMessage = async (req, res, next) => {
    try {
      const { id, newMessage } = req.body;

      const result = await this.daoIndex.messagesDao.editMessage({
        messageId: id,
        newMessage,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.body;
      const result = await this.daoIndex.messagesDao.deleteMessage({
        messageId: id,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
