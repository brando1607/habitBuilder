import { Router } from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { MessagesController } from "../controller/messages.controller.js";
import { userExists } from "../middlewares/checkIfUserExists.middleware.js";

export const createMessagesRouter = ({ DaoIndex }) => {
  const messagesRouter = Router();

  const messagesController = new MessagesController({ DaoIndex });

  messagesRouter.get(
    "/getChat/:receiver",
    passportCall("jwt", { session: false }),
    userExists(),
    messagesController.getChat
  );

  messagesRouter.post(
    "/sendMessage/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    messagesController.sendMessage
  );

  //no middlewares because this is supposed to be a button only accessible through the chat
  messagesRouter.put("/editMessage", messagesController.editMessage);

  messagesRouter.delete("/deleteMessage", messagesController.deleteMessage);

  return messagesRouter;
};
