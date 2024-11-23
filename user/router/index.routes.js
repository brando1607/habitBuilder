import { Router } from "express";
import { userRoutes } from "./user.routes.js";
import { habitsRoutes } from "./habits.routes.js";
import { badgesAndLevelsRoutes } from "./badges_levels.routes.js";
export const router = Router();

//router config
router.use("/habits", habitsRoutes);
router.use("/user", userRoutes);
router.use("/badgesAndLevels", badgesAndLevelsRoutes);
