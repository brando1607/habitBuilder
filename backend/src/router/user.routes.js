import Router from "express";
import { IndexController } from "../controller/index.controller.js";
import { passportCall } from "../middlewares/passport.middleware.js";
import { checkUsernameInUrl } from "../middlewares/username.middleware.js";

export const createUserRouter = ({ DaoIndex }) => {
  const userRoutes = Router();

  const indexController = new IndexController({ DaoIndex });

  userRoutes.post("/createUser", indexController.userController.createUser);

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

  userRoutes.get("/logout", indexController.userController.logout);

  return userRoutes;
};
