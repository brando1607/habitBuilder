import Router from "express";
export const badgesAndLevelsRoutes = Router();
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";

badgesAndLevelsRoutes.post(
  "/sendToPendingBadges/:username",
  passportCall("jwt", { session: false }),
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
  "/evaluateBadge/:id",
  IndexController.badgesAndLevelsController.evaluateBadge
);
