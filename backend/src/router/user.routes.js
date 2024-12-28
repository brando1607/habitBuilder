import Router from "express";
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createUserRouter = ({ DaoIndex }) => {
  const userRoutes = Router();

  const indexController = new IndexController({ DaoIndex });

  userRoutes.post("/createUser", indexController.userController.addUser);

  userRoutes.post("/login", indexController.userController.logIn);

  userRoutes.post(
    "/sendTemporaryPassword",
    indexController.userController.sendTemporaryPassword
  );

  userRoutes.put(
    "/changePassword",
    indexController.userController.changePassword
  );

  userRoutes.put(
    "/changeLogin/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.userController.changeLogin
  );

  userRoutes.get(
    "/profile/:username",
    passportCall("jwt", { session: false }),
    indexController.userController.profile
  );

  userRoutes.get(
    "/achievements/:username",
    passportCall("jwt", { session: false }),
    indexController.userController.achievements
  );

  userRoutes.post(
    "/sendFriendRequest/:username",
    passportCall("jwt", { session: false }),
    indexController.userController.sendFriendRequest
  );

  userRoutes.get(
    "/getFriendRequests/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.userController.getFriendRequests
  );

  userRoutes.get(
    "/getFriends/:username",
    passportCall("jwt", { session: false }),
    indexController.userController.getFriends
  );

  userRoutes.post(
    "/respondToFriendRequest/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    indexController.userController.respondToFriendRequest
  );

  userRoutes.get("/logout", indexController.userController.logout);

  return userRoutes;
};
