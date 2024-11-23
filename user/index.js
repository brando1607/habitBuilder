import express from "express";
import passport from "passport";
import { router } from "./router/index.routes.js";
import { initializePassport } from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import compression from "express-compression";
import { errorHandler } from "./middlewares/errorHandler.middlewares.js";
import { dbConnection } from "./config/pool.config.js";
process.loadEnvFile();

//express config
let app = express();
app.use(express.json());
app.use(cookieParser());
app.use(compression());

//passport config
initializePassport();
app.use(passport.initialize());

//router config
app.use("/api", router);

//Error handler config
app.use(errorHandler);

//Server and Db connection
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port http://localhost:${process.env.PORT}`);
});
dbConnection();
