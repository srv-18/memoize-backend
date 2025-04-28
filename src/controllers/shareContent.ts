import { Request, Response } from "express";
import prisma from "../client";

export const shareContent = async (req: Request, res: Response) => {
    try {
        const { contentId, userId } = req.body;

        const publicContent = await prisma.contents.update({
            where: {
                userId: userId,
                id: contentId,
            },
            data: {
                public: true
            }
        });
        if(!publicContent) {
            res.status(404).json({ message: "No such content found"});
            return;
        }

        res.status(200).json({ publicContent });
    } catch(e) {
        console.log(`error in share content route: ${e}`)
        res.status(500).json({"error": "something went wrong while sharing content"});
        return;
    }
}