import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {idsLength} from './idsLength.js';

export class BBcAsset{
  /**
   *
   * constructor
   * @param {Uint8Array} userId
   * @param {Object} idsLengthConf
   */
  constructor(userId, idsLengthConf=null) {
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf); // dict
    }else{
      this.setLength(idsLength); // dict
    }
    this.setUserId(userId); // Uint8Array
    this.assetId = new Uint8Array(this.idsLength.assetId); // Uint8Array
    this.nonce = new Uint8Array(this.idsLength.nonce); // Uint8Array
    this.assetFile = new Uint8Array(); // Uint8Array
    this.assetFileSize = 0; // int
    this.assetFileDigest = new Uint8Array(0); // Uint8Array
    this.assetBodyType = 0; // int
    this.assetBodySize = 0; // int
    this.assetBody = new Uint8Array(0); // Uint8Array
  }

  /**
   *
   * set length
   * @param {Object<{ transactionId: number, assetGroupId: number, userId: number, assetId: number,nonce: number }>} _idsLength
   */
  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }

  /**
   *
   * get dump data
   * @return String
   */
  dump() {
    let dump = '--Asset--\n';
    if (this.assetId != null) {
      dump += `assetId: ${jseu.encoder.arrayBufferToHexString(this.assetId)}\n`;
    }
    dump += `userId: ${jseu.encoder.arrayBufferToHexString(this.userId)}\n`;
    dump += `nonce: ${jseu.encoder.arrayBufferToHexString(this.nonce)}\n`;
    dump += `assetFileSize: ${this.assetFileSize}\n`;
    dump += `assetFileDigest: ${jseu.encoder.arrayBufferToHexString(this.assetFileDigest)}\n`;
    dump += `assetBodyType: ${this.assetBodyType}\n`;
    dump += `assetBodySize: ${this.assetBodySize}\n`;
    dump += `assetBody: ${jseu.encoder.arrayBufferToHexString(this.assetBody)}\n`;
    dump += '--end Asset--\n';
    return dump;
  }

  /**
   *
   * set random nonce
   */
  async setRandomNonce() {
    this.nonce = await jscu.random.getRandomBytes(this.idsLength.nonce);
  }

  /**
   *
   * set nonce
   * @param {Uint8Array} _nonce
   */
  setNonce(_nonce) {
    this.nonce = _nonce;
  }

  /**
   *
   * set user id
   * @param {Uint8Array} _userId
   */
  setUserId(_userId) {
    if (_userId != null) {
      this.userId = cloneDeep(_userId);
    }
  }

  /**
   *
   * add asset
   * @param {Uint8Array} _assetFile
   * @param {Uint8Array} _assetBody
   * @returns {Boolean}
   */
  async addAsset(_assetFile, _assetBody) {
    if (_assetFile !== null) {
      this.assetFileSize = _assetFile.length;
      this.assetFileDigest = await jscu.hash.compute(_assetFile, 'SHA-256');
    }

    if (_assetBody !== null) {
      this.assetBody = _assetBody;
      this.assetBodySize = _assetBody.length;
    }
    await this.digest();

    return true;
  }

  /**
   *
   * get digest
   * @return {Uint8Array}
   */
  async digest() {
    const target = this.getDigest();
    const id = await jscu.hash.compute(target, 'SHA-256');
    this.assetId = id.slice(0, this.idsLength.assetId);
    return this.assetId;
  }

  /**
   *
   * set asset id
   * @return {Uint8Array}
   */
  async setAssetId() {
    const target = this.getDigest();
    this.assetId = await jscu.hash.compute(target, 'SHA-256');
    return this.assetId;
  }

  /**
   *
   * get asset file
   * @return {Uint8Array}
   */
  getAssetFile() {
    return this.assetFile;
  }

  /**
   *
   * get asset file digest
   * @returns {Uint8Array}
   */
  getAssetFileDigest() {
    return this.assetFileDigest;
  }

  /**
   *
   * check asset file digest
   * @param {Uint8Array} _assetFile
   * @return {Boolean}
   */
  async checkAssetFile(_assetFile) {
    const digest = await jscu.hash.compute(_assetFile, 'SHA-256');
    return (digest === this.assetFileDigest);
  }

  /**
   *
   * get digest
   * @return {Uint8Array}
   */
  getDigest() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.userId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.userId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.nonce.length, 2)));
    binaryData = binaryData.concat(Array.from(this.nonce));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetFileSize, 4)));
    if (this.assetFileSize > 0){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetFileDigest.length, 2)));
      binaryData = binaryData.concat(Array.from(this.assetFileDigest));
    }
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetBodyType, 2)));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetBodySize, 2)));
    if (this.assetBodySize > 0 && this.assetBody != null){
      binaryData = binaryData.concat(Array.from(this.assetBody));
    }

    return new Uint8Array(binaryData);
  }

  /**
   *
   * pack asset data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.assetId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.userId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.userId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.nonce.length, 2)));
    binaryData = binaryData.concat(Array.from(this.nonce));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetFileSize, 4)));
    if (this.assetFileSize > 0){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetFileDigest.length, 2)));
      binaryData = binaryData.concat(Array.from(this.assetFileDigest));
    }
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetBodyType, 2)));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetBodySize, 2)));
    if (this.assetBodySize > 0 && this.assetBody != null){
      binaryData = binaryData.concat(Array.from(this.assetBody));
    }

    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack asset data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {

    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = _data.slice(posStart,posEnd);

    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));
    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.userId = _data.slice(posStart, posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));
    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.nonce = _data.slice(posStart,posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 4;  // uint32
    this.assetFileSize = helper.hboToInt32(_data.slice(posStart,posEnd));

    if ( this.assetFileSize !== 0){
      posStart = posEnd;
      posEnd = posEnd + 2;  // uint32
      valueLength = helper.hboToInt16(_data.slice(posStart,posEnd));

      if (valueLength > 0){
        posStart = posEnd;
        posEnd = posEnd + this.assetFileSize;
        this.assetFileDigest = _data.slice(posStart,posEnd);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2;  // uint16
    this.assetBodyType = helper.hboToInt16(_data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2;  // uint16
    this.assetBodySize = helper.hboToInt16(_data.slice(posStart,posEnd));

    if (this.assetBodySize > 0) {
      posStart = posEnd;
      posEnd = posEnd + this.assetBodySize;
      this.assetBody = _data.slice(posStart, posEnd);
    }
    return true;
  }

}


