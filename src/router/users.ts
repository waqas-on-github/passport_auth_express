import { Router } from "express";
import { login } from "../api/usersmmodule/login.controler";
import { requireAuth } from "../middlewares/isAUthed";
import { register } from "../api/usersmmodule/register.controler";
import {
  generateAccessToken,
  generateRfereshToken,
  verifyToken,
} from "../utils/jwt_helpers";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const router = Router();

router.post("/register", register);
router.post("/login", login);

// Protected route example
router.get("/profile", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/refresh", async (req, res) => {
  const token = req.body;
  console.log(token);
  try {
    const { payload, error } = verifyToken(token.token);
    if (error) {
      return res.json({ message: "failed to validate token", error });
    }

    const user = await db.user.findUnique({
      where: { id: Number(payload?.sub) },
    });

    if (!user) {
      throw new Error("user not found ");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRfereshToken(user.id);

    return res.json({ accessToken, refreshToken });
  } catch (error) {
    throw new Error("failed to generate tokens again");
  }
  // verify token
  // get user id from token
  // check user in db
  // regenrate both tokens
});
export { router };
