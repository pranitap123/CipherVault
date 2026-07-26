import { Request, Response } from "express";
import { registerUser, loginUser } from "./authService.js";

export async function register(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await registerUser(email, password);

    return res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return res.status(200).json(result);
}