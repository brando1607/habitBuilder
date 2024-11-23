import { ReusableFunctions } from "../utils/reusable_functions.js";
import { DaoIndex } from "../dao/dao.index.js";

export class BadgesAndLevelsModel {
  constructor(pool) {
    this.pool = pool;
  }
  async sendToPendingBadges({ input, username }) {
    const result = await DaoIndex.badgesAndLevelsDao.sendToPendingBadges({
      input,
      username,
    });

    return result;
  }
  async getUserAndBadgeLevels() {
    try {
      let result = await DaoIndex.badgesAndLevelsDao.getUserAndBadgeLevels();

      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async getBadges() {
    let result = await DaoIndex.badgesAndLevelsDao.getBadges();
    return result;
  }
  async evaluateBadge({ id, accepted }) {
    const result = await DaoIndex.badgesAndLevelsDao.evaluateBadge({
      id,
      accepted,
    });
    return result;
  }
}
