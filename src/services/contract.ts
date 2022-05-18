import { BigNumberish, constants, Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import { CertificadoTIL, CertificadoTIL__factory } from "../typechain";

export default class CertificateContract {
  private contract: CertificadoTIL;
  constructor(address: string, wallet: Signer | Provider) {
    this.contract = CertificadoTIL__factory.connect(address, wallet);
  }
  addCertificate(owner: string, ipfsHash: string) {
    return this.contract.addCertificado(owner, ipfsHash);
  }
  updateCertificate(id: BigNumberish, ipfsHash: string) {
    return this.contract.updateCertificado(id, ipfsHash);
  }
  queryMintingEventForAddress(to: string) {
    const event = this.contract.filters.Transfer(constants.AddressZero, to);
    return this.contract.queryFilter(event);
  }
  queryUpdateEventForToken(tokenId: BigNumberish) {
    const event = this.contract.filters.TokenUpdated(tokenId);
    return this.contract.queryFilter(event);
  }
  getOwnerOfTokenId(tokenId: BigNumberish) {
    return this.contract.ownerOf(tokenId);
  }
  getUriFromTokenId(tokenId: BigNumberish) {
    return this.contract.tokenURI(tokenId);
  }
  transferToken(from: string, to: string, tokenId: BigNumberish) {
    return this.contract.transferFrom(from, to, tokenId);
  }
  instance() {
    return this.contract;
  }
}
