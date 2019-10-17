import { BBcAsset } from './BBcAsset.js';
import cloneDeep from 'lodash.clonedeep';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';

export class BBcEvent{
  constructor(assetGroupId, idLength=32) {
    this.idLength = cloneDeep(idLength);
    this.assetGroupId = cloneDeep(assetGroupId);
    this.referenceIndices = [];
    this.mandatoryApprovers = [];
    this.optionApproverNumNumerator = 0;
    this.optionApproverNumDenominator = 0;
    this.optionApprovers = [];
    this.asset = null;
  }

  showEvent() {
    console.log('------showEvent-------');

    console.log('idLength :',this.idLength);
    console.log('assetGroupId :', jseu.encoder.arrayBufferToHexString(this.assetGroupId));

    console.log('this.referenceIndices.length  :',this.referenceIndices.length );
    if (this.referenceIndices.length > 0) {
      for (let i = 0; i < this.referenceIndices.length; i++) {
        console.log('referenceIndices[', i, '] :', this.referenceIndices[i]);
      }
    }
    console.log('this.mandatoryApprovers.length  :',this.mandatoryApprovers.length );
    if (this.mandatoryApprovers.length > 0) {
      for (let i = 0; i < this.mandatoryApprovers.length; i++) {
        console.log('mandatoryApprovers[', i, '] :', jseu.encoder.arrayBufferToHexString(this.mandatoryApprovers[i]));
      }
    }

    console.log('optionApproverNumNumerator :',this.optionApproverNumNumerator);
    console.log('optionApproverNumDenominator :',this.optionApproverNumDenominator);
    if (this.optionApproverNumDenominator.length > 0) {
      for (let i = 0; i < this.optionApproverNumDenominator.length; i++) {
        console.log('optionApprovers [', i, ']',  jseu.encoder.arrayBufferToHexString(this.optionApprovers[i]));
      }
    }
    if (this.asset != null) {
      console.log('asset :');
      this.asset.showAsset()
    }
    console.log('------showEvent end-------');
  }

  addAssetGroupId(assetGroupId) {
    this.assetGroupId = cloneDeep(assetGroupId);
  }

  addReferenceIndices(referenceIndices) {
    this.referenceIndices.push(cloneDeep(referenceIndices));
  }

  addMandatoryApprover(mandatoryApprover) {
    this.mandatoryApprovers.push(cloneDeep(mandatoryApprover));
  }

  addOptionApproverNumNumerator(optionApproverNumNumerator) {
    this.optionApproverNumNumerator = cloneDeep(optionApproverNumNumerator);
  }

  addOptionApproverNumDenominator(optionApproverNumDenominator) {
    this.optionApproverNumDenominator = cloneDeep(optionApproverNumDenominator);
  }

  addOptionApprover(optionApprover) {
    this.optionApprover = cloneDeep(optionApprover);
  }

  addAsset(asset) {
    this.asset = cloneDeep(asset);
  }

  pack() {
    let asset = null;
    if (this.asset != null) {
      asset = this.asset.pack();
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

  unpack(data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));

    if (valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength;
      this.assetGroupId = data.slice(posStart,posEnd);
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const referenceIndicesSize  = helper.hboToInt16(data.slice(posStart,posEnd));

    if (referenceIndicesSize > 0) {
      for (let i = 0 ; i < referenceIndicesSize; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        this.referenceIndices.push(helper.hboToInt16(data.slice(posStart, posEnd)));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const mandatoryApproversSize = helper.hboToInt16(data.slice(posStart,posEnd));

    if (mandatoryApproversSize > 0) {
      for (let i = 0; i < mandatoryApproversSize; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        valueLength = helper.hboToInt16(data.slice(posStart,posEnd));

        posStart = posEnd;
        posEnd = posEnd + valueLength;
        this.mandatoryApprovers.push(data.slice(posStart, posEnd));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.optionApproverNumNumerator = helper.hboToInt16(data.slice(posStart,posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.optionApproverNumDenominator = helper.hboToInt16(data.slice(posStart,posEnd));

    if(this.optionApproverNumDenominator > 0){
      for (let i = 0; i < this.optionApproverNumDenominator; i++) {
        posStart = posEnd;
        posEnd = posEnd + 2;
        valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + valueLength;
        this.optionApprovers.push(data.slice(posStart, posEnd));
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength = helper.hboToInt32(data.slice(posStart,posEnd));
    if(valueLength > 0){
      posStart = posEnd;
      posEnd = posEnd + valueLength; // uint32

      const assetBin = data.slice(posStart, posEnd);

      const user_id = new Uint8Array(0)
      this.asset = new BBcAsset(user_id, this.idLength);
      this.asset.unpack(assetBin);
    }

    return true;
  }

}
