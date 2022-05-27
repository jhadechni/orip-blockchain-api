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
    return this.contract.anotacion(id, ipfsHash);
  }
  queryMintingEventForAddress(to: string) {
    const event = this.contract.filters.Transfer(constants.AddressZero, to);
    return this.contract.queryFilter(event);
  }
  queryAnnotationsForToken(tokenId: BigNumberish) {
    const event = this.contract.filters.Anotacion(tokenId);
    return this.contract.queryFilter(event);
  }
  queryCompraVentaHistory(tokenId: BigNumberish) {
    const event = this.contract.filters.CompraVenta(null, null, tokenId);
    return this.contract.queryFilter(event);
  }
  getOwnerOfTokenId(tokenId: BigNumberish) {
    return this.contract.ownerOf(tokenId);
  }
  getUriFromTokenId(tokenId: BigNumberish) {
    return this.contract.tokenURI(tokenId);
  }
  compraVenta(from: string, to: string, tokenId: BigNumberish, uri: string) {
    return this.contract.compraVenta(from, to, tokenId, uri);
  }
  instance() {
    return this.contract;
  }
}
