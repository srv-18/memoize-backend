import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateEmbedding = async (text: string): Promise<number[]> => {

    try {
        const response = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: text,
            config: {
                taskType: "SEMANTIC_SIMILARITY"
            }
        });

        console.log(response.embeddings![0].values ?? []);

        return response.embeddings![0].values ?? [];
    } catch(e) {
        console.log(`Error while generating embedding: ${e}`)
        throw new Error("Error generating embedding");
    }
}