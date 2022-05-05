import { Wallet } from "ethers";
import { Router } from "express";
import { configService } from "../config/config.service";
import { decodePrivateKey } from "../security";
import { ipfsService } from "../services";
import CertificateContract from "../services/contract";
const route = Router();
//<Params,ResBody,ReqBody,ReqQuery,Locals>
interface CIDQuery {
  cid: string;
}

interface CreateBody {
  metadata: Object;
  owner: string;
  authPk: string;
}

route.post<{}, {}, CreateBody>("/create", async (req, res) => {
  try {
    const pk = decodePrivateKey(req.body.authPk);
    const result = await ipfsService.upload(req.body.metadata);
    //TODO connect to provider
    const auth = new Wallet(pk);
    const contract = new CertificateContract(
      configService.get("CONTRACT_ADDR"),
      auth
    );
    const tx = await contract.addCertificate(req.body.owner, result);
    //wait for mined
    await tx.wait();

    const events = await contract.queryMintingEventForAddress(req.body.owner);
    const tkId = events[events.length - 1].args.tokenId.toString();
    res.status(200).json({ ipfsHash: result, tkId });
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
