import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {idsLength} from './idsLength';

export class BBcAssetRaw{
  constructor(idsLengthConf=null) {
    if(idsLengthConf !== null){
      this.setLength(idsLengthConf); // dict
    }else{
      this.setLength(idsLength);
    }
    this.assetId = new Uint8Array(this.idsLength.assetId); // Uint8Array
    this.assetBodySize = 0; // int
    this.assetBody = new Uint8Array(0); // Uint8Array
  }

  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }

  showAsset() {
    if (this.assetId != null) {
      // eslint-disable-next-line no-console
      console.log('this.assetId :', jseu.encoder.arrayBufferToHexString(this.assetId));
    }
    // eslint-disable-next-line no-console
    console.log('this.assetBodySize', this.assetBodySize);
    // eslint-disable-next-line no-console
    console.log('this.assetBody :', jseu.encoder.arrayBufferToHexString(this.assetBody));
  }

  setAsset(assetId, assetBody) {
    if (assetId !== null) {
      this.assetId = assetId;
    }

    if (assetBody !== null) {
      this.assetBody = assetBody;
      this.assetBodySize = assetBody.length;
    }
    return true;
  }

  async digest() {
    return this.assetId;
  }

  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.assetId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetBodySize, 2)));
    if (this.assetBodySize > 0 && this.assetBody != null){
      binaryData = binaryData.concat(Array.from(this.assetBody));
    }

    return new Uint8Array(binaryData);
  }

  unpack(data) {

    let posStart = 0;
    let posEnd = 2; // uint16
    const valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = data.slice(posStart,posEnd);
    }

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


