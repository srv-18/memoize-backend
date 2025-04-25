import { Request, Response } from "express";
import prisma from "../client";

export const getContents = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;

        if(!userId) {
            res.status(400).json({ message: "Invalid User Id"});
            return;
        }

        const contents = await prisma.contents.findMany({
            where: {userId: userId},
            orderBy: {createdAt: "desc"},
            select: {
                id: true,
                title: true,
                content: true,
                type: true,
                createdAt: true,
                updatedAt: true,
                public: true,
                tags: {
                    select: {
                        title: true
                    }
                }
            }
        });

        res.status(200).json(contents);
    } catch(e) {
        console.log(`error: ${e}`)
        res.status(500).json({"error": "something went wrong"});
        return;
    }
}