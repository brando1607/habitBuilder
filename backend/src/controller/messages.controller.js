import { MessagesService } from "../service/messages.service.js";

export class MessagesController {
  constructor({ DaoIndex }) {
    this.messagesService = new MessagesService({ DaoIndex });
  }
  getChat = async (req, res, next) => {
    try {
      const { token } = req.cookies;
      const { receiver } = req.params;

      const result = await this.messagesService.getChat({
        token,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendMessage = async (req, res, next) => {
    try {
      const { token } = req.cookies;

      const user = req.params.username;
      const { message } = req.body;

      let result = await this.messagesService.sendMessage({
        message,
        token,
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

      const result = await this.messagesService.editMessage({
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
      const result = await this.messagesService.deleteMessage({
        messageId: id,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
