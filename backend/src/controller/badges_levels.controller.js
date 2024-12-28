export class BadgesAndLevelsController {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  sendToPendingBadges = async (req, res, next) => {
    try {
      let input = req.body;
      let username = req.params.username;

      let result = await this.daoIndex.badgesAndLevelsDao.sendToPendingBadges({
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
        await this.daoIndex.badgesAndLevelsDao.getUserAndBadgeLevels();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  getBadges = async (req, res, next) => {
    try {
      const result = await this.daoIndex.badgesAndLevelsDao.getBadges();
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  evaluateBadge = async (req, res, next) => {
    try {
      const accepted = req.body.decision === "accepted" ? true : false;
      const { id } = req.body;

      const result = await this.daoIndex.badgesAndLevelsDao.evaluateBadge({
        id,
        accepted,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
