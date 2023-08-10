import { scrypt, randomBytes } from "crypto";

export async function hash(value: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(8).toString("hex");
    scrypt(value, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function verifyHash(hash: string, value: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    scrypt(value, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key == derivedKey.toString("hex"));
    });
  });
}
