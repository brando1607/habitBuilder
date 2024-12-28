export class HabitsController {
  constructor({ DaoIndex }) {
    this.daoIndex = DaoIndex;
  }
  addHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;
    try {
      let result = await this.daoIndex.habitsDao.addHabit({ input, username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  completeHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;

    try {
      let result = await this.daoIndex.habitsDao.completeHabit({
        username,
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  deleteHabit = async (req, res, next) => {
    let input = req.body;
    let username = req.params.username;

    try {
      let result = await this.daoIndex.habitsDao.deleteHabit({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
