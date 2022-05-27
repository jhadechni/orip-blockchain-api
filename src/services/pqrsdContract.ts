import { BigNumberish, constants, Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import { PQRSD, PQRSD__factory } from "../typechain";

export default class PQRSDContract {
  private contract: PQRSD;
  constructor(address: string, wallet: Signer | Provider) {
    this.contract = PQRSD__factory.connect(address, wallet);
  }
  create() {
    return this.contract.create();
  }
  update(tokenId: BigNumberish, state: string) {
    return this.contract.update(tokenId, state);
  }
  close(tokenId: BigNumberish) {
    return this.contract.close(tokenId);
  }
  queryCreateEventForAddress(from: string) {
    const event = this.contract.filters.StatusChanged(from, null, "CREATED");
    return this.contract.queryFilter(event);
  }

  /* getOwnerOfTokenId(tokenId: BigNumberish) {
    return this.contract.ownerOf(tokenId);
  }
  getUriFromTokenId(tokenId: BigNumberish) {
    return this.contract.tokenURI(tokenId);
  }
  compraVenta(from: string, to: string, tokenId: BigNumberish, uri: string) {
    return this.contract.compraVenta(from, to, tokenId, uri);
  } */
  instance() {
    return this.contract;
  }
}
