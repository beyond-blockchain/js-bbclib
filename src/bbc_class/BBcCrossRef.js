import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';

export class BBcCrossRef{
  constructor(domainId, transactionId) {
    this.domainId = domainId; // Uint8Array
    this.transactionId = transactionId; // Uint8Array
  }

  showCrossRef() {
    // eslint-disable-next-line no-console
    console.log('domainId :', jseu.encoder.arrayBufferToHexString(this.domainId));
    // eslint-disable-next-line no-console
    console.log('transactionId :',jseu.encoder.arrayBufferToHexString(this.transactionId));
  }

  setDomainId(domainId) {
    this.domainId = cloneDeep(domainId);
  }

  setTransactionId(transactionId) {
    this.transactionId = cloneDeep(transactionId);
  }

  pack() {
    let binaryData = [];
    binaryData = binaryData.concat(Array.from(helper.hbo(this.domainId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.domainId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.transactionId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.transactionId));
    return new Uint8Array(binaryData);
  }

  unpack(data) {
    let valueLength;

    let posStart = 0;
    let posEnd = 2;
    valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));
    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.domainId = data.slice(posStart,posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2;
    valueLength =  helper.hboToInt16(data.slice(posStart,posEnd));
    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.transactionId = data.slice(posStart,posEnd);
  }
}
