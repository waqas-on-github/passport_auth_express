import { Router } from "express";
import { login } from "../api/usersmmodule/login.controler";
import { requireAuth } from "../middlewares/isAUthed";
import { register } from "../api/usersmmodule/register.controler";

import { PrismaClient } from "@prisma/client";
import { refresh } from "../api/usersmmodule/refresh.controler";
export const db = new PrismaClient();
const router = Router();
router.post("/register", register);
router.post("/login", login);

// Protected route example
router.get("/profile", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/refresh", refresh);
export { router };
