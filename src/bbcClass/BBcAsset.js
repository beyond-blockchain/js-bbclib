import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';

export class BBcAsset{
  constructor(userId, idLength=32) {
    this.setLength(idLength); // int
    this.addUserId(userId); // Uint8Array
    this.assetId = new Uint8Array(this.idLength); // Uint8Array
    this.nonce = new Uint8Array(this.idLength); // Uint8Array
    this.assetFileSize = 0; // int
    this.assetFileDigest = new Uint8Array(0); // Uint8Array
    this.assetBodyType = 0; // int
    this.assetBodySize = 0; // int
    this.assetBody = new Uint8Array(0); // Uint8Array
  }

  setLength(idLength){
    this.idLength = cloneDeep(idLength);
  }

  showAsset() {
    if (this.assetId != null) {
      console.log('this.assetId :', jseu.encoder.arrayBufferToHexString(this.assetId));
    }
    console.log('this.userId :', jseu.encoder.arrayBufferToHexString(this.userId));
    console.log('this.nonce :', jseu.encoder.arrayBufferToHexString(this.nonce));
    console.log('this.assetFileSize :', this.assetFileSize);
    console.log('this.assetFileDigest :', jseu.encoder.arrayBufferToHexString(this.assetFileDigest));
    console.log('this.assetBodyType', this.assetBodyType);
    console.log('this.assetBodySize', this.assetBodySize);
    console.log('this.assetBody :', jseu.encoder.arrayBufferToHexString(this.assetBody));
  }

  async setRandomNonce() {
    this.nonce = await jscu.random.getRandomBytes(this.idLength);
  }

  setNonce(nonce) {
    this.nonce = nonce;
  }

  addUserId(userId) {
    if (userId != null) {
      this.userId = cloneDeep(userId);
    }
  }

  async addAsset(assetFile, assetBody) {
    if (assetFile !== null) {
      this.assetFileSize = assetFile.length;
      this.assetFileDigest = await jscu.hash.compute(assetFile, 'SHA-256');
    }

    if (assetBody !== null) {
      this.assetBody = assetBody;
      this.assetBodySize = assetBody.length;
    }
    await this.digest();

    return true;
  }

  async digest() {
    const target = this.getDigest();
    const id = await jscu.hash.compute(target, 'SHA-256');
    this.assetId = id.slice(0, this.idLength);
    return this.assetId;
  }

  async setAssetId() {
    const target = this.getDigest();
    this.assetId = await jscu.hash.compute(target, 'SHA-256');
    return this.assetId;
  }

  getAssetFile() {
    return this.assetFile;
  }

  getAssetFileDigest() {
    return this.assetFileDigest;
  }

  getAssetDigest() {
    return this.assetFileDigest;
  }

  async checkAssetFile(assetFile) {
    const digest = await jscu.hash.compute(assetFile, 'SHA-256');
    return (digest === this.assetFileDigest);
  }

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

  unpack(data) {

    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = data.slice(posStart,posEnd);

    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));
    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.userId = data.slice(posStart, posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));
    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.nonce = data.slice(posStart,posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 4;  // uint32
    this.assetFileSize = helper.hboToInt32(data.slice(posStart,posEnd));

    if ( this.assetFileSize !== 0){
      posStart = posEnd;
      posEnd = posEnd + 2;  // uint32
      valueLength = helper.hboToInt16(data.slice(posStart,posEnd));

      if (valueLength > 0){
        posStart = posEnd;
        posEnd = posEnd + this.assetFileSize;
        this.assetFileDigest = data.slice(posStart,posEnd);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2;  // uint16
    this.assetBodyType = helper.hboToInt16(data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2;  // uint16
    this.assetBodySize = helper.hboToInt16(data.slice(posStart,posEnd));

    if (this.assetBodySize > 0) {
      posStart = posEnd;
      posEnd = posEnd + this.assetBodySize;
      this.assetBody = data.slice(posStart, posEnd);
    }

    return true;
  }

}


