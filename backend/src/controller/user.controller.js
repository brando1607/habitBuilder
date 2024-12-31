import { ServiceIndex } from "../service/index.service.js";

export class UserController {
  constructor({ DaoIndex }) {
    this.serviceIndex = new ServiceIndex({ DaoIndex });
  }
  createUser = async (req, res, next) => {
    try {
      const user = req.body;

      let result = await this.serviceIndex.userService.createUser({ user });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  logIn = async (req, res, next) => {
    let user = req.body;
    let { token } = req.cookies;

    try {
      let result = await this.serviceIndex.userService.logIn({ user, token });

      res.cookie("token", result, {
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      return res.send(`Login successful`);
    } catch (error) {
      next(error);
    }
  };
  changePassword = async (req, res, next) => {
    try {
      let password = req.body;
      let result = await this.serviceIndex.userService.changePassword({
        password,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  changeLogin = async (req, res, next) => {
    try {
      let username = req.params.username;

      let input = req.body;
      let result = await this.serviceIndex.userService.changeLogin({
        username,
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendTemporaryPassword = async (req, res, next) => {
    try {
      let input = req.body;
      let result = await this.serviceIndex.userService.sendTemporaryPassword({
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res, next) => {
    try {
      res.cookie("token", "", { expires: new Date(0) });
      res.send("User logged out.");
    } catch (error) {
      next(error);
    }
  };
}
