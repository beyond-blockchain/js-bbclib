import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';
import jseu from 'js-encoding-utils';

export class BBcPointer{
  /**
   *
   * constructor
   * @param {Uint8Array} transactionId
   * @param {Uint8Array} assetId
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(transactionId, assetId, version=2.0, idsLength=IDsLength) {
    this.setLength(idsLength);
    this.version = version;
    if (transactionId != null) {
      this.transactionId = cloneDeep(transactionId.slice(0,this.idsLength.transactionId));
    } else {
      this.transactionId = new Uint8Array( this.idsLength.transactionId );
    }
    if (assetId != null) {
      this.assetId = cloneDeep(assetId.slice(0, this.idsLength.assetId));
    }else{
      this.assetId = new Uint8Array( this.idsLength.assetId );
    }
    this.assetIdExistence = 0;
    if (assetId != null) {
      this.assetIdExistence = 1;
    } else {
      this.assetIdExistence = 0;
    }
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
    let dump = `${intent}--Pointer--\n`;
    dump += `${intent}idsLength.transactionId: ${this.idsLength.transactionId} \n`;
    dump += `${intent}idsLength.assetId: ${this.idsLength.assetId} \n`;
    dump += `${intent}transactionId: ${jseu.encoder.arrayBufferToHexString(this.transactionId)}\n`;
    if (this.assetId != null) {
      dump += `{intent}assetId: ${jseu.encoder.arrayBufferToHexString(this.assetId)}\n`;
    }
    dump += `${intent}--end Pointer--\n`;
    return dump;
  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  dumpJSON() {
    let assetId;
    if (this.assetId != null) {
      assetId = jseu.encoder.arrayBufferToHexString(this.assetId);
    }
    const jsonData = {
      idsLength: this.idsLength,
      version: this.version,
      transactionId: jseu.encoder.arrayBufferToHexString(this.transactionId),
      assetId
    };
    return jsonData;
  }

  /**
   *
   * set length
   * @param {Object} _idsLength
   */
  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }

  /**
   *
   * set transaction id
   * @param {Object} _transactionId
   * @return {BBcPointer}
   */
  setTransactionId(_transactionId) {
    this.transactionId = cloneDeep(_transactionId.slice(0,this.idsLength.transactionId));
    return this;
  }

  /**
   *
   * set asset id
   * @param {Uint8Array} _assetId
   * @return {BBcPointer}
   */
  setAssetId(_assetId) {
    this.assetId = cloneDeep(_assetId.slice(0, this.idsLength.assetId));
    if(_assetId) {
      this.assetIdExistence = 1;
    } else {
      this.assetIdExistence = 0;
    }
    return this;
  }

  /**
   *
   * pack pointer data
   * @return {Uint8Array}
   */
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

  /**
   *
   * unpack pointer data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = _data.slice(posStart,posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.assetIdExistence =  helper.hboToInt16(_data.slice(posStart,posEnd));
    if (this.assetIdExistence > 0) {
      posStart = posEnd;
      posEnd = posEnd + 2; //uint16
      valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetId = _data.slice(posStart, posEnd);
    }

    return true;
  }

}

