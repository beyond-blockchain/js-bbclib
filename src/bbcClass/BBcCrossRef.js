import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';

export class BBcCrossRef{
  /**
   *
   * constructor
   * @param {Uint8Array} domainId
   * @param {Uint8Array} transactionId
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(domainId, transactionId, version=1.0, idsLength=IDsLength) {
    this.domainId = domainId; // Uint8Array
    this.transactionId = transactionId; // Uint8Array
    this.version = version;
    this.setLength(idsLength);
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
    let dump = `${intent}--CrossRef--\n`;
    dump += `${intent}domainId: ${jseu.encoder.arrayBufferToHexString(this.domainId)}\n`;
    dump += `${intent}transactionId: ${jseu.encoder.arrayBufferToHexString(this.transactionId)}\n`;
    dump += `${intent}--end CrossRef--\n`;
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
   * set domain id
   * @param {Uint8Array} _domain
   * @return {BBcCrossRef}
   */
  setDomainId(_domainId) {
    this.domainId = cloneDeep(_domainId);
    return this;
  }

  /**
   *
   * set transaction id
   * @param {Uint8Array} _transactionId
   * @return {BBcCrossRef}
   */
  setTransactionId(_transactionId) {
    this.transactionId = cloneDeep(_transactionId);
    return this;
  }

  /**
   *
   * pack crossRef data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.domainId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.domainId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.transactionId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.transactionId));
    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack crossRef data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    let valueLength;

    let posStart = 0;
    let posEnd = 2;
    valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));
    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.domainId = _data.slice(posStart,posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));
    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = _data.slice(posStart,posEnd);

    return true;
  }

}
