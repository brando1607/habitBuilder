import Router from "express";
export const userRoutes = Router();
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

userRoutes.post("/createUser", IndexController.userController.addUser);

userRoutes.post("/login", IndexController.userController.logIn);

userRoutes.post(
  "/sendTemporaryPassword",
  IndexController.userController.sendTemporaryPassword
);

userRoutes.put(
  "/changePassword",
  IndexController.userController.changePassword
);

userRoutes.put(
  "/changeLogin/:username",
  passportCall("jwt", { session: false }),
  checkUsernameInUrl(),
  IndexController.userController.changeLogin
);

userRoutes.get(
  "/profile/:username",
  passportCall("jwt", { session: false }),
  IndexController.userController.profile
);

userRoutes.get(
  "/achievements/:username",
  passportCall("jwt", { session: false }),
  IndexController.userController.achievements
);

userRoutes.post(
  "/sendFriendRequest/:username",
  passportCall("jwt", { session: false }),
  IndexController.userController.sendFriendRequest
);

userRoutes.get("/logout", IndexController.userController.logout);
