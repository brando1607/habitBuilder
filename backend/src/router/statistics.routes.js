import Router from "express";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";
import { StatisticsController } from "../controller/statistics.controller.js";

export const createStatisticsRouter = ({ DaoIndex }) => {
  const statisticsRouter = Router();

  const statisticsController = new StatisticsController({ DaoIndex });

  statisticsRouter.get(
    "/rankingInUsersCountry/:username",
    passportCall("jwt", { session: false }),
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
    statisticsController.themeWorldWideRanking
  );

  statisticsRouter.get(
    "/rankingInUsersCountryByTheme/:username",
    passportCall("jwt", { session: false }),
    statisticsController.rankingInUsersCountryByTheme
  );

  return statisticsRouter;
};
