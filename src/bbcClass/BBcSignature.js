import { KeyPair } from './KeyPair.js';
import jseu from 'js-encoding-utils';
import * as helper from '../helper.js';
import * as para from '../parameter.js';
import cloneDeep from 'lodash.clonedeep';

export class BBcSignature{
  constructor(keyType) {
    this.keyType = keyType;
    this.signature = new Uint8Array(0);
    this.pubkey = null;
    this.pubkeyByte = new Uint8Array(0);
    this.keypair = null;
    this.notInitialized = true;
  }

  showSig() {
    console.log('keyType :',this.keyType);
    console.log('signature :', jseu.encoder.arrayBufferToHexString(this.signature));
    if (this.pubkey != null){
      console.log('pubkey :', this.pubkey);
    }
    console.log('pubkeyByte :', jseu.encoder.arrayBufferToHexString(this.pubkeyByte));
    if (this.keypair != null) {
      console.log('keypair :', this.keypair);
    }
    console.log('notInitialized :',this.notInitialized);
  }

  async add(signature, pubKey) {
    if (signature != null) {
      this.notInitialized = false;
      this.signature = cloneDeep(signature);
    }
    if (pubKey != null) {
      this.pubkeyByte = await helper.createPubkeyByte(cloneDeep(pubKey));
      this.keypair = new KeyPair();
      this.keypair.setKeyPair('jwk', null, cloneDeep(pubKey));
    }
    return true;
  }

  setSignature(signature) {
    this.notInitialized = false;
    this.signature = cloneDeep(signature);
  }

  pack() {
    let binaryData = [];
    if (this.keyType === para.KeyType.NOT_INITIALIZED){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.keyType, 4)));
    }else {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.keyType, 4)));
      binaryData = binaryData.concat(Array.from(helper.hbo(this.pubkeyByte.length * 8, 4)));
      binaryData = binaryData.concat(Array.from(this.pubkeyByte));
      binaryData = binaryData.concat(Array.from(helper.hbo(this.signature.length * 8, 4)));
      binaryData = binaryData.concat(Array.from(this.signature));
    }
    return new Uint8Array(binaryData);
  }

  async unpack(data) {

    let posStart = 0;
    let posEnd = 4; // uint32

    this.keyType =  helper.hboToInt32(data.slice(posStart,posEnd));

    if (this.keyType === para.KeyType.NOT_INITIALIZED){
      return true;
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    let valueLength =  helper.hboToInt32(data.slice(posStart,posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + (valueLength / 8);
      this.pubkeyByte = data.slice(posStart, posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength =  helper.hboToInt32(data.slice(posStart,posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + (valueLength / 8 );
      this.signature = data.slice(posStart, posEnd);
    }

    if (this.pubkeyByte.length > 0 && this.signature.length > 0){
      //65byteの鍵形式からJwkへ変換してinput
      await this.add(this.signature, this.convertRawHexKeyToJwk(this.pubkeyByte, 'P-256'));
    }

    return true;
  }

  async verify(transactionBase) {
    if (this.keypair === null) {
      return false;
    }
    return await this.keypair.verify(transactionBase, this.signature);
  }

  convertRawHexKeyToJwk(hexKeyObj, algorithm) {
    const len = 16;
    const offset = 1;
    const hexX = hexKeyObj.slice(offset, offset + len * 2);
    const hexY = hexKeyObj.slice(offset + len * 2, offset + len * 4);
    const b64uX = jseu.encoder.encodeBase64Url(hexX);
    const b64uY = jseu.encoder.encodeBase64Url(hexY);

    return { // https://www.rfc-editor.org/rfc/rfc7518.txt
      crv: algorithm,
      ext: true,
      kty: 'EC', // or "RSA", "oct"
      x: b64uX, // hex to base64url
      y: b64uY
    };
  }

}

