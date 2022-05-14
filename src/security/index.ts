import { configService } from "../config/config.service";
import { createCipheriv, createDecipheriv } from "crypto";

const algorithm = configService.get("ALGORITHM");
const secret = configService.get("SECURITY_KEY");
const iv = configService.get("INIT_VECTOR");

/**
 * @see https://www.section.io/engineering-education/data-encryption-and-decryption-in-node-js-using-crypto/#:~:text=You%20use%20symmetric%20encryption%20if,hashed%20passwords%20in%20the%20database.
 */
export const encodePrivateKey = (pk: string): string => {
  const cipher = createCipheriv(algorithm, secret, iv);
  let encryptedData = cipher.update(pk, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return encryptedData;
};

export const decodePrivateKey = (encoded: string) => {
  // the decipher function
  const decipher = createDecipheriv(algorithm, secret, iv);
  let decryptedData = decipher.update(encoded, "hex", "utf-8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};
