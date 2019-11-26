import * as helper from '../helper.js';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';
import {getJscu} from '../env.js';
import jseu from 'js-encoding-utils';
const jscu = getJscu();

export class BBcReference{
  /**
   *
   * constructor
   * @param {Uint8Array} assetGroupId
   * @param {BBcTransaction} transaction
   * @param {BBcTransaction} refTransaction
   * @param {Number} eventIndexInRef
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(assetGroupId, transaction, refTransaction, eventIndexInRef, version=1.0, idsLength=IDsLength) {
    this.setLength(idsLength);
    this.version = version;
    this.assetGroupId = cloneDeep(assetGroupId);
    this.transactionId = new Uint8Array(this.idsLength.transactionId);
    this.transaction = cloneDeep(transaction);
    this.refTransaction = cloneDeep(refTransaction);
    this.eventIndexInRef = cloneDeep(eventIndexInRef);
    this.sigIndices = [];
    this.mandatoryApprovers = null;
    this.optionApprovers = null;
    this.optionSigIds = [];
    if (refTransaction == null) {
      return;
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
    let dump = `${intent}--Reference--\n`;
    dump += `${intent}idsLength.assetGroupId: ${this.idsLength.assetGroupId} \n`;
    dump += `${intent}assetGroupId: ${jseu.encoder.arrayBufferToHexString(this.assetGroupId)}\n`;
    dump += `${intent}transactionId: ${jseu.encoder.arrayBufferToHexString(this.transactionId)}\n`;
    if (this.transaction != null){
      dump += this.transaction.dump(intentNum + 1);
    }
    dump += `${intent}eventIndexInRef: ${this.eventIndexInRef}\n`;
    dump += `${intent}sigIndices.length: ${this.sigIndices.length}\n`;
    for (let i = 0; i < this.sigIndices.length; i++){
      dump += `${intent}sigIndices[${i}]: ${this.sigIndices[i]}\n`;
    }
    dump += `${intent}--end Reference--\n`;
    return dump;
  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  dumpJSON() {

    const jsonData = {
      idsLength: this.idsLength,
      version: this.version,
      assetGroupId: jseu.encoder.arrayBufferToHexString(this.assetGroupId),
      transactionId: jseu.encoder.arrayBufferToHexString(this.transactionId),
      eventIndexInRef: this.eventIndexInRef,
      sigIndices: this.sigIndices
    };
    return jsonData;
  }

  /**
   *
   * load json data
   * @param {Object} _jsonData
   * @return {BBcReference}
   */
  loadJSON(_jsonData) {
    this.version = _jsonData.version;
    this.idsLength = _jsonData.idsLength;
    this.assetGroupId = jseu.encoder.hexStringToArrayBuffer(_jsonData.assetGroupId);
    this.transactionId = jseu.encoder.hexStringToArrayBuffer(_jsonData.transactionId);
    this.eventIndexInRef = _jsonData.eventIndexInRef;
    this.sigIndices = _jsonData.sigIndices;
    return this;
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
   * prepare reference
   * @param {BBcTransaction} _refTransaction
   * @return {BBcReference}
   */
  async prepareReference(_refTransaction) {
    if (_refTransaction == null){
      return false;
    }
    this.refTransaction = cloneDeep( _refTransaction );
    try {
      const evt = _refTransaction.events[this.eventIndexInRef];
      if (this.sigIndices.length === 0){
        for (let i = 0; i < evt.mandatoryApprovers.length; i++) {
          this.sigIndices.push(this.transaction.getSigIndex(evt.mandatoryApprovers[i]));
        }
        for (let i = 0; i < evt.optionApproverNumNumerator.length; i++) {
          const dummyId = await jscu.random.getRandomBytes(4);
          this.optionSigIds.push(dummyId);
          this.sigIndices.push(this.transaction.getSigIndex(dummyId));
        }
      }else{
        let l = 0;
        for (let i = 0; i < evt.mandatoryApprovers.length; i++) {
          this.transaction.setSigIndex(evt.mandatoryApprovers[i], this.sigIndices[l]);
          l = l + 1;
        }
        for (let i=0; i < evt.optionApproverNumNumerator.length; i++){
          const dummyId = jscu.random.getRandomBytes(4);
          this.optionSigIds.push(dummyId);
          this.transaction.setSigIndex(dummyId, this.sigIndices[l]);
          l = l + 1;
        }

      }
      this.mandatoryApprovers = evt.mandatoryApprovers;
      this.optionApprovers = evt.optionApprovers;
      await _refTransaction.digest();
      this.transactionId = _refTransaction.transactionId;

    } catch (e) {
      //print(e);
    }

    return this;
  }

  /**
   *
   * add signature
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   * @return {BBcReference}
   */
  addSignature(_userId, _signature) {
    if (_userId === true) {
      if (this.optionSigIds.length === 0) {
        return;
      }
      _userId = this.optionSigIds.pop();
    }
    this.transaction.addSignatureObject(cloneDeep(_userId), cloneDeep(_signature));
    return this;
  }

  /**
   *
   * get referred transaction
   * @return {Uint8Array}
   */
  getReferredTransaction() {
    return {key: this.refTransaction.serialize()};
  }

  /**
   *
   * get destinations
   * @return {Uint8Array}
   */
  getDestinations() {
    return this.mandatoryApprovers + this.optionApprovers;
  }

  /**
   *
   * pack reference data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetGroupId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.assetGroupId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.transactionId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.transactionId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.eventIndexInRef, 2)));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.sigIndices.length, 2)));

    for (let i = 0; i < this.sigIndices.length; i++){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.sigIndices[i], 2)));
    }
    return new Uint8Array(binaryData);
  }

  /**
   *
   * unpack reference data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.assetGroupId = _data.slice(posStart, posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = _data.slice(posStart, posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    this.eventIndexInRef = helper.hboToInt16(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2;
    const numSigIndices = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numSigIndices > 0){
      for (let i =0; i < numSigIndices; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        const sigIndice = helper.hboToInt16(_data.slice(posStart, posEnd));
        this.sigIndices.push(sigIndice);
      }
    }
    return true;
  }

}
