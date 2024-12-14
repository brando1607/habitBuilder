import { ModelsIndex } from "../model/index.model.js";
import { generateToken } from "../utils/jwt.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";

export class UserController {
  static async addUser(req, res, next) {
    try {
      const user = req.body;

      let result = await ModelsIndex.userModel.addUser({ user });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async logIn(req, res, next) {
    let user = req.body;

    try {
      if (req.cookies.token) {
        return res.send(CustomError.newError(errors.conflict.user));
      }

      let result = await ModelsIndex.userModel.logIn({ user });

      if (result) {
        const payload = {
          login: result.username,
        };

        const token = generateToken(payload);
        res.cookie("token", token, {
          maxAge: 1000 * 60 * 60,
          httpOnly: true,
        });

        return res.send(`Login successful`);
      } else {
        return CustomError.newError(errors.auth.unauthorized);
      }
    } catch (error) {
      next(error);
    }
  }
  static async changePassword(req, res, next) {
    try {
      let password = req.body;
      let result = await ModelsIndex.userModel.changePassword({ password });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async changeLogin(req, res, next) {
    try {
      let username = req.params.username;

      let input = req.body;
      let result = await ModelsIndex.userModel.changeLogin({ username, input });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async sendTemporaryPassword(req, res, next) {
    try {
      let input = req.body;
      let result = await ModelsIndex.userModel.sendTemporaryPassword({ input });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async profile(req, res, next) {
    try {
      let username = req.params.username;

      let result = await ModelsIndex.userModel.profile({ username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async achievements(req, res, next) {
    try {
      const username = req.params.username;

      let result = await ModelsIndex.userModel.achievements({ username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async logout(req, res) {
    res.cookie("token", "", { expires: new Date(0) });
    res.send("User logged out.");
  }
  static async sendFriendRequest(req, res, next) {
    const sender = req.user.login;
    const receiver = req.params.username;
    try {
      const result = await ModelsIndex.userModel.sendFriendRequest({
        sender,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async getFriendRequests(req, res) {
    const username = req.params.username;
    try {
      const result = await ModelsIndex.userModel.getFriendRequests({
        username,
      });

      res.send(result);
    } catch (error) {
      console.error(error);
    }
  }
  static async getFriends(req, res) {
    const username = req.params.username;
    try {
      const result = await ModelsIndex.userModel.getFriends({ username });

      res.send(result);
    } catch (error) {
      console.error(error);
    }
  }
  static async respondToFriendRequest(req, res) {
    const { id, response } = req.body;
    try {
      const result = await ModelsIndex.userModel.respondToFriendRequest({
        id,
        response,
      });
      res.send(result);
    } catch (error) {
      console.error(error);
    }
  }
}
