import Router from "express";
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createProfileRouter = ({ DaoIndex }) => {
  const profileRoutes = Router();
  const indexController = new IndexController({ DaoIndex });

  profileRoutes.get(
    "/:username",
    passportCall("jwt", { session: false }),
    indexController.profileController.profile
  );

  profileRoutes.get(
    "/achievements/:username",
    passportCall("jwt", { session: false }),
    indexController.profileController.achievements
  );

  profileRoutes.post(
    "/sendFriendRequest/:username",
    passportCall("jwt", { session: false }),
    indexController.profileController.sendFriendRequest
  );

  profileRoutes.get(
    "/getFriendRequests/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.profileController.getFriendRequests
  );

  profileRoutes.get(
    "/getFriends/:username",
    passportCall("jwt", { session: false }),
    indexController.profileController.getFriends
  );

  profileRoutes.post(
    "/respondToFriendRequest/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.profileController.respondToFriendRequest
  );

  return profileRoutes;
};
