import { generateToken } from "../utils/jwt.js";
import { errors } from "../utils/errors/errors.js";
import { CustomError } from "../utils/errors/customErrors.js";
import { verifyToken } from "../utils/jwt.js";

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
  profile = async (req, res, next) => {
    try {
      let username = req.params.username;
      const viewer = verifyToken(req.cookies.token);

      let result = await this.daoIndex.userDao.profile({
        username,
        viewer: viewer.login,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  achievements = async (req, res, next) => {
    try {
      const username = req.params.username;

      let result = await this.daoIndex.userDao.achievements({ username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.send("User logged out.");
  };
  sendFriendRequest = async (req, res, next) => {
    const sender = req.user.login;
    const receiver = req.params.username;
    try {
      const result = await this.daoIndex.userDao.sendFriendRequest({
        sender,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getFriendRequests = async (req, res) => {
    const username = req.params.username;
    try {
      const result = await this.daoIndex.userDao.getFriendRequests({
        username,
      });

      res.send(result);
    } catch (error) {
      console.error(error);
    }
  };
  getFriends = async (req, res) => {
    const username = req.params.username;
    try {
      const result = await this.daoIndex.userDao.getFriends({ username });

      res.send(result);
    } catch (error) {
      console.error(error);
    }
  };
  respondToFriendRequest = async (req, res) => {
    const { id, response } = req.body;
    try {
      const result = await this.daoIndex.userDao.respondToFriendRequest({
        id,
        response,
      });
      res.send(result);
    } catch (error) {
      console.error(error);
    }
  };
}
