/* eslint-disable @typescript-eslint/quotes */
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  generateAccessToken,
  generateRfereshToken,
} from "../../utils/jwt_helpers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRfereshToken(user.id);

    res.json({
      message: "Login successful",
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
