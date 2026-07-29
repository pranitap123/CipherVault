import multer from "multer";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
    uploadFile,
    downloadFile,
    listFiles,
    deleteFile,
} from "./filesController.js";

const upload = multer({
    storage: multer.memoryStorage(),
});

const fileRouter = Router();

fileRouter.post(
    "/",
    authenticate,
    upload.single("file"),
    uploadFile
);

fileRouter.get(
    "/:id",
    authenticate,
    downloadFile
);

fileRouter.get(
    "/",
    authenticate,
    listFiles
);

fileRouter.delete(
    "/:id",
    authenticate,
    deleteFile
);

export default fileRouter;