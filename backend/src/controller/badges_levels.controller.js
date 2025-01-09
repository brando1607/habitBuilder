import { BadgesAndLevelsService } from "../service/badges_levels.service.js";

export class BadgesAndLevelsController {
  constructor({ DaoIndex }) {
    this.badgesAndLevelsService = new BadgesAndLevelsService({ DaoIndex });
  }
  sendToPendingBadges = async (req, res, next) => {
    try {
      let input = req.body;
      let username = req.params.username;

      let result = await this.badgesAndLevelsService.sendToPendingBadges({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getUserAndBadgeLevels = async (req, res, next) => {
    try {
      let result = await this.badgesAndLevelsService.getUserAndBadgeLevels();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getBadges = async (req, res, next) => {
    try {
      const result = await this.badgesAndLevelsService.getBadges();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  evaluateBadge = async (req, res, next) => {
    try {
      const accepted = req.body.decision === "accepted" ? true : false;
      const { id } = req.body;

      const result = await this.badgesAndLevelsService.evaluateBadge({
        id,
        accepted,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
