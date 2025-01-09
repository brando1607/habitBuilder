import { ProfileService } from "../service/profile.service.js";

export class ProfileController {
  constructor({ DaoIndex }) {
    this.profileService = new ProfileService({ DaoIndex });
  }
  profile = async (req, res, next) => {
    try {
      let username = req.params.username;
      const { token } = req.cookies;

      let result = await this.profileService.profile({
        username,
        token,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  achievements = async (req, res, next) => {
    try {
      const username = req.params.username;

      let result = await this.profileService.achievements({
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  sendFriendRequest = async (req, res, next) => {
    const sender = req.user.login;
    const receiver = req.params.username;
    try {
      const result = await this.profileService.sendFriendRequest({
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
      const result = await this.profileService.getFriendRequests({
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
      const result = await this.profileService.getFriends({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  respondToFriendRequest = async (req, res, next) => {
    const { id, response } = req.body;
    try {
      const result = await this.profileService.respondToFriendRequest({
        id,
        response,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
