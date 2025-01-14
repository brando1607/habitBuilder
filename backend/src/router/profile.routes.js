import Router from "express";
import { ProfileController } from "../controller/profile.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";
import { userExists } from "../middlewares/checkIfUserExists.middleware.js";

export const createProfileRouter = ({ DaoIndex }) => {
  const profileRoutes = Router();
  const profileController = new ProfileController({ DaoIndex });

  profileRoutes.get(
    "/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    profileController.profile
  );

  profileRoutes.get(
    "/achievements/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    profileController.achievements
  );

  profileRoutes.post(
    "/sendFriendRequest/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    profileController.sendFriendRequest
  );

  profileRoutes.get(
    "/getFriendRequests/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    profileController.getFriendRequests
  );

  profileRoutes.get(
    "/getFriends/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    profileController.getFriends
  );

  profileRoutes.post(
    "/respondToFriendRequest/:username",
    passportCall("jwt", { session: false }),
    userExists(),
    checkUsernameInUrl(),
    profileController.respondToFriendRequest
  );

  return profileRoutes;
};
