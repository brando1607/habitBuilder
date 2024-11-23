import { DaoIndex } from "../dao/dao.index.js";

export class HabitsModel {
  constructor(pool) {
    this.pool = pool;
  }

  async assignBadge({ habit, username }) {
    try {
      const resultado = await DaoIndex.habitsDao.assignBadge({
        habit,
        username,
      });

      return resultado;
    } catch (error) {
      console.error(error);
    }
  }
  async addFrequency({ habit, deadline }) {
    try {
      const result = await DaoIndex.habitsDao.addFrequency({ habit, deadline });

      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async addHabitAndIncreaseCounter({ habit, deadline, username }) {
    try {
      const result = await DaoIndex.habitsDao.addHabitAndIncreaseCounter({
        habit,
        deadline,
        username,
      });

      return result;
    } catch (error) {
      console.error(error);
    }
  }

  async addHabit({ input, username }) {
    const result = await DaoIndex.habitsDao.addHabit({ input, username });

    return result;
  }
  async checkBadges({ habit, username }) {
    try {
      const result = await DaoIndex.habitsDao.checkBadges({ habit, username });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async givePoints({ habit, username }) {
    try {
      const result = await DaoIndex.habitsDao.givePoints({ habit, username });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async checkUserLevel({ username }) {
    try {
      const result = await DaoIndex.habitsDao.checkUserLevel({ username });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async checkBadgeLevel({ username, habit }) {
    try {
      const result = await DaoIndex.habitsDao.checkBadgeLevel({
        username,
        habit,
      });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
  async completeHabit({ username, input }) {
    try {
      const result = await DaoIndex.habitsDao.completeHabit({
        username,
        input,
      });
      return result;
    } catch (error) {
      console.error(error);
      return error.sqlMessage;
    }
  }
  async deleteHabit({ input, username }) {
    try {
      const result = await DaoIndex.habitsDao.deleteHabit({ input, username });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
