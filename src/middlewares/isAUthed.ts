import { Request, Response, NextFunction } from "express";
import { passportJwt } from "../stratiges/jwt_stratagy";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passportJwt.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized",
          error: info ? info.message : "No additional info",
        });
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};
