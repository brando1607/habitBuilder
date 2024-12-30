import { UserDao } from "./user.dao.js";
import { HabitsDao } from "./habits.dao.js";
import { BadgesAndLevelsDao } from "./badges_levels.dao.js";
import { MessagesDao } from "./messages.dao.js";
import { ProfileDao } from "./profile.dao.js";

export class DaoIndex {
  constructor(pool) {
    this.userDao = new UserDao(pool);
    this.habitsDao = new HabitsDao(pool);
    this.badgesAndLevelsDao = new BadgesAndLevelsDao(pool);
    this.messagesDao = new MessagesDao(pool);
    this.profileDao = new ProfileDao(pool);
  }
}
