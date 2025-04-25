import { Request, Response } from "express";
import { generateEmbedding } from "../workers/embeddings-worker";
import prisma from "../client";
import puppeteer from "puppeteer";

const getTwitterData = async (url: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("body");

    const data = await page.evaluate(() => {
        const tweet = document.querySelector("article div[data-testid='tweetText']")?.textContent?.trim() || "No tweet";
        const author = document.querySelector("article a[role='link'] span")?.textContent?.trim() || "No author";

        return { title: `Tweeted by ${author}`, content: tweet};
    });

    await browser.close();
    return data;
}

const getYoutubeData = async (url: string) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("body");

    const data = await page.evaluate(() => {
        const title = document.
            querySelector("ytd-app ytd-watch-metadata yt-formatted-string")?.
            textContent?.trim() || "No video";
        const content = document.
            querySelector("ytd-app ytd-watch-metadata span[class='yt-core-attributed-string--link-inherit-color']")?.
            textContent?.trim() || "No content";

        return { title, content};
    });

    await browser.close();
    return data;
}

const getWebsiteData = async (url: string) => {
    const browser = await puppeteer.launch({ headless: true, args:["--ignore-certificate-errors"] });
    const page = await browser.newPage();

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("body");

    const data = await page.evaluate(() => {
        const title = document.title || "No title available";
        const content = document.body.innerText?.trim() || "";

        return { title, content};
    });
    
    await browser.close();
    return data;
}

export const uploadLink = async (req: Request, res: Response) => {
    try {
        const { url, userId } = req.body;
        let data;

        if(url.includes("twitter.com") || url.includes("x.com")) {
            data = await getTwitterData(url);
        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
            data = await getYoutubeData(url);
        } else {
            data = await getWebsiteData(url);
        }

        console.log(data);
        
        if(!data) {
            res.status(400).json({ message: `Unable to get content from ${url}` });
            return;
        }

        const embedding = await generateEmbedding(`title: ${data.title}, content: ${data.content}, createdAt: ${new Date()}`);

        const contentType = "LINK";

        const link = await prisma.$executeRaw`
            INSERT INTO "Contents" 
                (id, title, content, "url", "type", embedding, "userId") 
            VALUES 
                (gen_random_uuid(), ${data.title}, ${data.content}, ${url}, ${contentType}::"ContentType", ${embedding}::vector, ${userId})
            RETURNING *;
        `;

        console.log(link);

        res.status(200).json({ link });

    } catch(e) {
        console.log(`error in upload link route: ${e}`)
        res.status(500).json({"error": "something went wrong while uploading link"});
        return;
    }
}