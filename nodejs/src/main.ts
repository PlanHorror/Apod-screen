import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface ApodResponse {
  url: string;
  title: string;
  date: string;
  media_type: string;
}

function checkUrlImage(url: string): boolean {
  return url.endsWith(".jpg") || url.endsWith(".png");
}

function checkUrlYoutube(url: string): boolean {
  return url.startsWith("https://www.youtube.com/embed");
}

async function setWallpaper(imagePath: string): Promise<void> {
  try {
    // Dynamic import for ESM module
    const { setWallpaper } = await import("wallpaper");
    await setWallpaper(imagePath);
    console.log("Wallpaper set successfully");
  } catch (error) {
    console.log("Cannot set image to wallpaper:", error);
  }
}

export async function main(): Promise<string | null> {
  const url = "https://api.nasa.gov/planetary/apod";
  const apiKey = process.env.API_KEY;
  const screenPath = path.join(process.cwd(), "..", "screen");

  // Ensure screen directory exists
  if (!fs.existsSync(screenPath)) {
    fs.mkdirSync(screenPath, { recursive: true });
  }

  try {
    const response = await axios.get<ApodResponse>(url, {
      params: { api_key: apiKey },
    });

    if (response.status === 200) {
      const data = response.data;
      let imageUrl = data.url;
      const title = data.title.replace(/[^a-zA-Z0-9]/g, " "); // Remove special characters
      const date = data.date;

      let imagePath = path.join(screenPath, `${date} ${title}.jpg`);

      if (checkUrlImage(imageUrl)) {
        const imageResponse = await axios.get(imageUrl, {
          responseType: "arraybuffer",
        });

        if (imageResponse.status !== 200) {
          console.log("Failed to fetch image.");
          return null;
        }

        console.log(imageResponse.status);
        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
        await setWallpaper(imagePath);
      } else if (checkUrlYoutube(imageUrl)) {
        console.log("Youtube video");

        // Get the video ID embedded in the URL
        const videoId = imageUrl.split("/").pop()?.split("?")[0] || "";
        console.log(videoId);

        // Get the video thumbnail
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const imageResponse = await axios.get(thumbnailUrl, {
          responseType: "arraybuffer",
        });

        if (imageResponse.status !== 200) {
          return null;
        }

        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
        await setWallpaper(imagePath);
      }

      return `${date} ${title}`;
    } else {
      console.log("Failed to fetch APOD image.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching APOD:", error);
    return null;
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
