import jscu from 'js-crypto-utils';
import jseu from "js-encoding-utils";
import jsec from 'js-crypto-ec';

export class KeyPair{
  constructor() {
    this.privateKeyObj = null;
    this.publicKeyObj = null;
  }

  async generate() {
    const keys = await jscu.pkc.generateKey('EC', {namedCurve: 'P-256'});
    this.setKeyPair('jwk', await keys.privateKey.export(), await keys.publicKey.export());
    return true;
  }

  setKeyPair(type, privateKey, publicKey) {
    // console.log("----start-----");
    // console.log(type);
    // console.log(privateKey);
    // console.log(publicKey);
    // console.log("----end-----");
    if (type === 'jwk' ||  type === 'pem' || type === 'der'){
      if (privateKey != null) {
        this.privateKeyObj = new jscu.Key(type, privateKey);
      }
      if (publicKey != null) {
        this.publicKeyObj = new jscu.Key(type, publicKey);
      }
      return true;
    }
    return false;
  }

  async exportPrivateKey(type){
    if (type === 'jwk' ||  type === 'pem' || type === 'der' || type=== 'oct'){
      return await this.privateKeyObj.export(type);
    }
  }

  async exportPublicKey(type){
    if (type === 'jwk' ||  type === 'pem' || type === 'der' || type=== 'oct'){
      return await  this.publicKeyObj.export(type);
    }
  }

  async sign(msg) {
    return new Uint8Array(await jscu.pkc.sign(msg, this.privateKeyObj, 'SHA-256'));
  }

  async verify(msg, sig) {
    console.log("verify");
    console.log(jseu.encoder.arrayBufferToHexString(msg));
    console.log(jseu.encoder.arrayBufferToHexString(sig));
    console.log(jseu.encoder.arrayBufferToHexString(await this.publicKeyObj.export('oct')));
    console.log(await this.publicKeyObj.export('jwk'));
    console.log( await jscu.pkc.verify(msg, sig, this.publicKeyObj, 'SHA-256'));
    return await jscu.pkc.verify(msg, sig, this.publicKeyObj, 'SHA-256');
  }

}
