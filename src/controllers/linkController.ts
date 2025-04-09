import { Request, Response } from "express";
import puppeteer from "puppeteer";
import axios from "axios";
import { getEmbedding } from "../services/embeddingService.js";
import prisma from "../prisma.js";
import { request } from "http";
import { error } from "console";
import { PassThrough } from "stream";

type YoutubeApiResponses = {
  items: {
    snippet: {
      title: string;
      description: string;
      thumbnails: { high?: { url: string } };
    };
  }[];
};

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

//function to fetch website meta data using puppeteer
const fetchWebsiteMetadata = async (url: string) => {
  //launch browser with puppeteer to scrap meta data
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--ignore-certificate-errors"],
  });

  // Create a new page in the browser
  const page = await browser.newPage();

  // Set a custom user agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
  );

  // Set a timeout for the page load
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // Wait for the page to load completely
  await page.waitForSelector("body");

  // Get the page content and extract metadata
  const metadata = await page.evaluate(() => {
    // Get the title of the page
    const title = document.title || "No title available";
    // Get the content of the page
    const bodyText = document.body.innerText?.trim() || "";

    //get the open graph image for thumbnail
    const ogImage =
      document
        .querySelector("meta[property='og:image']")
        ?.getAttribute("content") || null;
    //get the favicon for thumbnail
    const favIcon =
      document
        .querySelector("link[rel='shortcut icon']")
        ?.getAttribute("href") ||
      document.querySelector("link[rel='icon']")?.getAttribute("href");
    //get the first image in the page for thumbnail
    const firstImg = document.querySelector("img")?.getAttribute("src");

    //function to get the absolute url of the image
    const absoluteUrl = (imgUrl?: string | null): string | null => {
      if (!imgUrl) return null;
      return imgUrl.startsWith("http")
        ? imgUrl
        : new URL(imgUrl, window.location.href).href;
    };

    //return the metadata object
    return {
      title,
      content: bodyText,
      thumbnail:
        absoluteUrl(ogImage) ||
        absoluteUrl(favIcon) ||
        absoluteUrl(firstImg) ||
        null,
    };
  });

  await browser.close();
  return metadata;
};

//function to fetch the YOUTUBE metadata using youtube api
const fethYoutubeMetadata = async (url: string) => {
  try {
    const vId = url.match(
      /(?:youtube\.com\/watch\?v= |youtu\.be\/)([^&]+)/
    )?.[1];

    if (!vId) throw new Error("Invalid Youtube URL");

    const responses = await axios.get<YoutubeApiResponses>(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${vId}&key=${YOUTUBE_API_KEY}`
    );

    const videoInfo = responses.data.items[0].snippet;
    if (!videoInfo) throw new Error("No video found");

    return {
      title: videoInfo.title,
      content: videoInfo.description,
      thumbnail: videoInfo.thumbnails.high?.url || null,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};

const fetchTwitterMetadata = async (url: string) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
  );

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  await page.waitForSelector("body");

  const metadata = await page.evaluate(() => {
    const tweet =
      document
        .querySelector("artticle div[data-testid = 'tweetTet']")
        ?.textContent?.trimEnd() || "No tweet content available";

    const author =
      document
        .querySelector("article a[role = 'link'] span")
        ?.textContent?.trim() || "Unknown author";

    return {
      title: `tweet by ${author}`,
      content: tweet,
      thumbnail: null,
    };
  });
  await browser.close();
  return metadata;
};

// function to create link of the url given
export const createLink = async (request: Request, response: Response) => {
  try {
    const { url, userId } = request.body;

    if (!url) {
      return response.status(400).json({ message: "URL is required" });
    }

    let metadata;

    if (url.includes("twitter.com") || url.includes("x.com")) {
      //fetch the metadata from the url using twitter api
      metadata = await fetchTwitterMetadata(url);
    } else if (
      url.includes("https://www.youtube.com/watch") ||
      url.includes("youtube.be")
    ) {
      metadata = await fethYoutubeMetadata(url);
    } else metadata = await fetchWebsiteMetadata(url);

    if (!metadata) {
      return response
        .status(400)
        .json({ message: "Unable to fetch metadata " });
    }

    if (!metadata.title) {
      return response.status(400).json({ error: "unable to fetch title" });
    }

    const createdAt = new Date();

    const embedding = await getEmbedding(
      `title+${metadata.title}\nDate:${createdAt}\n Content : ${metadata.content}`
    );

    const contentType = "LINK";
    const metadataJson = { thumbnail: metadata.thumbnail };

    const note =
      await prisma.$executeRaw`Insert INTO "Content" (id,url,metadata,title,content,embedding,"userId", "type","createdAt","updatedAt") VALUES(
          gen_random_uuid(),
          ${url},
          ${JSON.stringify(metadataJson)}::jsonb,
          ${metadata.title},
          ${metadata.content},
          ${embedding}::vector,
          ${userId},
          ${contentType}::ContentType,
          ${createdAt},
          ${createdAt},
        )
          RETURNING *;
          `;

    return response.status(201).json(note);
  } catch (error) {
    console.error("Error creating link", error);
    return response.status(500).json({ message: "Internal server error" });
  }
};
