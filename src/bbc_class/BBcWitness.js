import * as helper from '../helper';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';

export class BBcWitness{
  constructor(idLength = 32) {
    this.idLength = cloneDeep(idLength);
    this.transaction = null;
    this.userIds = [];
    this.sigIndices = [];
  }

  showStr() {
    // eslint-disable-next-line no-console
    console.log('this.transaction :',this.transaction);
    for (let i = 0; i < this.userIds.length; i++) {
      // eslint-disable-next-line no-console
      console.log('this.userIds[', i, '] :', jseu.encoder.arrayBufferToHexString(this.userIds[i]));
    }
    for (let i = 0; i < this.sigIndices.length; i++) {
      // eslint-disable-next-line no-console
      console.log('this.sigIndices[', i, '] :', this.sigIndices[i]);
    }
  }

  addWitness(userId, keyType=0) {
    let flag = false;
    for (let i = 0; i < this.userIds.length; i++){
      if(userId.toString() === this.userIds[i].toString()) {
        flag = true;
        break;
      }
    }
    if (flag === false){
      this.userIds.push(cloneDeep(userId));
      this.sigIndices.push(this.transaction.getSigIndex(userId, keyType));
    }
  }

  addSignature(userId, signature) {
    this.transaction.addSignature(cloneDeep(userId), cloneDeep(signature));
  }

  addSignatureUsingIndex(userId, signature){

    for (let i = 0; i < this.userIds.length; i++){
      if(userId.toString() === this.userIds[i].toString()){
        this.transaction.addSignatureUsingIndex(this.sigIndices[i], signature);
        return true;
      }
    }

    return false;
  }

  setSigIndex(){
    if(this.transaction === null || this.userIds.length === 0){
      return ;
    }

    for (let i = 0; i < this.userIds.length; i++){
      this.transaction.setSigIndex(this.userIds[i], this.sigIndices[i]);
    }

  }

  addUser(user) {
    if (user != null) {
      this.userIds.push(cloneDeep(user));
      return true;
    }
    return false;
  }

  addSigIndices(index) {
    if (index != null) {
      this.sigIndices.push(cloneDeep(index));
      return true;
    }
    return false;
  }

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

  unpack(data) {
    let posStart = 0;
    let posEnd = 2;
    const userIdsLength = helper.hboToInt16(data.slice(posStart, posEnd));
    for (let i = 0; i < userIdsLength; i++) {
      posStart = posEnd;
      posEnd = posEnd + 2;
      const userValueLength = helper.hboToInt16(data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + userValueLength;
      this.userIds.push(data.slice(posStart, posEnd));

      posStart = posEnd;
      posEnd = posEnd + 2;
      const indexValue = helper.hboToInt16(data.slice(posStart, posEnd));
      this.sigIndices.push(indexValue);

    }
  }
}
