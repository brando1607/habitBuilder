import { Router } from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { IndexController } from "../controller/index.controller.js";

export const messagesRouter = Router();

messagesRouter.post(
  "/sendMessage/:username",
  passportCall("jwt", { session: false }),
  IndexController.messagesController.sendMessage
);
