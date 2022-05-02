import { Router } from "express";
import { ipfsService } from "../services";
const route = Router();
//<Params,ResBody,ReqBody,ReqQuery,Locals>
interface CIDQuery {
  cid: string;
}

route.get("/create", async (req, res) => {
  try {
    const result = await ipfsService.upload({ message: "Example Test" });
    res.status(200).json({ ipfsHash: result });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

route.get<{}, {}, {}, CIDQuery>("/", async (req, res) => {
  const { cid } = req.query;
  try {
    let response = await ipfsService.get(cid);
    res.status(200).json(response.data);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

export default route;
