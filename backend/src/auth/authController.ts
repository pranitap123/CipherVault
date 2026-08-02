import { Request, Response } from "express";
import { registerUser, loginUser } from "./authService.js";

export async function register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
  
      const result = await registerUser(email, password);
  
      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Registration failed",
      });
    }
  }

export async function login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
  
      const result = await loginUser(email, password);
  
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }