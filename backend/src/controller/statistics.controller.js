import { StatisticsService } from "../service/statistics.service.js";

export class StatisticsController {
  constructor({ DaoIndex }) {
    this.statisticsService = new StatisticsService({ DaoIndex });
  }
  rankingInUsersCountry = async (req, res, next) => {
    const { username } = req.params;
    try {
      const result = await this.statisticsService.rankingInUsersCountry({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  rankingWorlWide = async (req, res, next) => {
    try {
      const result = await this.statisticsService.rankingWorlWide();

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  themeWorldWideRanking = async (req, res, next) => {
    const { username } = req.params;
    try {
      const result = await this.statisticsService.themeWorldWideRanking({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  rankingInUsersCountryByTheme = async (req, res, next) => {
    const { username } = req.params;
    try {
      const result = await this.statisticsService.rankingInUsersCountryByTheme({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  atLeast45Completions = async (req, res, next) => {
    const { username } = req.params;
    try {
      const result = await this.statisticsService.atLeast45Completions({
        username,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  mostFrequentDays = async (req, res, next) => {
    const { username } = req.params;
    const { habit } = req.body;
    try {
      const result = await this.statisticsService.mostFrequentDays({
        username,
        habit,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
