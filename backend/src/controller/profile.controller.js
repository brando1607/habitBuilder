import { verifyToken } from "../utils/jwt.js";

export class ProfileController {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  profile = async (req, res, next) => {
    try {
      let username = req.params.username;
      const viewer = verifyToken(req.cookies.token);

      let result = await this.daoIndex.profileDao.profile({
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

      let result = await this.daoIndex.profileDao.achievements({ username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendFriendRequest = async (req, res, next) => {
    const sender = req.user.login;
    const receiver = req.params.username;
    try {
      const result = await this.daoIndex.profileDao.sendFriendRequest({
        sender,
        receiver,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getFriendRequests = async (req, res, next) => {
    const username = req.params.username;
    try {
      const result = await this.daoIndex.profileDao.getFriendRequests({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getFriends = async (req, res, next) => {
    const username = req.params.username;
    try {
      const result = await this.daoIndex.profileDao.getFriends({ username });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  respondToFriendRequest = async (req, res, next) => {
    const { id, response } = req.body;
    try {
      const result = await this.daoIndex.profileDao.respondToFriendRequest({
        id,
        response,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
