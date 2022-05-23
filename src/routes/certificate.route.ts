import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber, BigNumberish, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { Router } from "express";
import { CIDString } from "nft.storage";
import { configService } from "../config/config.service";
import { decodePrivateKey } from "../security";
import { ipfsService } from "../services";
import CertificateContract from "../services/contract";
import { BodyResponse } from "./commo.types";
const route = Router();
//<Params,ResBody,ReqBody,ReqQuery,Locals>

interface TokenQuery {
  tkid: string;
}

interface CreateBody {
  data: {
    metadata: Object;
    ownerPk: string;
    authPk: string;
  };
}

interface UpdateBody {
  data: {
    metadata: any;
    tokenId: BigNumberish;
    authPk: string;
  };
}

interface TransferBody {
  data: {
    fromPk: string;
    toPk: string;
    tokenId: BigNumberish;
  };
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
interface TransferResBody {
  txHash: string;
  timestamp: number;
  fee: number;
  prevOwner: string;
  currentOwner: string;
  status: TxStatus;
}

route.post<{}, BodyResponse<CreateResBody>, CreateBody>(
  "/create",
  async (req, res) => {
    try {
      const pk = decodePrivateKey(req.body.data.authPk);
      const owner = new Wallet(decodePrivateKey(req.body.data.ownerPk)).address;
      const result = await ipfsService.upload(req.body.data.metadata);
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
      const pk = decodePrivateKey(req.body.data.authPk);
      const ipfs = await ipfsService.upload(req.body.data.metadata);
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      const auth = new Wallet(pk).connect(provider);
      const contract = new CertificateContract(
        configService.get("CONTRACT_ADDR"),
        auth
      );
      const tx = await contract.updateCertificate(req.body.data.tokenId, ipfs);
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
      const owner = await contract.getOwnerOfTokenId(req.body.data.tokenId);
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

route.post<{}, BodyResponse<TransferResBody>, TransferBody>(
  "/transfer",
  async (req, res) => {
    const { fromPk, toPk, tokenId } = req.body.data;
    try {
      const from = decodePrivateKey(fromPk);
      const to = new Wallet(decodePrivateKey(toPk)).address;
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      const fromAuth = new Wallet(from).connect(provider);
      const contract = new CertificateContract(
        configService.get("CONTRACT_ADDR"),
        fromAuth
      );

      const tx = await contract.transferToken(fromAuth.address, to, tokenId);
      const receipt = await tx.wait();

      const fee = receipt.gasUsed
        .mul(receipt.effectiveGasPrice)
        .div(parseEther("1"))
        .toNumber();
      const block = await provider.getBlock(receipt.blockNumber);
      res.status(200).json({
        txHash: tx.hash,
        fee,
        currentOwner: toPk,
        prevOwner: fromPk,
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

interface TransferEvent {
  from: string;
  to: string;
  tokenId: string;
}

route.get<TokenQuery,BodyResponse<TransferEvent[]>>("/transfers/:tkid", async (req, res) => {
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
    //get the event history
   const tranferEvents = await contract.queryTransferHistory(BigNumber.from(tkid));
   const parsedEvents: TransferEvent[] = tranferEvents.map(e => ({
    from: e.args.from,
    to: e.args.to,
    tokenId: e.args.tokenId.toString()
   }))
   res.status(200).json(parsedEvents);
  }catch(e: any){
    res.status(500).json({message: e.message});
    console.log(e);
  }
});

export default route;
