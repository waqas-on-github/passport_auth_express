import { Request, Response } from "express";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt_helpers";
import { db } from "../../router/users";

export const refresh = async (req: Request, res: Response) => {
  // Get refresh token from body
  const { token, deviceId } = req.body;

  // get a token from body
  // verfy it
  //find a token in db against this token and deviceId
  //if not found return 400
  //if user you get back token or tokens invalidate all

  try {
    // Verify token
    if (!token || !deviceId) {
      return res
        .status(400)
        .json({ message: "No token or device id provided in body" });
    }

    const { payload, error } = verifyToken(token);
    console.log(payload);

    // Check if the token is valid
    if (error) {
      return res
        .status(401)
        .json({ message: "Failed to validate token", error });
    }

    // Find user by ID
    const user = await db.user.findUnique({
      where: {
        id: Number(payload?.sub),
      },
      include: {
        tokens: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Invalidate the old device-specific refresh token
    //when we generate token for new device we add deviceId to refresh token and when we invalidate old refresh token we check for deviceId
    const oldRefreshToken = await db.refreshToken.findFirst({
      where: {
        token: token,
        deviceId: deviceId,
        userId: user.id,
        revoked: false,
      },
    });

    if (!oldRefreshToken) {
      return res
        .status(400)
        .json({ message: "No valid refresh token found for this device" });
    }

    // Ensure the request is coming from the expected device
    if (oldRefreshToken.deviceId !== deviceId) {
      return res
        .status(400)
        .json({ message: "Invalid device or refresh token" });
    }

    // Update the old refresh token to be revoked
    await db.refreshToken.updateMany({
      where: {
        userId: user.id,
        deviceId: deviceId,
        revoked: false, // Add this condition to make sure only non-revoked tokens are updated
      },
      data: { revoked: true },
    });

    // Generate new access token
    const accessToken = generateAccessToken(user);
    // Generate a new refresh token
    const refreshToken = generateRefreshToken(user.id);

    // Save the new refresh token to the database
    await db.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        deviceId: deviceId,
      },
    });

    // Return new tokens
    return res.json({
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    return res.status(500).json({
      message: "Failed to generate new tokens",
      error,
    });
  }
};
