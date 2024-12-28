import { Router } from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { IndexController } from "../controller/index.controller.js";

export const createMessagesRouter = ({ DaoIndex }) => {
  const messagesRouter = Router();

  const indexController = new IndexController({ DaoIndex });

  messagesRouter.get(
    "/getChat/:receiver",
    passportCall("jwt", { session: false }),
    indexController.messagesController.getChat
  );

  messagesRouter.post(
    "/sendMessage/:username",
    passportCall("jwt", { session: false }),
    indexController.messagesController.sendMessage
  );

  messagesRouter.put(
    "/editMessage",
    indexController.messagesController.editMessage
  );

  messagesRouter.delete(
    "/deleteMessage",
    indexController.messagesController.deleteMessage
  );

  return messagesRouter;
};
