import { Wallet } from "ethers";
import { Router } from "express";
import { encodePrivateKey } from "../security";
const route = Router();

//"0xc4bd0276c03530d19a35e490748936bc561c2f2e347f246bdd097078a3aa3bb1"
route.get("/createIdentity", (req, res) => {
  try{
    const wallet = Wallet.createRandom();
    const encodedKey = encodePrivateKey(wallet.privateKey);
    res.status(200).json({ key: encodedKey });
  }catch(err: any){
    res.status(500).json({message: err.message});
    console.error(err);
  }

});

export default route;
