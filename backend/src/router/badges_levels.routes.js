import Router from "express";
export const badgesAndLevelsRoutes = Router();
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

badgesAndLevelsRoutes.post(
  "/sendToPendingBadges/:username",
  passportCall("jwt", { session: false }),
  checkUsernameInUrl(),
  IndexController.badgesAndLevelsController.sendToPendingBadges
);

badgesAndLevelsRoutes.get(
  "/getUserAndBadgeLevels",
  IndexController.badgesAndLevelsController.getUserAndBadgeLevels
);

badgesAndLevelsRoutes.get(
  "/getBadges",
  IndexController.badgesAndLevelsController.getBadges
);

badgesAndLevelsRoutes.post(
  "/evaluateBadge",
  IndexController.badgesAndLevelsController.evaluateBadge
);
