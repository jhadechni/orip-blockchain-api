import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Router } from "express";
import { configService } from "../config/config.service";
import { decodePrivateKey, encodePrivateKey } from "../security";
import CertificateContract from "../services/certificateContract";
import { BodyResponse, TxStatus } from "./common.types";
const route = Router();

interface WalletResponse {
  key: string;
  address: string;
}

//"0xc4bd0276c03530d19a35e490748936bc561c2f2e347f246bdd097078a3aa3bb1"
route.get<{}, BodyResponse<WalletResponse>>("/createIdentity", (req, res) => {
  try {
    const wallet = Wallet.createRandom();
    const encodedKey = encodePrivateKey(wallet.privateKey);
    res.status(200).json({ key: encodedKey, address: wallet.address });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    console.error(err);
  }
});

interface NewAndRemoveAdminRequest {
  data: {
    authPk: string;
    adminPk: string;
  };
}
interface NewAndRemoveAdminResponse {
  txHash: string;
  timestamp: number;
  fee: string;
  status: TxStatus;
}

route.post<
  {},
  BodyResponse<NewAndRemoveAdminResponse>,
  NewAndRemoveAdminRequest
>("/newAdmin", async (req, res) => {
  try {
    const { authPk, adminPk } = req.body.data;
    const newAdmin = new Wallet(decodePrivateKey(adminPk)).address;
    const provider = new JsonRpcProvider(
      configService.get(
        "TESTNET_URL",
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      )
    );
    const auth = new Wallet(decodePrivateKey(authPk)).connect(provider);
    const contract = new CertificateContract(
      configService.get("CERTIFICATE_CONTRACT"),
      auth
    );
    const tx = await contract.addAdmin(newAdmin);
    //wait for mined
    const receipt = await tx.wait();
    const fee = formatEther(receipt.gasUsed.mul(tx.gasPrice!));
    const block = await provider.getBlock(receipt.blockNumber);
    res.status(200).json({
      txHash: tx.hash,
      fee,
      status: receipt.status === 0 ? TxStatus.ERROR : TxStatus.SUCCESS,
      timestamp: block.timestamp,
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.log(e);
  }
});
route.post<
  {},
  BodyResponse<NewAndRemoveAdminResponse>,
  NewAndRemoveAdminRequest
>("/removeAdmin", async (req, res) => {
  try {
    const { authPk, adminPk } = req.body.data;
    const newAdmin = new Wallet(decodePrivateKey(adminPk)).address;
    const provider = new JsonRpcProvider(
      configService.get(
        "TESTNET_URL",
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      )
    );
    const auth = new Wallet(decodePrivateKey(authPk)).connect(provider);
    const contract = new CertificateContract(
      configService.get("CERTIFICATE_CONTRACT"),
      auth
    );
    const tx = await contract.removeAdmin(newAdmin);
    //wait for mined
    const receipt = await tx.wait();
    const fee = formatEther(receipt.gasUsed.mul(tx.gasPrice!));
    const block = await provider.getBlock(receipt.blockNumber);
    res.status(200).json({
      txHash: tx.hash,
      fee,
      status: receipt.status === 0 ? TxStatus.ERROR : TxStatus.SUCCESS,
      timestamp: block.timestamp,
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
    console.log(e);
  }
});

interface CheckAdminRequest {
  pk: string;
}
route.get<CheckAdminRequest, BodyResponse<boolean>>(
  "/admin/:pk",
  async (req, res) => {
    try {
      const provider = new JsonRpcProvider(
        configService.get(
          "TESTNET_URL",
          "https://data-seed-prebsc-1-s1.binance.org:8545/"
        )
      );
      const contract = new CertificateContract(
        configService.get("CERTIFICATE_CONTRACT"),
        provider
      );
      const isAdmin = await contract.isAdmin(req.params.pk);
      res.status(200).json(isAdmin);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
      console.log(e);
    }
  }
);

export default route;
