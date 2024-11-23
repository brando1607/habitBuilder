import passport from "passport";
import {
  Strategy as JWTStrategy,
  ExtractJwt as ExtractJWT,
} from "passport-jwt";
import { TOKEN } from "../utils/jwt.js";

export function initializePassport() {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: TOKEN,
      },
      async (payload, done) => {
        try {
          done(null, payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

function cookieExtractor(req) {
  let token = null;

  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
}
