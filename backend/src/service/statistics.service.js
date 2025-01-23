export class StatisticsService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  async rankingInUsersCountry({ username }) {
    try {
      const result = this.daoIndex.statisticsDao.rankingInUsersCountry({
        username,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async rankingWorlWide() {
    try {
      const result = this.daoIndex.statisticsDao.rankingWorlWide();

      return result;
    } catch (error) {
      throw error;
    }
  }
  async themeWorldWideRanking({ username }) {
    try {
      const result = this.daoIndex.statisticsDao.themeWorldWideRanking({
        username,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async rankingInUsersCountryByTheme({ username }) {
    try {
      const result = this.daoIndex.statisticsDao.rankingInUsersCountryByTheme({
        username,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async atLeast45Completions({ username }) {
    try {
      const result = this.daoIndex.statisticsDao.atLeast45Completions({
        username,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
  async mostFrequentDays({ username, habit }) {
    try {
      const result = this.daoIndex.statisticsDao.mostFrequentDays({
        username,
        habit,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
