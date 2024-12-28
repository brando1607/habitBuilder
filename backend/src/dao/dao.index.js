import { UserDAO } from "./user.dao.js";
import { HabitsDAO } from "./habits.dao.js";
import { BadgesAndLevelsDAO } from "./badges_levels.dao.js";
import { MessagesDao } from "./messages.dao.js";

export class DaoIndex {
  constructor(pool) {
    this.userDao = new UserDAO(pool);
    this.habitsDao = new HabitsDAO(pool);
    this.badgesAndLevelsDao = new BadgesAndLevelsDAO(pool);
    this.messagesDao = new MessagesDao(pool);
  }
}
