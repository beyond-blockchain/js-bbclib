import * as helper from '../helper';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';

export class BBcWitness{

  /**
   *
   * constructor
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(version=1.0, idsLength = IDsLength) {
    this.setLength(idsLength);
    this.version = version;
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
   * set user ids
   * @param {Array<Uint8Array>} _userIds
   * @return {BBcWitness}
   */
  setUserIds(_userIds){
    this.userIds = _userIds;
    return this;
  }

  /**
   *
   * add witness
   * @param {Uint8Array} _userId
   * @return {BBcWitness}
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
    return this;
  }

  /**
   *
   * add signature
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   * @return {BBcWitness}
   */
  addSignature(_userId, _signature) {
    this.transaction.addSignatureObject(cloneDeep(_userId), cloneDeep(_signature));
    return this;
  }

  /**
   *
   * add signature using index
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   * @return {BBcWitness}
   */
  addSignatureUsingIndex(_userId, _signature){
    for (let i = 0; i < this.userIds.length; i++){
      if(_userId.toString() === this.userIds[i].toString()){
        this.transaction.addSignatureUsingIndex(this.sigIndices[i], _signature);
        return this;
      }
    }

    return this;
  }

  /**
   *
   * set signature index
   * @return {BBcWitness}
   */
  setSigIndex(){
    if(this.transaction === null || this.userIds.length === 0){
      return this;
    }
    for (let i = 0; i < this.userIds.length; i++){
      this.transaction.setSigIndex(this.userIds[i], this.sigIndices[i]);
    }
    return this;
  }

  /**
   *
   * add user id
   * @param {Uint8Array} _userId
   * @return {BBcWitness}
   */
  addUserId(_userId) {
    if (_userId != null) {
      this.userIds.push(cloneDeep(_userId));
    }
    return this;
  }

  /**
   *
   * add signature indices
   * @param {Number} _index
   * @return {BBcWitness}
   */
  addSigIndices(_index) {
    if (_index != null) {
      this.sigIndices.push(cloneDeep(_index));
    }
    return this;
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
