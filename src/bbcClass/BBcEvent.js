import { BBcAsset } from './BBcAsset.js';
import cloneDeep from 'lodash.clonedeep';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import {idsLength} from './idsLength';

export class BBcEvent{

  /**
   *
   * constructor
   * @param {Uint8Array} assetGroupId
   * @param {Object} idsLengthConf
   */
  constructor(assetGroupId, idsLengthConf=null) {
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf);
    }else{
      this.setLength(idsLength);
    }
    this.assetGroupId = cloneDeep(assetGroupId);
    this.referenceIndices = [];
    this.mandatoryApprovers = [];
    this.optionApproverNumNumerator = 0;
    this.optionApproverNumDenominator = 0;
    this.optionApprovers = [];
    this.asset = null;
  }

  /**
   *
   * get dump data
   * @return {String}
   */
  dump() {
    let dump = '--Event--\n';
    dump += `idsLength: ${idsLength} \n`;
    dump += `assetGroupId: ${jseu.encoder.arrayBufferToHexString(this.assetGroupId)}\n`;
    dump += `referenceIndices.length: ${this.referenceIndices.length}\n`;
    for (let i = 0; i < this.referenceIndices.length; i++) {
      dump += `referenceIndices[${i}]: ${this.referenceIndices[i]}\n`;
    }
    dump += `mandatoryApprovers.length: ${this.mandatoryApprovers.length}\n`;
    for (let i = 0; i < this.mandatoryApprovers.length; i++) {
      dump += `mandatoryApprovers[${i}]: ${jseu.encoder.arrayBufferToHexString(this.mandatoryApprovers[i])}\n`;
    }
    dump += `optionApproverNumNumerator: ${this.optionApproverNumNumerator}\n`;
    dump += `optionApproverNumDenominator: ${this.optionApproverNumDenominator}\n`;
    dump += `optionApprovers.length: ${this.optionApprovers.length}\n`;
    for (let i = 0; i < this.optionApprovers.length; i++) {
      dump += `optionApprovers [${i}}]: ${this.optionApprovers[i]}\n`;
    }
    if (this.asset != null) {
      dump += this.asset.dump();
    }
    dump += '--end Event--';
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
   * set asset group id
   * @param {Uint8Array} _assetGroupId
   */
  setAssetGroupId(_assetGroupId) {
    this.assetGroupId = cloneDeep(_assetGroupId);
  }

  /**
   *
   * add reference indices
   * @param {Number} _referenceIndices
   */
  addReferenceIndices(_referenceIndices) {
    this.referenceIndices.push(cloneDeep(_referenceIndices));
  }

  /**
   *
   * add mandatory approver
   * @param {Uint8Array} _mandatoryApprover
   */
  addMandatoryApprover(_mandatoryApprover) {
    this.mandatoryApprovers.push(cloneDeep(_mandatoryApprover));
  }

  /**
   *
   * add option approver num numuerator
   * @param {Number} _optionApproverNumNumerator
   */
  addOptionApproverNumNumerator(_optionApproverNumNumerator) {
    this.optionApproverNumNumerator = cloneDeep(_optionApproverNumNumerator);
  }

  /**
   *
   * add option approver num denominator
   * @param {Number} _optionApproverNumDenominator
   */
  addOptionApproverNumDenominator(_optionApproverNumDenominator) {
    this.optionApproverNumDenominator = cloneDeep(_optionApproverNumDenominator);
  }

  /**
   *
   * add option approver
   * @param {Number} _optionApprover
   */
  addOptionApprover(_optionApprover) {
    this.optionApprover = cloneDeep(_optionApprover);
  }

  /**
   *
   * set asset
   * @param {BBcAsset} _asset
   */
  setAsset(_asset) {
    this.asset = cloneDeep(_asset);
  }

  /**
   *
   * pack event data
   * @return {Uint8Array}
   */
  pack() {
    let asset = null;
    if (this.asset != null) {
      asset = this.asset.pack();
    }else{
      return new Uint8Array(0);
    }

    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetGroupId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.assetGroupId));

    binaryData = binaryData.concat(Array.from(helper.hbo(this.referenceIndices.length,2)));
    if(this.referenceIndices.length > 0){
      for (let i = 0; i < this.referenceIndices.length; i++){
        binaryData = binaryData.concat(Array.from(helper.hbo(this.referenceIndices[i],2)));
      }
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.mandatoryApprovers.length,2)));
    if(this.mandatoryApprovers.length > 0){
      for (let i = 0; i < this.mandatoryApprovers.length; i++){
        binaryData = binaryData.concat(Array.from(helper.hbo(this.mandatoryApprovers[i].length, 2)));
        binaryData = binaryData.concat(Array.from(this.mandatoryApprovers[i]));
      }
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.optionApproverNumNumerator,2)));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.optionApproverNumDenominator,2)));
    if(this.optionApproverNumDenominator > 0){
      for (let i = 0; i < this.optionApproverNumDenominator; i++){
        binaryData = binaryData.concat(Array.from(helper.hbo(this.optionApprovers[i].length, 2)));
        binaryData = binaryData.concat(Array.from(this.optionApprovers[i]));
      }
    }
    binaryData = binaryData.concat(Array.from(helper.hbo(asset.length, 4)));
    binaryData = binaryData.concat(Array.from(asset));
    return new Uint8Array(binaryData);

  }

  /**
   *
   * unpack event data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  unpack(_data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(_data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetGroupId = _data.slice(posStart,posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const referenceIndicesSize  = helper.hboToInt16(_data.slice(posStart,posEnd));

    if (referenceIndicesSize > 0) {
      for (let i = 0 ; i < referenceIndicesSize; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        this.referenceIndices.push(helper.hboToInt16(_data.slice(posStart, posEnd)));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const mandatoryApproversSize = helper.hboToInt16(_data.slice(posStart,posEnd));

    if (mandatoryApproversSize > 0) {
      for (let i = 0; i < mandatoryApproversSize; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        valueLength = helper.hboToInt16(_data.slice(posStart,posEnd));

        posStart = posEnd;
        posEnd = posEnd + valueLength;
        this.mandatoryApprovers.push(_data.slice(posStart, posEnd));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.optionApproverNumNumerator = helper.hboToInt16(_data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.optionApproverNumDenominator = helper.hboToInt16(_data.slice(posStart,posEnd));

    if(this.optionApproverNumDenominator > 0){
      for (let i = 0; i < this.optionApproverNumDenominator; i++) {
        posStart = posEnd;
        posEnd = posEnd + 2;
        valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + valueLength;
        this.optionApprovers.push(_data.slice(posStart, posEnd));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength = helper.hboToInt32(_data.slice(posStart,posEnd));
    if(valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength; // uint32

      const assetBin = _data.slice(posStart, posEnd);

      const user_id = new Uint8Array(0);
      this.asset = new BBcAsset(user_id, this.idsLength);
      this.asset.unpack(assetBin);
    }

    return true;
  }

}
