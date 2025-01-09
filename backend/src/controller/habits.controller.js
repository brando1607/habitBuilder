import { HabitService } from "../service/habits.service.js";

export class HabitsController {
  constructor({ DaoIndex }) {
    this.habitService = new HabitService({ DaoIndex });
  }
  addHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;
    try {
      let result = await this.habitService.addHabit({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
  completeHabit = async (req, res, next) => {
    let username = req.params.username;
    let input = req.body;

    try {
      let result = await this.habitService.completeHabit({
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
      let result = await this.habitService.delete({
        input,
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  };
}
