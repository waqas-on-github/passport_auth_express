/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/comma-dangle */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const generateAccessToken = (user: { id: number; email: string }) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "100s",
  });
};

export const generateRefreshToken = (id: number) => {
  return jwt.sign({ sub: id }, JWT_SECRET, {
    expiresIn: "1w",
  });
};

export const verifyToken = (token: string) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return {
      payload,
      error: null,
    };
  } catch (error) {
    return {
      payload: null,
      error,
    };
  }
};
