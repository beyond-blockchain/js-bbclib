import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';
import {idsLength} from './idsLength';

export class BBcPointer{
  /**
   *
   * constructor
   * @param {Uint8Array} transactionId
   * @param {Uint8Array} assetId
   * @param {Object} idsLengthConf
   */
  constructor(transactionId, assetId, idsLengthConf=null) {
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf);
    }else{
      this.setLength(idsLength);
    }
    if (transactionId != null) {
      this.transactionId = cloneDeep(transactionId);
    } else {
      this.transactionId = new Uint8Array( this.idsLength.transactionId );
    }
    this.assetId = cloneDeep(assetId);
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
   * @return {String}
   */
  dump() {
    let dump = '--Pointer--\n';
    dump += `idsLength: ${idsLength} \n`;
    dump += `transactionId: ${jseu.encoder.arrayBufferToHexString(this.transactionId)}\n`;
    if (this.assetId != null) {
      dump += `assetId: ${jseu.encoder.arrayBufferToHexString(this.assetId)}\n`;
    }
    dump += '--end Pointer--\n';
    return dump;
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
   */
  setTransactionId(_transactionId) {
    this.transactionId = cloneDeep(_transactionId);
  }

  /**
   *
   * set asset id
   * @param {Uint8Array} _assetId
   */
  setAssetId(_assetId) {
    this.assetId = cloneDeep(_assetId);
    if(_assetId != null) {
      this.assetIdExistence = 1;
    } else {
      this.assetIdExistence = 0;
    }
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

