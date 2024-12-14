import passport from "passport";

export function passportCall(strategy) {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user) {
      if (error) return next(error);

      if (!user)
        return res.status(401).send({
          error: "Unauthorized",
          details: "please log in first so you can be verified",
        });

      req.user = user;
      next();
    })(req, res, next);
  };
}
