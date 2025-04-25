import { Request, Response } from "express"
import prisma from "../client";

export const deleteContent = async (req: Request, res: Response) => {
    try {
        const { contentId } = req.body;

        const content = await prisma.contents.findUnique({
            where: { id: contentId }
        })
        
        if(!content) {
            res.status(404).json({ message: "Content does not exit" });
            return;
        }

        await prisma.contents.delete({
            where: { id: contentId }
        });

        res.status(200).json({ message: "Content deleted successfully" });
    } catch(e) {
        console.log(`error while deleting content: ${e}`)
        res.status(500).json({"error": "something went wrong"});
        return;
    }
}