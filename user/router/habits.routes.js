import Router from "express";
export const habitsRoutes = Router();
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";

habitsRoutes.post(
  "/addHabit/:username",
  passportCall("jwt", { session: false }),
  IndexController.habitsController.addHabit
);

habitsRoutes.put(
  "/completeHabit/:username",
  passportCall("jwt", { session: false }),
  IndexController.habitsController.completeHabit
);

habitsRoutes.delete(
  "/deleteHabit/:username",
  passportCall("jwt", { session: false }),
  IndexController.habitsController.deleteHabit
);
