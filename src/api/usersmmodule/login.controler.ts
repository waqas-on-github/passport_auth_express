/* eslint-disable @typescript-eslint/quotes */
import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt_helpers";
import bcrypt from "bcryptjs";
import { db } from "../../router/users";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, deviceId } = req.body;
    if (!email || !password || !deviceId) {
      return res
        .status(400)
        .json({ message: "Please provide email, password, and deviceId" });
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get the previous refresh token if it exists and verify it
    const refreshTokenFromDb = await db.refreshToken.findFirst({
      where: { userId: user.id, deviceId: deviceId },
    });
    // If a valid refresh token exists for this device, revoke all previous tokens refrenced to deviceId
    if (refreshTokenFromDb) {
      await db.refreshToken.updateMany({
        where: {
          userId: user.id,
          deviceId: deviceId,
          revoked: false, // Add this condition to make sure only non-revoked tokens are updated
        },
        data: { revoked: true },
      });
    }
    // Generate access token
    const accessToken = generateAccessToken(user);
    // Generate a new refresh token for this user and device
    const refreshToken = generateRefreshToken(user.id);

    // Save the new refresh token to the database
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceId: deviceId,
      },
    });

    // Return the access and refresh tokens
    res.json({
      message: "Login successful",
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: "Login failed", error });
  }
};
