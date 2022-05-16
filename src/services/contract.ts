import { constants, Signer } from "ethers";
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
  updateCertificate(id: number, ipfsHash: string) {
    return this.contract.updateCertificado(id, ipfsHash);
  }
  queryMintingEventForAddress(to: string) {
    const event = this.contract.filters.Transfer(constants.AddressZero, to);
    return this.contract.queryFilter(event);
  }
  queryUpdateEventForToken(tokenId: number) {
    const event = this.contract.filters.TokenUpdated(tokenId);
    return this.contract.queryFilter(event);
  }
  instance() {
    return this.contract;
  }
}
