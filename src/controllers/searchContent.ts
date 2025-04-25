import { Request, Response } from "express";
import prisma from "../client";
import { generateEmbedding } from "../workers/embeddings-worker";
import * as chrono from "chrono-node";
import { useGenAI } from "../workers/genai-worker";

export const searchContent = async (req: Request, res: Response) => {
    try {
        const { searchQuery, userId, similarityThreshold = 0.3, useAI = true } = req.body;

        if(!searchQuery) {
            res.status(404).json({ message: "Search Query is required" });
            return;
        }

        const searchQueryEmbedding = await generateEmbedding(searchQuery);
        const parsedDate = chrono.parseDate(searchQuery);

        const data: any = await prisma.$queryRaw`
            SELECT title, content, "createdAt",
                0.6 * (1 - (embedding <=> ${searchQueryEmbedding}::vector)) AS weighted_similarity,
                0.3 * (CASE WHEN title ILIKE '%' || ${searchQuery} || '%' THEN 1 ELSE 0 END) AS weighted_title,
                0.1 * (CASE WHEN "createdAt"::date = ${parsedDate}::date THEN 1 ELSE 0 END) AS weighted_date,
                0.6 * (1 - (embedding <=> ${searchQueryEmbedding}::vector)) 
                + 0.3 * (CASE WHEN title ILIKE '%' || ${searchQuery} || '%' THEN 1 ELSE 0 END)
                + 0.1 * (CASE WHEN "createdAt"::date = ${parsedDate}::date THEN 1 ELSE 0 END) AS total_score
            FROM "Contents"
            WHERE "userId" = ${userId}
            AND (
                0.6 * (1 - (embedding <=> ${searchQueryEmbedding}::vector)) > ${similarityThreshold} 
                OR title ILIKE '%' || ${searchQuery} || '%' 
                OR "createdAt"::date = ${parsedDate}::date
            )
            ORDER BY total_score DESC
            LIMIT 3;
        `;

        if(data.length === 0) {
            res.status(404).json({ message: "No similar content" });
            return;
        }

        if(!useAI) {
            res.status(200).json({ data });
            return;
        }

        console.log(data);

        const title = data[0].title;
        const context = data.map((d: { content: string }) => d.content).join(", ");
        //const context = `${data[0].content}, ${data[1].content}, ${data[2].content}`;
        const prompt = `
            Context: ${context} — this might be unrelated or partially relevant.
            Questions: ${searchQuery}.
            Instructions:
                -Carefully read both the context and the question.
                -Even if the context is irrelevant or unrelated, focus entirely on answering the question.
                -Provide a detailed, well-reasoned, and clear explanation in your answer.
                -If relevant connections to the context can be made to enhance the answer, 
                 you may briefly mention them — but only if they add genuine value.
                -Otherwise, safely ignore the context and concentrate on the question itself.
        `;
        const response = await useGenAI(prompt);

        res.status(200).json({
            title,
            response,
            contentList: data
        });
    } catch(e) {
        console.log(`error in search route: ${e}`)
        res.status(500).json({"error": "something went wrong while searching"});
        return;
    }
}