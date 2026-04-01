import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { generateToken } from "../services/auth.service.js";
import { User } from "../models/User.js";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.role);

    const { passwordHash: _pw, ...userData } = user.toJSON();

    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

authRoutes.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
