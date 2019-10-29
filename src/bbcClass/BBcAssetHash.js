import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {idsLength} from './idsLength';

export class BBcAssetHash{
  constructor(idsLengthConf=null) {
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf);
    }else{
      this.setLength(idsLength); // int
    }
    this.assetIds = [];
  }

  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }

  showAsset() {
    // eslint-disable-next-line no-console
    console.log('this.assetIds.length :', this.assetIds.length);
    for (let i = 0; i < this.assetIds.length; i++) {
      // eslint-disable-next-line no-console
      console.log('assetIds[',i,'] :', jseu.encoder.arrayBufferToHexString(this.assetIds[i]));
    }
  }

  addAssetId(assetId) {
    this.assetIds.push(cloneDeep(assetId));
    return true;
  }

  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIds.length,2)));
    for (let i = 0; i < this.assetIds.length; i++ ) {

      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIds[i].length, 2)));
      binaryData = binaryData.concat(Array.from(this.assetIds[i]));
    }

    return new Uint8Array(binaryData);
  }

  unpack(data) {
    this.assetIds = [];

    let posStart = 0;
    let posEnd = 2; // uint16
    const idsCount =  helper.hboToInt16(data.slice(posStart,posEnd));

    for (let i =0; i < idsCount; i++){
      posStart = posEnd;
      posEnd = posEnd + 2; //uint16
      const valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetIds.push(data.slice(posStart, posEnd));
    }
    return true;
  }

}


