import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from "lodash.clonedeep";

export class KeyPair{
  constructor() {
    this.privateKey = null;
    this.publicKey = null;
  }

  async generate() {
    const keys = await jscu.pkc.generateKey('EC', {namedCurve: 'P-256'});
    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
    return true;
  }

  setKeyPair(privateKey, publicKey) {
    if (privateKey != null) {
      this.privateKey = cloneDeep(privateKey);
    }
    if (publicKey != null) {
      this.publicKey = cloneDeep(publicKey);
    }
  }

  async sign(msg) {
    return new Uint8Array(await jscu.pkc.sign(msg, this.privateKey, 'SHA-256'));
  }

  async verify(msg, sig) {
    return await jscu.pkc.verify(msg, sig, this.publicKey, 'SHA-256');
  }

  async createPubkeyByte(publicKey) {
    const byteX = await jseu.encoder.decodeBase64Url(publicKey['x']);
    const byteY = await jseu.encoder.decodeBase64Url(publicKey['y']);
    const publicKeyByte = new Uint8Array(65);
    publicKeyByte[0] = 0x04;
    for (let i = 0; i < 32; i++) {
      publicKeyByte[i + 1] = byteX[i];
      publicKeyByte[i + 1 + 32] = byteY[i];
    }
    return publicKeyByte;
  }

}



