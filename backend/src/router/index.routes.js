import { Router } from "express";
import { createUserRouter } from "./user.routes.js";
import { createHabitsRouter } from "./habits.routes.js";
import { createBadgesAndLevelsRouter } from "./badges_levels.routes.js";
import { createMessagesRouter } from "./messages.routes.js";

//router config

export const createRouter = ({ DaoIndex }) => {
  const router = Router();
  router.use("/habits", createHabitsRouter({ DaoIndex }));
  router.use("/user", createUserRouter({ DaoIndex }));
  router.use("/badgesAndLevels", createBadgesAndLevelsRouter({ DaoIndex }));
  router.use("/messages", createMessagesRouter({ DaoIndex }));

  return router;
};
