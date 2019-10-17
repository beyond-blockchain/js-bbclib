import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';

export class BBcPointer{
  constructor(transactionId, assetId, idLength =32) {
    this.idLength = cloneDeep(idLength);
    if (transactionId != null) {
      this.transactionId = cloneDeep(transactionId);
    } else {
      this.transactionId = new Uint8Array( this.idLength );
    }

    this.assetId = cloneDeep(assetId);
    this.assetIdExistence = 0;
    if (assetId != null) {
      this.assetIdExistence = 1;
    } else {
      this.assetIdExistence = 0;
    }
  }

  showPointer() {
    console.log('transactionId', jseu.encoder.arrayBufferToHexString(this.transactionId));
    if (this.assetId != null) {
      console.log('assetId', jseu.encoder.arrayBufferToHexString(this.assetId));
    }
  }

  setTransactionId(transactionId) {
    this.transactionId = cloneDeep(transactionId);
  }

  setAssetId(assetId) {
    this.assetId = cloneDeep(assetId);
    if(assetId != null) {
      this.assetIdExistence = 1;
    } else {
      this.assetIdExistence = 0;
    }
  }

  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.transactionId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.transactionId));
    if (this.assetIdExistence > 0) {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIdExistence, 2)));
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetId.length, 2)));
      binaryData = binaryData.concat(Array.from(this.assetId));
    } else {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIdExistence, 2)));
    }

    return new Uint8Array(binaryData);
  }

  unpack(data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = data.slice(posStart,posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.assetIdExistence =  helper.hboToInt16(data.slice(posStart,posEnd));
    if (this.assetIdExistence > 0) {
      posStart = posEnd;
      posEnd = posEnd + 2; //uint16
      valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = data.slice(posStart, posEnd);
    }

    return true;
  }

}

