import multer from "multer";
import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
    uploadFile,
    downloadFile,
    listFiles,
    deleteFile,
} from "./filesController.js";
import { fileIdSchema } from "../validations/file.validation.js";
import {
    validateParams,
    validateFileUpload,
} from "../middlewares/validation.js";

const upload = multer({
    storage: multer.memoryStorage(),
});

const fileRouter = Router();

fileRouter.post(
    "/",
    authenticate,
    upload.single("file"),
    validateFileUpload,
    uploadFile
);

fileRouter.get(
    "/:id",
    authenticate,
    validateParams(fileIdSchema),
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
    validateParams(fileIdSchema),
    deleteFile
);

export default fileRouter;