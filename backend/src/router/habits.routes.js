import Router from "express";
import { HabitsController } from "../controller/habits.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";
import { userExists } from "../middlewares/checkIfUserExists.middleware.js";

export const createHabitsRouter = ({ DaoIndex }) => {
  const habitsRoutes = Router();

  const habitsController = new HabitsController({ DaoIndex });

  habitsRoutes.post(
    "/addHabit/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    habitsController.addHabit
  );

  habitsRoutes.put(
    "/completeHabit/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    habitsController.completeHabit
  );

  habitsRoutes.delete(
    "/deleteHabit/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    habitsController.deleteHabit
  );
  return habitsRoutes;
};
