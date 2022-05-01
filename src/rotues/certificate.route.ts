import { Router } from "express";
import { NFTStorage as Storage, Blob } from "nft.storage";
import { configService } from "../config/config.service";
const route = Router();

route.get("/create", async (req, res) => {
  try {
    const blob = new Blob([JSON.stringify({ message: "Jaime es muy Gay" })]);
    // create a new NFTStorage client using our API key
    const ipfsStorage = new Storage({
      token: configService.get("STORAGE_KEY"),
    });

    const result = await ipfsStorage.storeBlob(blob);

    res.status(200).json({ ipfsHash: result });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

export default route;
