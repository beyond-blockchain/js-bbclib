import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {idsLength} from './idsLength';

export class BBcAssetHash{
  /**
   *
   * constructor
   * @param {Object} idsLengthConf
   */
  constructor(idsLengthConf=null) {
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf);
    }else{
      this.setLength(idsLength); // int
    }
    this.assetIds = [];
  }

  /**
   *
   * set length setLength
   * @param {Object<{ transactionId: number, assetGroupId: number, userId: number, assetId: number,nonce: number }>} _idsLength
   */
  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }

  /**
   *
   * get dump data
   * @return {String}
   */
  dump() {
    let dump = '--AssetHash--\n';
    dump += `assetIds.length: ${this.assetIds.length}`;
    for (let i = 0; i < this.assetIds.length; i++) {
      dump += `assetIds[${i}]: ${jseu.encoder.arrayBufferToHexString(this.assetIds[i])}`;
    }
    dump += '--end AssetHash--\n';
    return dump;
  }

  /**
   *
   * add asset id
   * @param {Uint8Array} _assetId
   * @return {Boolean}
   */
  addAssetId(_assetId) {
    this.assetIds.push(cloneDeep(_assetId));
    return true;
  }

  /**
   *
   * pack assetHash data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIds.length,2)));
    for (let i = 0; i < this.assetIds.length; i++ ) {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.assetIds[i].length, 2)));
      binaryData = binaryData.concat(Array.from(this.assetIds[i]));
    }
    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack assetHash data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    this.assetIds = [];

    let posStart = 0;
    let posEnd = 2; // uint16
    const idsCount =  helper.hboToInt16(_data.slice(posStart,posEnd));

    for (let i =0; i < idsCount; i++){
      posStart = posEnd;
      posEnd = posEnd + 2; //uint16
      const valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetIds.push(_data.slice(posStart, posEnd));
    }
    return true;
  }

}
