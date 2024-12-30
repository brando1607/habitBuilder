import { generateToken } from "../utils/jwt.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";

export class UserController {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  addUser = async (req, res, next) => {
    try {
      const user = req.body;

      let result = await this.daoIndex.userDao.addUser({ user });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  logIn = async (req, res, next) => {
    let user = req.body;

    try {
      if (req.cookies.token) {
        return res.send(CustomError.newError(errors.conflict.user));
      }

      let result = await this.daoIndex.userDao.logIn({ user });

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
  };
  changePassword = async (req, res, next) => {
    try {
      let password = req.body;
      let result = await this.daoIndex.userDao.changePassword({ password });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  changeLogin = async (req, res, next) => {
    try {
      let username = req.params.username;

      let input = req.body;
      let result = await this.daoIndex.userDao.changeLogin({ username, input });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendTemporaryPassword = async (req, res, next) => {
    try {
      let input = req.body;
      let result = await this.daoIndex.userDao.sendTemporaryPassword({ input });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.send("User logged out.");
  };
}
