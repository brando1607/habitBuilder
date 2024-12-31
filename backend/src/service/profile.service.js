import { verifyToken } from "../utils/jwt.js";

export class ProfileService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  profile = async ({ username, token }) => {
    try {
      const viewer = verifyToken(token);

      let result = await this.daoIndex.profileDao.profile({
        username,
        viewer: viewer.login,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
  achievements = async ({ username }) => {
    try {
      let result = await this.daoIndex.profileDao.achievements({ username });
      return result;
    } catch (error) {
      throw error;
    }
  };
  sendFriendRequest = async ({ sender, receiver }) => {
    try {
      const result = await this.daoIndex.profileDao.sendFriendRequest({
        sender,
        receiver,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };
  getFriendRequests = async ({ username }) => {
    try {
      const result = await this.daoIndex.profileDao.getFriendRequests({
        username,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
  getFriends = async ({ username }) => {
    try {
      const result = await this.daoIndex.profileDao.getFriends({ username });
      return result;
    } catch (error) {
      throw error;
    }
  };
  respondToFriendRequest = async ({ id, response }) => {
    try {
      const result = await this.daoIndex.profileDao.respondToFriendRequest({
        id,
        response,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
}
