import multer from "multer";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadFile } from "./filesController.js";

const upload = multer({
    storage: multer.memoryStorage(),
});

const fileRouter = Router();

fileRouter.post("/", authenticate, upload.single("file"), uploadFile);

export default fileRouter;