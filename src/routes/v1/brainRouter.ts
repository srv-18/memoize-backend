import { Router } from "express";
import { otherContents } from "../../controllers/otherContents";
import { shareContent } from "../../controllers/shareContent";
import { searchContent } from "../../controllers/searchContent";

export const brainRouter = Router();

brainRouter.post("/search", searchContent);

brainRouter.post("/share", shareContent);

brainRouter.get("/:shareLink", otherContents);