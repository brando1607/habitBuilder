import Router from "express";
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createHabitsRouter = ({ DaoIndex }) => {
  const habitsRoutes = Router();

  const indexController = new IndexController({ DaoIndex });

  habitsRoutes.post(
    "/addHabit/:username",
    checkUsernameInUrl(),
    passportCall("jwt", { session: false }),
    indexController.habitsController.addHabit
  );

  habitsRoutes.put(
    "/completeHabit/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.habitsController.completeHabit
  );

  habitsRoutes.delete(
    "/deleteHabit/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.habitsController.deleteHabit
  );
  return habitsRoutes;
};
