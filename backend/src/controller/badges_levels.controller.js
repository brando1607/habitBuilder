import { ServiceIndex } from "../service/index.service.js";

export class BadgesAndLevelsController {
  constructor({ DaoIndex }) {
    this.serviceIndex = new ServiceIndex({ DaoIndex });
  }
  sendToPendingBadges = async (req, res, next) => {
    try {
      let input = req.body;
      let username = req.params.username;

      let result =
        await this.serviceIndex.badgesAndLevelsService.sendToPendingBadges({
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
      let result =
        await this.serviceIndex.badgesAndLevelsService.getUserAndBadgeLevels();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getBadges = async (req, res, next) => {
    try {
      const result = await this.serviceIndex.badgesAndLevelsService.getBadges();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  evaluateBadge = async (req, res, next) => {
    try {
      const accepted = req.body.decision === "accepted" ? true : false;
      const { id } = req.body;

      const result =
        await this.serviceIndex.badgesAndLevelsService.evaluateBadge({
          id,
          accepted,
        });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
