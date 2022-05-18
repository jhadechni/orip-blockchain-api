import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumberish, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { Router } from "express";
import { CIDString } from "nft.storage";
import { configService } from "../config/config.service";
import { decodePrivateKey } from "../security";
import { ipfsService } from "../services";
import CertificateContract from "../services/contract";
const route = Router();
//<Params,ResBody,ReqBody,ReqQuery,Locals>

type BodyResponse<T> = T | { message: string };

interface TokenQuery {
  tkid: string;
}

interface CreateBody {
  metadata: Object;
  ownerPk: string;
  authPk: string;
}

interface UpdateBody {
  metadata: Object;
  tokenId: BigNumberish;
  authPk: string;
}

enum TxStatus {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

interface CreateResBody {
  ipfsHash: CIDString;
  tokenId: string;
  txHash: string;
  timestamp: number;
  fee: number;
  prevOwner: string | null;
  currentOwner: string;
  status: TxStatus;
}
interface UpdateResBody {
  ipfsHash: CIDString;
  txHash: string;
  timestamp: number;
  fee: number;
  prevOwner: string | null;
  currentOwner: string;
  status: TxStatus;
}

route.post<{}, BodyResponse<CreateResBody>, CreateBody>(
  "/create",
  async (req, res) => {
    try {
      const pk = decodePrivateKey(req.body.authPk);
      const owner = new Wallet(decodePrivateKey(req.body.ownerPk)).address;
      const result = await ipfsService.upload(req.body.metadata);
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      //TODO connect to provider
      const auth = new Wallet(pk).connect(provider);
      const contract = new CertificateContract(
        configService.get("CONTRACT_ADDR"),
        auth
      );
      const tx = await contract.addCertificate(owner, result);
      //wait for mined
      const receipt = await tx.wait();

      const events = await contract.queryMintingEventForAddress(owner);
      const tokenId = events[events.length - 1].args.tokenId.toString();
      const fee = receipt.gasUsed
        .mul(receipt.effectiveGasPrice)
        .div(parseEther("1"))
        .toNumber();
      const block = await provider.getBlock(receipt.blockNumber);
      res.status(200).json({
        ipfsHash: result,
        tokenId,
        txHash: tx.hash,
        fee,
        currentOwner: owner,
        prevOwner: null,
        status: receipt.status === 0 ? TxStatus.ERROR : TxStatus.SUCCESS,
        timestamp: block.timestamp,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
      console.error(e);
    }
  }
);
route.put<{}, BodyResponse<UpdateResBody>, UpdateBody>(
  "/update",
  async (req, res) => {
    try {
      const pk = decodePrivateKey(req.body.authPk);
      const ipfs = await ipfsService.upload(req.body.metadata);
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      //TODO connect to provider
      const auth = new Wallet(pk).connect(provider);
      const contract = new CertificateContract(
        configService.get("CONTRACT_ADDR"),
        auth
      );
      const tx = await contract.updateCertificate(req.body.tokenId, ipfs);
      //wait for mined
      const receipt = await tx.wait();
      /**
       *  effectiveGasPrice:
       *  Prior to EIP-1559 or on chains that do not support it, this value will simply be equal to the transaction gasPrice.
          On EIP-1559 chains, this is equal to the block baseFee for the block that the transaction was included in, plus the transaction 
          maxPriorityFeePerGas clamped to the transaction maxFeePerGas.
       */
      const fee = receipt.gasUsed
        .mul(receipt.effectiveGasPrice)
        .div(parseEther("1"))
        .toNumber();
      const block = await provider.getBlock(receipt.blockNumber);
      const owner = await contract.getOwnerOfTokenId(req.body.tokenId);
      res.status(200).json({
        ipfsHash: ipfs,
        txHash: tx.hash,
        fee,
        currentOwner: owner,
        prevOwner: null,
        status: receipt.status === 0 ? TxStatus.ERROR : TxStatus.SUCCESS,
        timestamp: block.timestamp,
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
      console.error(e);
    }
  }
);

route.get<TokenQuery>("/:tkid", async (req, res) => {
  const { tkid } = req.params;
  try {
    const provider = new JsonRpcProvider(
      configService.get(
        "TESTNET_URL",
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      )
    );
    const contract = new CertificateContract(
      configService.get("CONTRACT_ADDR"),
      provider
    );
    //get the hash
    const ipfsHash = await contract.getUriFromTokenId(tkid);
    //get the data
    let response = await ipfsService.get(ipfsHash);
    res.status(200).json({ data: response.data });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

route.get("/block", async (req, res) => {
  try {
    const provider = new JsonRpcProvider(
      configService.get(
        "TESTNET_URL",
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      )
    );
    const block = await provider.getBlockNumber();
    res.status(200).json({ data: block });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
});

export default route;
