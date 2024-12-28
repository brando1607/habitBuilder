import Router from "express";
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createBadgesAndLevelsRouter = ({ DaoIndex }) => {
  const badgesAndLevelsRoutes = Router();

  const indexController = new IndexController({ DaoIndex });

  badgesAndLevelsRoutes.post(
    "/sendToPendingBadges/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.badgesAndLevelsController.sendToPendingBadges
  );

  badgesAndLevelsRoutes.get(
    "/getUserAndBadgeLevels",
    indexController.badgesAndLevelsController.getUserAndBadgeLevels
  );

  badgesAndLevelsRoutes.get(
    "/getBadges",
    indexController.badgesAndLevelsController.getBadges
  );

  badgesAndLevelsRoutes.post(
    "/evaluateBadge",
    indexController.badgesAndLevelsController.evaluateBadge
  );
  return badgesAndLevelsRoutes;
};
