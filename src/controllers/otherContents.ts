import { Request, Response } from "express";
import prisma from "../client";

export const otherContents = async (req: Request, res: Response) => {
    try {
        const otherUserEmail = req.body.email;

        const otherUserContent = await prisma.user.findUnique({
            where: {
                email: otherUserEmail
            },
            select: {
                content: {
                    where: {
                        public: true
                    },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        url: true,
                        tags: { select: { title: true }},
                        type: true,
                        public: true
                    }
                }
            }
        });
        if(otherUserContent?.content.length === 0) {
            res.status(404).json({ message: "Invalid user email or the sharing is disabled" });
            return;
        }

        res.status(200).json({ otherUserContent });
    } catch(e) {
        console.log(`error in fetching shared content route: ${e}`)
        res.status(500).json({"error": "something went wrong while fetching shared content"});
        return;
    }
}