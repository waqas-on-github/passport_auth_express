import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { db } from "../router/users";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

export const passportJwt = passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      // Find user by ID from token
      const user = await db.user.findUnique({
        where: { id: jwt_payload.id },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: "User not found" });
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
