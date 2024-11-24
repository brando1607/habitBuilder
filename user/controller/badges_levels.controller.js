import { ModelsIndex } from "../model/index.model.js";

export class BadgesAndLevelsController {
  static async sendToPendingBadges(req, res, next) {
    try {
      let input = req.body;
      let username = req.params.username;

      let result = await ModelsIndex.badgesAndLevelsModel.sendToPendingBadges({
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
      let result =
        await ModelsIndex.badgesAndLevelsModel.getUserAndBadgeLevels();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async getBadges(req, res, next) {
    try {
      const result = await ModelsIndex.badgesAndLevelsModel.getBadges();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async evaluateBadge(req, res, next) {
    try {
      const accepted = req.body.decision === "accepted" ? true : false;
      const id = req.params.id;

      const result = await ModelsIndex.badgesAndLevelsModel.evaluateBadge({
        id,
        accepted,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
