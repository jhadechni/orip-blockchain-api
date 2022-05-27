import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import {
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers/lib/utils";
import { Router } from "express";
import { configService } from "../config/config.service";
import { decodePrivateKey } from "../security";
import PQRSDContract from "../services/pqrsdContract";
import { BodyResponse, TxStatus } from "./common.types";

const route = Router();
//<Params,ResBody,ReqBody,ReqQuery,Locals>

interface CreatePQRSD {
  data: {
    ownerPk: string;
  };
}

interface CreatePQRSDResponse {
  txHash: string;
  tokenId: string;
  timestamp: number;
  fee: string;
  status: TxStatus;
}

route.post<{}, BodyResponse<CreatePQRSDResponse>, CreatePQRSD>(
  "/create",
  async (req, res) => {
    const { ownerPk } = req.body.data;
    try {
      const from = decodePrivateKey(ownerPk);
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      const fromAuth = new Wallet(from).connect(provider);
      const contract = new PQRSDContract(
        configService.get("PQRSD_CONTRACT"),
        fromAuth
      );
      const tx = await contract.create();
      const receipt = await tx.wait();
      const events = await contract.queryCreateEventForAddress(
        fromAuth.address
      );
      const tokenId = events[events.length - 1].args.tokenId.toString();

      const fee = formatEther(receipt.gasUsed.mul(tx.gasPrice!));
      const block = await provider.getBlock(receipt.blockNumber);
      res.status(200).json({
        txHash: tx.hash,
        tokenId,
        fee,
        status: receipt.status === 0 ? TxStatus.ERROR : TxStatus.SUCCESS,
        timestamp: block.timestamp,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
      console.error(e);
    }
  }
);

export default route;
