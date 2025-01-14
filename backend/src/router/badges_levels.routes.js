import Router from "express";
import { BadgesAndLevelsController } from "../controller/badges_levels.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";
import { userExists } from "../middlewares/checkIfUserExists.middleware.js";

export const createBadgesAndLevelsRouter = ({ DaoIndex }) => {
  const badgesAndLevelsRoutes = Router();

  const badgesAndLevelsController = new BadgesAndLevelsController({ DaoIndex });

  badgesAndLevelsRoutes.post(
    "/sendToPendingBadges/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    badgesAndLevelsController.sendToPendingBadges
  );

  badgesAndLevelsRoutes.get(
    "/getUserAndBadgeLevels",
    badgesAndLevelsController.getUserAndBadgeLevels
  );

  badgesAndLevelsRoutes.get("/getBadges", badgesAndLevelsController.getBadges);

  badgesAndLevelsRoutes.post(
    "/evaluateBadge",
    badgesAndLevelsController.evaluateBadge
  );
  return badgesAndLevelsRoutes;
};
