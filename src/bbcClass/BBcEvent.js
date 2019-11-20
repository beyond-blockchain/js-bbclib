import { BBcAsset } from './BBcAsset.js';
import cloneDeep from 'lodash.clonedeep';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import {IDsLength} from './idsLength';

export class BBcEvent{

  /**
   *
   * constructor
   * @param {Uint8Array} assetGroupId
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(assetGroupId, version=2.0, idsLength=IDsLength) {
    this.setLength(idsLength);
    this.version = version;
    this.assetGroupId = cloneDeep(assetGroupId.slice(0, this.idsLength.assetGroupId));
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
   * @param {Number} intentNum
   * @return {String}
   */
  dump(intentNum=0) {
    let intent = '';
    for(let i = 0; i < intentNum; i++){
      intent += '  ';
    }
    let dump = `${intent}--Event--\n`;
    dump += `${intent}idsLength: ${this.idsLength} \n`;
    dump += `${intent}assetGroupId: ${jseu.encoder.arrayBufferToHexString(this.assetGroupId)}\n`;
    dump += `${intent}referenceIndices.length: ${this.referenceIndices.length}\n`;
    for (let i = 0; i < this.referenceIndices.length; i++) {
      dump += `${intent}referenceIndices[${i}]: ${this.referenceIndices[i]}\n`;
    }
    dump += `${intent}mandatoryApprovers.length: ${this.mandatoryApprovers.length}\n`;
    for (let i = 0; i < this.mandatoryApprovers.length; i++) {
      dump += `${intent}mandatoryApprovers[${i}]: ${jseu.encoder.arrayBufferToHexString(this.mandatoryApprovers[i])}\n`;
    }
    dump += `${intent}optionApproverNumNumerator: ${this.optionApproverNumNumerator}\n`;
    dump += `${intent}optionApproverNumDenominator: ${this.optionApproverNumDenominator}\n`;
    dump += `${intent}optionApprovers.length: ${this.optionApprovers.length}\n`;
    for (let i = 0; i < this.optionApprovers.length; i++) {
      dump += `${intent}optionApprovers [${i}}]: ${this.optionApprovers[i]}\n`;
    }
    if (this.asset != null) {
      dump += this.asset.dump(intentNum + 1);
    }
    dump += `${intent}--end Event--`;
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
    this.assetGroupId = cloneDeep(_assetGroupId.slice(0, this.idsLength.assetGroupId));
    return this;
  }

  /**
   *
   * add a reference indice
   * @param {Number} _referenceIndice
   * @return {BBcEvent}
   */
  addReferenceIndices(_referenceIndice) {
    this.referenceIndices.push(cloneDeep(_referenceIndice));
    return this;
  }

  /**
   *
   * set reference indices
   * @param {Uint8Array} _referenceIndices
   * @return {BBcEvent}
   */
  setReferenceIndices(_referenceIndices) {
    this.referenceIndices = cloneDeep(_referenceIndices);
    return this;
  }

  /**
   *
   * add mandatory approvers
   * @param {Uint8Array} _mandatoryApprover
   * @return {BBcEvent}
   */
  addMandatoryApprover(_mandatoryApprover) {
    this.mandatoryApprovers.push(cloneDeep(_mandatoryApprover));
    return this;
  }

  /**
   *
   * set mandatory approvers
   * @param {Uint8Array} _mandatoryApprovers
   * @return {BBcEvent}
   */
  setMandatoryApprovers(_mandatoryApprovers) {
    this.mandatoryApprovers = cloneDeep(_mandatoryApprovers);
    return this;
  }

  /**
   *
   * set option approver num numuerator
   * @param {Number} _optionApproverNumNumerator
   * @return {BBcEvent}
   */
  setOptionApproverNumNumerator(_optionApproverNumNumerator) {
    this.optionApproverNumNumerator = cloneDeep(_optionApproverNumNumerator);
    return this;
  }

  /**
   *
   * set option approver num denominator
   * @param {Number} _optionApproverNumDenominator
   * @return {BBcEvent}
   */
  setOptionApproverNumDenominator(_optionApproverNumDenominator) {
    this.optionApproverNumDenominator = cloneDeep(_optionApproverNumDenominator);
    return this;
  }

  /**
   *
   * set option approver
   * @param {Number} _optionApprover
   * @return {BBcEvent}
   */
  setOptionApprover(_optionApprover) {
    this.optionApprover = cloneDeep(_optionApprover);
    return this;
  }

  /**
   *
   * set asset
   * @param {BBcAsset} _asset
   * @return {BBcEvent}
   */
  setAsset(_asset) {
    this.asset = cloneDeep(_asset);
    return this;
  }

  /**
   *
   * create asset
   * @param {Uint8Array} userId
   * @param {Uint8Array} assetBody
   * @param {Uint8Array} assetFile
   */
  async createAsset(userId, assetBody=null, assetFile=null) {
    this.asset = new BBcAsset(userId, this.version, this.idsLength);
    await this.asset.setAssetBody(assetBody);
    await this.asset.setAssetFile(assetFile);
    return this;
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
