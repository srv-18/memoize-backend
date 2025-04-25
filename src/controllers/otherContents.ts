import { Request, Response } from "express";

export const otherContents = async (req: Request, res: Response) => {
    res.status(200).json({ message: "inside brainRouter otherContent"});
}