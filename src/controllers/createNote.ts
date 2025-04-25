import { Request, Response } from "express";
import { generateEmbedding } from "../workers/embeddings-worker";
import prisma from "../client";

export const createNote = async (req: Request, res: Response) => {
    try {
        const { title , content, userId } = req.body;

        if(!title || !content) {
            res.status(400).json({ message: "Invalid Input" });
            return;
        }

        const embedding = await generateEmbedding(`title: ${title}, content: ${content}, createdAt: ${new Date()}`);

        const contentType = "NOTE";

        const note = await prisma.$executeRaw`
            INSERT INTO "Contents" 
                (id, title, content, "type", embedding, "userId") 
            VALUES 
                (gen_random_uuid(), ${title}, ${content}, ${contentType}::"ContentType", ${embedding}::vector, ${userId})
            RETURNING *;
        `;

        console.log(note);

        res.status(200).json({ note });
    } catch(e) {
        console.log(`error: ${e}`)
        res.status(500).json({"error": "something went wrong"});
        return;
    }
}