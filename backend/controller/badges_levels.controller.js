import { DaoIndex } from "../dao/dao.index.js";

export class BadgesAndLevelsController {
  static async sendToPendingBadges(req, res, next) {
    try {
      let input = req.body;
      let username = req.params.username;

      let result = await DaoIndex.badgesAndLevelsDao.sendToPendingBadges({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async getUserAndBadgeLevels(req, res, next) {
    try {
      let result = await DaoIndex.badgesAndLevelsDao.getUserAndBadgeLevels();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async getBadges(req, res, next) {
    try {
      const result = await DaoIndex.badgesAndLevelsDao.getBadges();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async evaluateBadge(req, res, next) {
    try {
      const accepted = req.body.decision === "accepted" ? true : false;
      const { id } = req.body;

      const result = await DaoIndex.badgesAndLevelsDao.evaluateBadge({
        id,
        accepted,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
