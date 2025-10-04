import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";
import prisma from "./prisma.js";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    { user_id: user.id, email: user.email },
    process.env.JWT_KEY,
    { expiresIn: 900 }
  );
};

const getNewRefreshToken = () => crypto.randomBytes(64).toString("hex");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const refreshExpiryDate = () => {
  const delta = Number(process.env.REFRESH_EXPIRY_DAYS || 30);
  const d = new Date();
  d.setDate(d.getDate() + delta);
  return d;
};

const setRefreshCookie = (res, token) => {
  const days = Number(process.env.REFRESH_EXPIRY_DAYS || 30);
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: "strict",
    maxAge: days * 24 * 60 * 60 * 1000,
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/auth/refresh",
  });
};

const clearCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "prod",
    sameSite: "strict",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/auth",
  });
};

const verifyTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("JWT ") ? authHeader.slice(4) : null;

  if (!token) throw new Error("Missing token");

  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch {
    throw new Error("Invalid or expired token");
  }
};

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const hashed_password = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hashed_password, name },
    });

    return res.status(201).json({
      // token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code == "P2002") {
        return res
          .status(409)
          .json({
            error: `Unique constraint failed on field(s): ${e.meta?.target?.join(
              ", "
            )}`,
          });
      }
    }
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    const refreshToken = getNewRefreshToken();

    console.log(refreshToken);

    const tokenObj = await prisma.refreshToken.upsert({
      where: { userId: user.id },
      create: {
        hashToken: hashToken(refreshToken),
        userId: user.id,
        expiresAt: refreshExpiryDate(),
      },
      update: {
        hashToken: hashToken(refreshToken),
        expiresAt: refreshExpiryDate(),
      },
    });

    setRefreshCookie(res, refreshToken);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const cookieValue = req.cookies?.refreshToken;

    if (!cookieValue) res.status(401).json({ error: "Missing refresh token" });

    const tokenObj = await prisma.refreshToken.findFirst({
      where: {
        hashToken: hashToken(cookieValue),
      },
    });

    if (!tokenObj) {
      clearCookie(res);
      res.status(401).json({ error: "Invalid refresh token" });
    }

    if (tokenObj.expiresAt < new Date()) {
      clearCookie(res);
      res.status(401).json({ error: "Refresh token has expired" });
    }

    const newRefreshToken = getNewRefreshToken();

    const UpdatedTokenObj = await prisma.refreshToken.update({
      where: { userId: tokenObj.userId },
      data: {
        hashToken: hashToken(newRefreshToken),
        expiresAt: refreshExpiryDate(),
      },
    });

    setRefreshCookie(res, newRefreshToken);

    const user = await prisma.user.findUnique({
      where: { id: tokenObj.userId },
    });

    const jwt = signToken(user);
    return res.json({ jwt });
  } catch (e) {
    console.error(e);
    clearCookie(res);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const payload = verifyTokenFromHeader(req);
    const me = await prisma.user.findUnique({
      where: { id: payload.user_id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    if (!me) return res.status(404).json({ error: "User not found" });
    return res.json({ user: me });
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

export default router;
