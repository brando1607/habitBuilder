export class BadgesAndLevelsService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  sendToPendingBadges = async ({ input, username }) => {
    try {
      let result = await this.daoIndex.badgesAndLevelsDao.sendToPendingBadges({
        input,
        username,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };
  getUserAndBadgeLevels = async () => {
    try {
      let result =
        await this.daoIndex.badgesAndLevelsDao.getUserAndBadgeLevels();

      return result;
    } catch (error) {
      throw error;
    }
  };
  getBadges = async () => {
    try {
      let result = await this.daoIndex.badgesAndLevelsDao.getBadges();
      return result;
    } catch (error) {
      throw error;
    }
  };
  evaluateBadge = async ({ id, accepted }) => {
    try {
      const result = await this.daoIndex.badgesAndLevelsDao.evaluateBadge({
        id,
        accepted,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
}
