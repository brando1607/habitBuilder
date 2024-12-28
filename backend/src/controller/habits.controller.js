import { DaoIndex } from "../dao/dao.index.js";

export class HabitsController {
  static async addHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;
    try {
      let result = await DaoIndex.habitsDao.addHabit({ input, username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async completeHabit(req, res, next) {
    let username = req.params.username;
    let input = req.body;

    try {
      let result = await DaoIndex.habitsDao.completeHabit({
        username,
        input,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
  static async deleteHabit(req, res, next) {
    let input = req.body;
    let username = req.params.username;

    try {
      let result = await DaoIndex.habitsDao.deleteHabit({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
