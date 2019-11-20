import { KeyPair } from './KeyPair.js';
import jseu from 'js-encoding-utils';
import * as helper from '../helper.js';
import {KeyType} from '../parameter.js';
import cloneDeep from 'lodash.clonedeep';

export class BBcSignature{
  /**
   *
   * constructor
   * @param {Number} keyType
   */
  constructor(keyType) {
    this.keyType = keyType;
    this.signature = new Uint8Array(0);
    this.keypair = null;
    this.notInitialized = true;
  }

  /**
   *
   * get dump data
   * @param {Number} intentNum
   * @return {String}
   */
  dump(intentNum=0) {
    let intent = '';
    for(let i = 0; i < intentNum; i++){
      intent += '  ';
    }
    let dump = `${intent}--Signature--\n`;
    dump += `${intent}keyType: ${this.keyType}\n`;
    dump += `${intent}signature: ${jseu.encoder.arrayBufferToHexString(this.signature)}\n`;
    if (this.keypair != null) {
      if (this.keypair.publicKeyObj != null){
        dump += `${intent}pubkey: ${jseu.encoder.arrayBufferToHexString(this.keypair.exportPublicKey('oct'))}\n`;
      }
      dump += `${intent}keypair: ${jseu.encoder.arrayBufferToHexString(this.keypair.dump(intentNum + 1))}\n`;
    }
    dump += `${intent}--end Signature--`;
    return dump;

  }

  /**
   *
   * add signature and jwt public key
   * @param {Uint8Array} _signature
   * @param {Object} _pubKey
   * @return {BBcSignature}
   */
  async addSignatureAndPublicKey(_signature, _pubKey) {
    if (_signature != null) {
      this.notInitialized = false;
      this.signature = cloneDeep(_signature);
    }
    if (_pubKey != null) {
      this.keypair = new KeyPair();
      this.keypair.setKeyPair('jwk', null, cloneDeep(_pubKey));
    }
    return this;
  }

  /**
   *
   * set signature
   * @param {Uint8Array} _signature
   * @return {BBcSignature}
   */
  setSignature(_signature) {
    this.notInitialized = false;
    this.signature = cloneDeep(_signature);
    return this;
  }

  /**
   *
   * pack signature data
   * @return {Uint8Array}
   */
  async pack() {
    let binaryData = [];
    if (this.keyType === KeyType.NOT_INITIALIZED){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.keyType, 4)));
    }else {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.keyType, 4)));
      const pubkey = await this.keypair.exportPublicKey('oct');
      binaryData = binaryData.concat(Array.from(helper.hbo(pubkey.length * 8, 4)));
      binaryData = binaryData.concat(Array.from(await this.keypair.exportPublicKey('oct')));
      binaryData = binaryData.concat(Array.from(helper.hbo(this.signature.length * 8, 4)));
      binaryData = binaryData.concat(Array.from(this.signature));
    }
    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack signature data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  async unpack(_data) {

    let posStart = 0;
    let posEnd = 4; // uint32

    this.keyType =  helper.hboToInt32(_data.slice(posStart,posEnd));

    if (this.keyType === KeyType.NOT_INITIALIZED){
      return true;
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    let valueLength =  helper.hboToInt32(_data.slice(posStart,posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + (valueLength / 8);
      this.keypair = new KeyPair();
      this.keypair.setKeyPair('oct', null,  _data.slice(posStart, posEnd));
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength =  helper.hboToInt32(_data.slice(posStart,posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + (valueLength / 8);
      this.signature = _data.slice(posStart, posEnd);
      await this.addSignatureAndPublicKey(this.signature,null);
    }

    return true;
  }

  /**
   *
   * verify signature
   * @param {Uint8Array} _transactionBase
   * @return {Uint8Array}
   */
  async verify(_transactionBase) {
    if (this.keypair === null) {
      return false;
    }
    return await this.keypair.verify(_transactionBase, this.signature);
  }

  /**
   *
   * convert hex key string to jwk
   * @param {Uint8Array} _hexKeyObj
   * @param {String} _algorithm
   * @return {Object}
   */
  convertRawHexKeyToJwk(_hexKeyObj, _algorithm) {
    const len = 16;
    const offset = 1;
    const hexX = _hexKeyObj.slice(offset, offset + len * 2);
    const hexY = _hexKeyObj.slice(offset + len * 2, offset + len * 4);
    const b64uX = jseu.encoder.encodeBase64Url(hexX);
    const b64uY = jseu.encoder.encodeBase64Url(hexY);

    return { // https://www.rfc-editor.org/rfc/rfc7518.txt
      crv: _algorithm,
      ext: true,
      kty: 'EC', // or "RSA", "oct"
      x: b64uX, // hex to base64url
      y: b64uY
    };
  }

}

