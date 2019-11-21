import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';
import {IDsLength} from './idsLength';


export class BBcAssetHash{
  /**
   *
   * constructor
   * @param {Array<Uint8Array>} assetIds
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(assetIds, version=2.0, idsLength=IDsLength) {
    this.setLength(idsLength);
    this.version = version;
    this.assetIds = [];
    this.setAssetIds(assetIds);
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
   * set asset ids
   * @param {Array<Uint8Array>} _assetIds
   */
  setAssetIds(_assetIds){
    for(let i = 0; i < _assetIds.length; i++){
      this.assetIds.push(_assetIds[i].slice(0, this.idsLength.assetId));
    }
    return this;
  }

  /**
   *
   * get dump data
   *
   * @return {String}
   */
  dump(intentNum=0) {
    let intent = '';
    for(let i = 0; i < intentNum; i++){
      intent += '  ';
    }
    let dump = `${intent}--AssetHash--\n`;
    dump += `${intent}assetIds.length: ${this.assetIds.length}`;
    for (let i = 0; i < this.assetIds.length; i++) {
      dump += `${intent}assetIds[${i}]: ${jseu.encoder.arrayBufferToHexString(this.assetIds[i])}`;
    }
    dump += `${intent}--end AssetHash--\n`;
    return dump;
  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  dumpJSON() {
    const assetIds = [];
    for (let i = 0; i < this.assetIds.length; i++) {
      assetIds.push(jseu.encoder.arrayBufferToHexString(this.assetIds[i]));
    }
    const jsonData = {
      idsLength: this.idsLength,
      version: this.version,
      assetIds,
    };
    return jsonData;
  }

  /**
   *
   * load json data
   * @param {Object} _jsonData
   * @return {BBcAssetHash}
   */
  loadJSON(_jsonData) {

    this.version = _jsonData.version;
    this.idsLength = _jsonData.idsLength;
    let assetIds = [];
    for (let i = 0; i < _jsonData.assetIds.length; i++) {
      assetIds.push(jseu.encoder.hexStringToArrayBuffer(_jsonData.assetIds[i]));
    }
    this.assetIds = assetIds;
    return this;
  }

  /**
   *
   * add asset id
   * @param {Uint8Array} _assetId
   * @return {BBcAssetHash}
   */
  addAssetId(_assetId) {
    this.assetIds.push(cloneDeep(_assetId));
    return this;
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
