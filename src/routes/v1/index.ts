import { Router } from "express";
import { contentRouter } from "./contentRouter";
import { brainRouter } from "./brainRouter";

export const router = Router();

router.use("/content", contentRouter);
router.use("/brain", brainRouter);