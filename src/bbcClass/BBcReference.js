import * as helper from '../helper.js';
import cloneDeep from 'lodash.clonedeep';

export class BBcReference{
  constructor(assetGroupId, transaction, refTransaction, eventIndexInRef, idLength=32) {
    this.idLength = cloneDeep(idLength);
    this.assetGroupId = cloneDeep(assetGroupId);
    this.transactionId = new Uint8Array(this.idLength);
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
    this.prepareReference(refTransaction);
  }

  prepareReference(refTransaction) {
    this.refTransaction = cloneDeep( refTransaction );
    try {

      const evt = refTransaction.events[this.eventIndexInRef];
      for (let i = 0; i < evt.mandatoryApprovers.length; i++) {
        this.sigIndices.append(this.transaction.getSigIndex(evt.mandatoryApprovers[i]));
      }

      for (let i = 0; i < evt.optionApproverNumNumerator.length(); i++) {
        const dummyId = helper.getRandomValue(4);
        this.optionSigIds.append(dummyId);
        this.sigIndices.append(this.transaction.getSigIndex(dummyId));
        this.mandatoryApprovers = evt.mandatoryApprovers;
        this.optionApprovers = evt.optionApprovers;
        this.transactionId = refTransaction.digest();
      }
    } catch (e) {
      //print(e);
    }

  }

  addSignature(userId, signature) {
    if (userId === true) {
      if (this.optionSigIds.length === 0) {
        return;
      }
      // TODO:
      //userId = this.optionSigIds.pop(0);

    }
    this.transaction.addSignature(cloneDeep(userId), cloneDeep(signature));
  }

  getReferredTransaction() {
    return {key: this.refTransaction.serialize()};
  }

  getDestinations() {
    return this.mandatoryApprovers + this.optionApprovers;
  }

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

  unpack(data) {
    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.assetGroupId = data.slice(posStart, posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = data.slice(posStart, posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    this.eventIndexInRef = helper.hboToInt16(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2;
    const numSigIndices = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numSigIndices > 0){
      for (let i =0; i < numSigIndices; i++){
        posStart = posEnd;
        posEnd = posEnd + 2;
        const sigIndice = helper.hboToInt16(data.slice(posStart, posEnd));
        this.sigIndices.push(sigIndice);
      }
    }

    return true;
  }

}
