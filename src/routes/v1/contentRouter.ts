import { Router } from "express";
import { deleteContent } from "../../controllers/deleteContent";
import { getContents } from "../../controllers/getContents";
import { createNote } from "../../controllers/createNote";
import { uploadFile } from "../../controllers/uploadFile";
import { uploadLink } from "../../controllers/uploadLink";

export const contentRouter = Router();

contentRouter.post("/note", createNote);
contentRouter.post("/file", uploadFile);
contentRouter.post("/link", uploadLink);

contentRouter.get("/", getContents);

contentRouter.delete("/", deleteContent);