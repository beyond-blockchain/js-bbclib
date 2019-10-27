import jscu from 'js-crypto-utils';
import { BBcWitness } from './BBcWitness.js';
import { BBcReference } from './BBcReference.js';
import { BBcSignature } from './BBcSignature.js';
import { BBcRelation } from './BBcRelation.js';
import { BBcEvent } from './BBcEvent.js';
import { BBcCrossRef } from './BBcCrossRef';
import { KeyPair } from './KeyPair.js';
import * as para from '../parameter.js';
import * as helper from '../helper.js';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import BN from 'bn.js';
import {idsLength} from './idsLength.js';

const date = new Date();

export class BBcTransaction {

  constructor(version=1.0, idsLengthConf=null) {
    if (idsLengthConf != null){
      this.idsLength = idsLengthConf;
    }else{
      this.idsLength = idsLength;
    }
    this.version = cloneDeep(version);
    this.timestamp = (new BN(date.getTime())).mul(new BN(1000000)); //timestampはミリ秒なので nano秒へ変換
    this.events = [];
    this.references = [];
    this.relations = [];
    this.witness = null;
    this.crossRef = null;
    this.signatures = [];
    this.useridSigidxMapping = {};
    this.transactionId = new Uint8Array(0);
    this.transactionBaseDigest = new Uint8Array(0);
    this.transactionData = null;
    this.assetGroupIds = {};
    this.targetSerialize = null;
  }

  showStr() {
    console.log('**************showStr*************** :');

    console.log('idLength :', this.idLength);
    console.log('version :', this.version);
    console.log('timestamp :', this.timestamp);

    if (this.events.length > 0) {
      console.log('events');
      for (let i = 0; i < this.events.length; i++) {
        console.log('event[', i, '] :', this.events[i].showEvent());
      }
    }

    console.log('references :', this.references);
    console.log('relations :', this.relations);
    if (this.witness !== null) {
      console.log(this.witness.showStr());
    } else {
      console.log(this.witness);
    }

    console.log('crossRef :', this.crossRef);
    console.log('signatures :', this.signatures);

    console.log('signatures length :', this.signatures.length);

    if (this.signatures != null && this.signatures.length > 0) {
      console.log('signatures length :', this.signatures.length);
      console.log(this.signatures[0].showSig());
    } else {
      console.log(this.signatures);
    }
    console.log('useridSigidxMapping :', this.useridSigidxMapping);
    console.log('transactionId :', jseu.encoder.arrayBufferToHexString(this.transactionId));
    console.log('transactionBaseDigest :', jseu.encoder.arrayBufferToHexString(this.transactionBaseDigest));
    console.log('transactionData :', this.transactionData);
    console.log('assetGroupIds :', this.assetGroupIds);

  }

  addParts(_event, _reference, _relation, _witness, _crossRef) {
    if (Array.isArray(_event)) {
      if (_event.length > 0) {
        for (let i = 0; i < _event.length; i++) {
          this.events.push(cloneDeep(_event[i]));
        }
      }
    }

    if (Array.isArray(_reference)) {
      if (_reference.length > 0) {
        for (let i = 0; i < _reference.length; i++) {
          this.references.push(cloneDeep(_reference[i]));
        }
      }
    }

    if (Array.isArray(_relation)) {
      if (_relation.length > 0) {
        for (let i = 0; i < _relation.length; i++) {
          _relation[i].setVersion(this.version);
          this.relations.push(cloneDeep(_relation[i]));
        }
      }
    }

    if (_witness !== null) {
      this.witness = cloneDeep(_witness);
    }

    if (_crossRef !== null) {
      this.crossRef = cloneDeep(_crossRef);
    }

    return true;
  }

  setWitness(witness) {
    if (witness !== null) {
      this.witness = cloneDeep(witness);
      this.witness.transaction = this;
    }
  }

  addEvent(event) {
    if (event !== null){
      this.events.push(cloneDeep(event));
    }
  }

  setEvent(events) {
    if (events !== null && Array.isArray(events) ){
      this.events = cloneDeep(events);
    }
  }

  addReference(reference) {
    if(reference !== null){
      this.references.push(cloneDeep(reference));
    }
  }

  setReference(references) {
    if (Array.isArray(references)) {
      if (references.length > 0) {
        this.references = cloneDeep(references);
      }
    }
  }

  addRelation(relation) {
    if(relation !== null){
      this.relations.push(cloneDeep(relation));
    }
  }

  setRelation(relations) {
    if (Array.isArray(relations)) {
      if (relations.length > 0) {
        this.relations = cloneDeep(relations);
      }
    }
  }

  setCrossRef(crossRef) {
    if (crossRef !== null) {
      this.crossRef = cloneDeep(crossRef);
    }
  }

  setSigIndex(userId, index){
    this.useridSigidxMapping[userId] = index;
  }

  getSigIndex(userId) {
    if (!(userId in this.useridSigidxMapping)) {
      const sigIndexObj = Object.keys(this.useridSigidxMapping);
      this.useridSigidxMapping[userId] = sigIndexObj.length;
      this.signatures.push(new BBcSignature(para.KeyType.NOT_INITIALIZED));
    }
    return this.useridSigidxMapping[userId];
  }

  addSignature(userId, signature) {
    if (userId in this.useridSigidxMapping) {
      const idx = this.useridSigidxMapping[cloneDeep(userId)];
      this.signatures[idx] = cloneDeep(signature);
      return true;
    } else {
      return false;
    }
  }

  addSignatureUsingIndex(index, signature) {
    this.signatures[index] = cloneDeep(signature);
  }

  async digest() {
    this.targetSerialize = await this.getDigestForTransactionId();
    this.transactionBaseDigest = await jscu.hash.compute(this.targetSerialize, 'SHA-256');
    return await jscu.hash.compute(helper.concat(this.transactionBaseDigest, this.packCrossRef()), 'SHA-256');
  }

  async digest2() {
    this.targetSerialize = await this.getDigestForTransactionId();
    return this.targetSerialize;
  }

  async digest3() {
    this.targetSerialize = await this.getDigestForTransactionId();
    return this.transactionBaseDigest = await jscu.hash.compute(this.targetSerialize, 'SHA-256');
  }

  packCrossRef() {
    let binaryData = [];
    if (this.crossRef !== null) {
      binaryData = binaryData.concat(Array.from(helper.hbo(1, 2)));
      const packedData = this.crossRef.pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    } else {
      binaryData = binaryData.concat(Array.from(helper.hbo(0, 2)));
    }
    return new Uint8Array(binaryData);
  }

  async setTransactionId() {
    const digest = await this.digest();
    this.transactionId = digest.slice(0, this.idLength);
    return this.transactionId;
  }

  async getDigestForTransactionId() {

    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.version, 4)));
    binaryData = binaryData.concat(this.timestamp.toArray('big', 8));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.idLength, 2)));

    binaryData = binaryData.concat(Array.from(helper.hbo(this.events.length, 2)));
    for (let i = 0; i < this.events.length; i++) {
      const packedData = this.events[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.references.length, 2)));
    for (let i = 0; i < this.references.length; i++) {
      const packedData = this.references[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.relations.length, 2)));
    for (let i = 0; i < this.relations.length; i++) {
      const packedData = this.relations[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    if (this.witness !== null) {
      binaryData = binaryData.concat(Array.from(helper.hbo(1, 2)));
      const packedData = this.witness.pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    } else {
      binaryData = binaryData.concat(Array.from(helper.hbo(0, 2)));
    }

    return new Uint8Array(binaryData);
  }

  async pack() {

    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.version, 4)));
    binaryData = binaryData.concat(this.timestamp.toArray('big', 8));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.idLength, 2)));

    binaryData = binaryData.concat(Array.from(helper.hbo(this.events.length, 2)));
    for (let i = 0; i < this.events.length; i++) {
      const packedData = this.events[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.references.length, 2)));
    for (let i = 0; i < this.references.length; i++) {
      const packedData = this.references[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.relations.length, 2)));
    for (let i = 0; i < this.relations.length; i++) {
      const packedData = this.relations[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    if (this.witness !== null) {
      binaryData = binaryData.concat(Array.from(helper.hbo(1, 2)));
      const packedData = this.witness.pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    } else {
      binaryData = binaryData.concat(Array.from(helper.hbo(0, 2)));
    }

    if (this.crossRef !== null) {
      binaryData = binaryData.concat(Array.from(helper.hbo(1, 2)));
      const packedData = this.crossRef.pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    } else {
      binaryData = binaryData.concat(Array.from(helper.hbo(0, 2)));
    }

    binaryData = binaryData.concat(Array.from(helper.hbo(this.signatures.length, 2)));
    for (let i = 0; i < this.signatures.length; i++) {
      const packedData = this.signatures[i].pack();
      binaryData = binaryData.concat(Array.from(helper.hbo(packedData.length, 4)));
      binaryData = binaryData.concat(Array.from(packedData));
    }

    return new Uint8Array(binaryData);

  }

  async unpack(data) {

    let posStart = 0;
    let posEnd = 4; // uint32
    this.version = helper.hboToInt32(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 8;
    this.timestamp = new BN(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.idLength = helper.hboToInt16(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numEvents = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numEvents > 0) {
      for (let i = 0; i < numEvents; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const eventLength = helper.hboToInt32(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + eventLength; // uint16
        const eventBin = data.slice(posStart, posEnd);

        const event = new BBcEvent();
        event.unpack(eventBin);
        this.events.push(event);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numReference = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numReference > 0) {
      for (let i = 0; i < numReference; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const referenceLength = helper.hboToInt32(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + referenceLength; // uint16
        const referenceBin = data.slice(posStart, posEnd);
        const ref = new BBcReference(null, null, null, null, this.idLength);
        ref.unpack(referenceBin);
        this.references.push(ref);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numRelation = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numRelation > 0) {
      for (let i = 0; i < numRelation; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const relationLength = helper.hboToInt32(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + relationLength; // uint16
        const relationBin = data.slice(posStart, posEnd);
        const rtn = new BBcRelation( null, this.idLength, this.version);
        rtn.unpack(relationBin);
        this.relations.push(rtn);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numWitness = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numWitness > 0) {
      for (let i = 0; i < numWitness; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16

        const witnessLength = helper.hboToInt32(data.slice(posStart, posEnd));
        posStart = posEnd;
        posEnd = posEnd + witnessLength; // uint16

        const witnessBin = data.slice(posStart, posEnd);
        const witness = new BBcWitness(this.idLength);
        witness.unpack(witnessBin);
        this.setWitness(witness);
        this.witness.setSigIndex();
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numCrossref = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numCrossref > 0) {
      for (let i = 0; i < numCrossref; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const crossrefLength = helper.hboToInt32(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + crossrefLength; // uint16
        const crossrefBin = data.slice(posStart, posEnd);

        this.crossRef = new BBcCrossRef(new Uint8Array(0),new Uint8Array(0));
        this.crossRef.unpack(crossrefBin);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numSignature = helper.hboToInt16(data.slice(posStart, posEnd));

    if (numSignature > 0) {
      for (let i = 0; i < numSignature; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const signatureLength = helper.hboToInt32(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + signatureLength; // uint16
        const signatureBin = data.slice(posStart, posEnd);

        const sig = new BBcSignature(0);
        await sig.unpack(signatureBin);
        this.signatures.push(sig);
      }
    }
    await this.setTransactionId();
    return true;
  }

  async sign(keyType, privateKey, publicKey, keyPair) {

    if (keyPair === null) {
      if (privateKey.length !== 32 || publicKey.length <= 32) {

        return null;
      }

      keyPair = new KeyPair();
      keyPair.setKeyPair(keyType, privateKey, publicKey);
      if (keyPair == null) {

        return null;
      }
    }

    const sig = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const s = await keyPair.sign(await this.digest());
    if (s === null) {
      return null;
    }
    await sig.add(s, await keyPair.exportPublicKey('jwk'));
    return sig;
  }

}


