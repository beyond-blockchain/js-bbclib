import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {IDsLength} from './idsLength';

export class BBcAssetRaw{
  /**
   *
   * constructor
   * @param {Uint8Array} assetId
   * @param {Uint8Array} assetBody
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(assetId, assetBody, version=2.0, idsLength=IDsLength) {
    this.setLength(idsLength);
    this.version = version;
    this.assetId = new Uint8Array(0);
    this.assetBody = new Uint8Array(0);
    this.assetBodySize = 0;
    this.setAsset(assetId, assetBody);
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
    let dump = '--AssetRaw--\n';
    dump += `assetId: ${jseu.encoder.arrayBufferToHexString(this.assetId)}\n`;
    dump += `assetBodySize: ${this.assetBodySize}\n`;
    dump += `assetBody: ${jseu.encoder.arrayBufferToHexString(this.assetBody)}\n`;
    dump += '--end AssetRaw--\n';
    return dump;
  }

  /**
   *
   * set asset data
   * @return {Boolean}
   */
  setAsset(assetId, assetBody) {
    if (assetId !== null) {
      this.assetId = assetId.slice(0, this.idsLength.assetId);
    }

    if (assetBody !== null) {
      this.assetBody = assetBody;
      this.assetBodySize = assetBody.length;
    }
    return true;
  }

  /**
   *
   * get asset digest
   * @return {Uint8Array}
   */
  async digest() {
    return this.assetId;
  }

  /**
   *
   * pack assetRaw data
   * @return {Uint8Array}
   */
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

  /**
   *
   * unpack assetRaw data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {

    let posStart = 0;
    let posEnd = 2; // uint16
    const valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = _data.slice(posStart,posEnd);
    }

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


