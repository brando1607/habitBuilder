import { UserDAO } from "./user.dao.js";
import { HabitsDAO } from "./habits.dao.js";
import { BadgesAndLevelsDAO } from "./badges_levels.dao.js";
import { MessagesDao } from "./messages.dao.js";
import { pool } from "../config/pool.config.js";

const userDao = new UserDAO(pool);
const habitsDao = new HabitsDAO(pool);
const badgesAndLevelsDao = new BadgesAndLevelsDAO(pool);
const messagesDao = new MessagesDao(pool);

export class DaoIndex {
  static userDao = userDao;
  static habitsDao = habitsDao;
  static badgesAndLevelsDao = badgesAndLevelsDao;
  static messagesDao = messagesDao;
}
