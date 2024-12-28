import Router from "express";
export const habitsRoutes = Router();
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

habitsRoutes.post(
  "/addHabit/:username",
  checkUsernameInUrl(),
  passportCall("jwt", { session: false }),
  IndexController.habitsController.addHabit
);

habitsRoutes.put(
  "/completeHabit/:username",
  passportCall("jwt", { session: false }),
  checkUsernameInUrl(),
  IndexController.habitsController.completeHabit
);

habitsRoutes.delete(
  "/deleteHabit/:username",
  passportCall("jwt", { session: false }),
  checkUsernameInUrl(),
  IndexController.habitsController.deleteHabit
);
