import * as helper from '../helper';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';

export class BBcWitness{

  /**
   *
   * constructor
   * @param {Object} idsLengthConf
   */
  constructor(idsLengthConf = IDsLength) {
    this.setLength(idsLengthConf);
    this.transaction = null;
    this.userIds = [];
    this.sigIndices = [];
  }

  /**
   *
   * get dump data
   * @return {String}
   */
  dump() {
    let dump = '--Witness--\n';
    // dump += `transaction: ${this.transaction.dump()}\n`;
    dump += `userIds.length: ${this.userIds.length}\n`;
    for (let i = 0; i < this.userIds.length; i++) {
      dump += `userIds[${i}]: ${jseu.encoder.arrayBufferToHexString(this.userIds[i])}\n`;
    }
    dump += `sigIndices.length: ${this.sigIndices.length}\n`;
    for (let i = 0; i < this.sigIndices.length; i++) {
      dump += `sigIndices[${i}]: ${this.sigIndices[i]}\n`;
    }
    dump += '--end Witness--';
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
   * add witness
   * @param {Uint8Array} _userId
   * @param {Number} _keyType
   */
  addWitness(_userId) {
    let flag = false;
    for (let i = 0; i < this.userIds.length; i++){
      if(_userId.toString() === this.userIds[i].toString()) {
        flag = true;
        break;
      }
    }
    if (flag === false){
      this.userIds.push(cloneDeep(_userId));
      this.sigIndices.push(this.transaction.getSigIndex(_userId));
    }
  }

  /**
   *
   * add signature
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   */
  addSignature(_userId, _signature) {
    this.transaction.addSignature(cloneDeep(_userId), cloneDeep(_signature));
  }

  /**
   *
   * add signature using index
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   */
  addSignatureUsingIndex(_userId, _signature){

    for (let i = 0; i < this.userIds.length; i++){
      if(_userId.toString() === this.userIds[i].toString()){
        this.transaction.addSignatureUsingIndex(this.sigIndices[i], _signature);
        return true;
      }
    }

    return false;
  }

  /**
   *
   * set signature index
   */
  setSigIndex(){
    if(this.transaction === null || this.userIds.length === 0){
      return ;
    }
    for (let i = 0; i < this.userIds.length; i++){
      this.transaction.setSigIndex(this.userIds[i], this.sigIndices[i]);
    }
  }

  /**
   *
   * add user id
   * @param {Uint8Array} _userId
   */
  addUserId(_userId) {
    if (_userId != null) {
      this.userIds.push(cloneDeep(_userId));
      return true;
    }
    return false;
  }

  /**
   *
   * add signature indices
   * @param {Number} _index
   */
  addSigIndices(_index) {
    if (_index != null) {
      this.sigIndices.push(cloneDeep(_index));
      return true;
    }
    return false;
  }

  /**
   *
   * pack witness data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];
    const elementsLen = this.userIds.length;
    binaryData = binaryData.concat(Array.from(helper.hbo(elementsLen, 2)));
    for (let i = 0; i < elementsLen; i++) {
      binaryData = binaryData.concat(Array.from(helper.hbo(this.userIds[i].length, 2)));
      binaryData = binaryData.concat(Array.from(this.userIds[i]));
      binaryData = binaryData.concat(Array.from(helper.hbo(this.sigIndices[i], 2)));
    }
    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack witness data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    let posStart = 0;
    let posEnd = 2;
    const userIdsLength = helper.hboToInt16(_data.slice(posStart, posEnd));
    for (let i = 0; i < userIdsLength; i++) {
      posStart = posEnd;
      posEnd = posEnd + 2;
      const userValueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + userValueLength;
      this.userIds.push(_data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + 2;
      const indexValue = helper.hboToInt16(_data.slice(posStart, posEnd));
      this.sigIndices.push(indexValue);
    }
  }
}
