export class HabitService {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  addHabit = async ({ input, username }) => {
    try {
      let result = await this.daoIndex.habitsDao.addHabit({ input, username });
      return result;
    } catch (error) {
      throw error;
    }
  };
  completeHabit = async ({ username, input }) => {
    try {
      let result = await this.daoIndex.habitsDao.completeHabit({
        username,
        input,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
  delete = async ({ input, username }) => {
    try {
      let result = await this.daoIndex.habitsDao.deleteHabit({
        input,
        username,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };
}
