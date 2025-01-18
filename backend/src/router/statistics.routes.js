import Router from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { StatisticsController } from "../controller/statistics.controller.js";
import { userExists } from "../middlewares/checkIfUserExists.middleware.js";

export const createStatisticsRouter = ({ DaoIndex }) => {
  const statisticsRouter = Router();

  const statisticsController = new StatisticsController({ DaoIndex });

  statisticsRouter.get(
    "/rankingInUsersCountry/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    statisticsController.rankingInUsersCountry
  );

  statisticsRouter.get(
    "/rankingWorlWide",
    passportCall("jwt", { session: false }),
    statisticsController.rankingWorlWide
  );

  statisticsRouter.get(
    "/themeWorldWideRanking/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    statisticsController.themeWorldWideRanking
  );

  statisticsRouter.get(
    "/rankingInUsersCountryByTheme/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    statisticsController.rankingInUsersCountryByTheme
  );

  statisticsRouter.get(
    "/atLeast45Completions/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    statisticsController.atLeast45Completions
  );

  statisticsRouter.get(
    "/mostFrequentDays/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    statisticsController.mostFrequentDays
  );

  return statisticsRouter;
};
