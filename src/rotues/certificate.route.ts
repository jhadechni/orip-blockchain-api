import { Router } from "express";
import { ipfsUpload } from "@tatumio/tatum";
const route = Router();

route.post("/create", async (req, res) => {
  // await ipfsUpload()
});

export default route;
