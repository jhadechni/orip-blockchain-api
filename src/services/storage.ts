import axios from "axios";
import { NFTStorage, Blob } from "nft.storage";
import { configService } from "../config/config.service";
import { CertificateMetadata } from "../routes/common.types";

class IPFSStorage {
  private storage: NFTStorage;
  private static instance: IPFSStorage;
  private constructor(token: string) {
    this.storage = new NFTStorage({
      token,
    });
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new IPFSStorage(configService.get("STORAGE_KEY"));
    }
    return this.instance;
  }
  upload(json: any) {
    return this.storage.storeBlob(new Blob([JSON.stringify(json)]));
  }
  delete(cid: string) {
    return this.storage.delete(cid);
  }
  get(cid: string) {
    return axios.get<CertificateMetadata>(
      `https://${cid}.ipfs.nftstorage.link/`
    );
  }
}

export const ipfsService = IPFSStorage.getInstance();
