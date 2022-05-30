import { BigNumberish, constants, Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import { PQRSD, PQRSD__factory } from "../typechain";
import { formatBytes32String } from "ethers/lib/utils";

export default class PQRSDContract {
  private contract: PQRSD;
  constructor(address: string, wallet: Signer | Provider) {
    this.contract = PQRSD__factory.connect(address, wallet);
  }
  create(owner: string) {
    return this.contract.create(owner);
  }
  update(tokenId: BigNumberish, state: string) {
    return this.contract.update(tokenId, state);
  }
  close(tokenId: BigNumberish) {
    return this.contract.close(tokenId);
  }
  decodeCreateLog() {}
  queryCreateEventForAddress(from: string) {
    const event = this.contract.filters.StatusChanged(
      from,
      null,
      formatBytes32String("CREATED")
    );
    return this.contract.queryFilter(event);
  }
  queryHistoryOfPQRSD(tokenId: BigNumberish) {
    const event = this.contract.filters.StatusChanged(null, tokenId, null);
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
