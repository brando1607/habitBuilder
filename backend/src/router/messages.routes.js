import { Router } from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { MessagesController } from "../controller/messages.controller.js";

export const createMessagesRouter = ({ DaoIndex }) => {
  const messagesRouter = Router();

  const messagesController = new MessagesController({ DaoIndex });

  messagesRouter.get(
    "/getChat/:receiver",
    passportCall("jwt", { session: false }),
    messagesController.getChat
  );

  messagesRouter.post(
    "/sendMessage/:username",
    passportCall("jwt", { session: false }),
    messagesController.sendMessage
  );

  messagesRouter.put("/editMessage", messagesController.editMessage);

  messagesRouter.delete("/deleteMessage", messagesController.deleteMessage);

  return messagesRouter;
};
