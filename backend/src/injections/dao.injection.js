import { createApp } from "../index.js";
import { DaoIndex } from "../dao/dao.index.js";
import { pool } from "../utils/pool.config.js";

const daoIndex = new DaoIndex(pool);

createApp({ DaoIndex: daoIndex });
