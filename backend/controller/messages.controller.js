import { DaoIndex } from "../dao/dao.index.js";
import { verifyToken } from "../utils/jwt.js";

export class MessagesController {
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
}
