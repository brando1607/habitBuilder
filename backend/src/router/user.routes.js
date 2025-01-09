import Router from "express";
import { UserController } from "../controller/user.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createUserRouter = ({ DaoIndex }) => {
  const userRoutes = Router();

  const userController = new UserController({ DaoIndex });

  userRoutes.post("/createUser", userController.createUser);

  userRoutes.post("/login", userController.logIn);

  userRoutes.post(
    "/sendTemporaryPassword",
    userController.sendTemporaryPassword
  );

  userRoutes.put("/changePassword", userController.changePassword);

  userRoutes.put(
    "/changeLogin/:username",
    passportCall("jwt", { session: false }),
    checkUsernameInUrl(),
    userController.changeLogin
  );

  userRoutes.get("/logout", userController.logout);

  return userRoutes;
};
