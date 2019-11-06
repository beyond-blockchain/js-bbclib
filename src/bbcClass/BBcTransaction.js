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
  /**
   *
   * constructor
   * @param {Number} version
   * @param {Object} idsLengthConf
   */
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
    this.targetSerialize = null;
  }

  /**
   *
   * get dump data
   * @return {String}
   */
  dump() {
    let dump = '--Transaction--\n';
    dump += `idsLength: ${this.idsLength}\n`;
    dump += `version: ${this.version}\n`;
    dump += `timestamp: ${this.timestamp}\n`;

    if (this.events.length > 0) {
      for (let i = 0; i < this.events.length; i++) {
        dump += `event[${i}]: ${this.events[i].dump()}\n`;
      }
    }

    if (this.references.length > 0) {
      for (let i = 0; i < this.references.length; i++) {
        dump += `references[${i}]: ${this.references[i].dump()}\n`;
      }
    }

    if (this.relations.length > 0) {
      for (let i = 0; i < this.relations.length; i++) {
        dump += `relations[${i}]: ${this.relations[i].dump()}\n`;
      }
    }

    if (this.witness !== null) {
      dump += `witness: ${this.witness.dump()}\n`;
    }

    if (this.crossRef !== null) {
      dump += `crossRef: ${this.crossRef.dump()}\n`;
    }

    if (this.signatures.length > 0) {
      for (let i = 0; i < this.signatures.length; i++) {
        dump += `signatures[${i}]: ${this.signatures[i].dump()}\n`;
      }
    }

    Object.keys(this.useridSigidxMapping).forEach( (key) => {
      dump += `${key}: ${this.useridSigidxMapping[key]}\n`;
    });

    dump += `transactionId: ${jseu.encoder.arrayBufferToHexString(this.transactionId)}\n`;
    dump += `transactionBaseDigest: ${jseu.encoder.arrayBufferToHexString(this.transactionBaseDigest)}\n`;
    dump += '--end Transaction--';

    return dump;

  }

  /**
   *
   * add parts
   * @param {Array<BBcEvent>} _event
   * @param {Array<BBcReference>} _reference
   * @param {Array<BBcRelation>} _relation
   * @param {BBcWitness} _witness
   * @param {BBcCrossRef} _crossRef
   * @return {Boolean}
   */
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

  /**
   *
   * set witness
   * @param {BBcWitness} _witness
   */
  setWitness(_witness) {
    if (_witness !== null) {
      this.witness = cloneDeep(_witness);
      this.witness.transaction = this;
    }
  }

  /**
   *
   * add event
   * @param {BBcEvent} _event
   */
  addEvent(_event) {
    if (_event !== null){
      this.events.push(cloneDeep(_event));
    }
  }

  /**
   *
   * set events
   * @param {Array<BBcEvent>} _events
   */
  setEvents(_events) {
    if (_events !== null && Array.isArray(_events) ){
      this.events = cloneDeep(_events);
    }
  }

  /**
   *
   * add reference
   * @param {BBcReference} _reference
   */
  addReference(_reference) {
    if(_reference !== null){
      this.references.push(cloneDeep(_reference));
    }
  }

  /**
   *
   * set references
   * @param {Array<BBcReference>} _references
   */
  setReferences(_references) {
    if (Array.isArray(_references)) {
      if (_references.length > 0) {
        this.references = cloneDeep(_references);
      }
    }
  }

  /**
   *
   * add relation
   * @param {BBcRelation} _relation
   */
  addRelation(_relation) {
    if(_relation !== null){
      this.relations.push(cloneDeep(_relation));
    }
  }

  /**
   *
   * set relations
   * @param {Array<BBcRelation>} _relations
   */
  setRelations(_relations) {
    if (Array.isArray(_relations)) {
      if (_relations.length > 0) {
        this.relations = cloneDeep(_relations);
      }
    }
  }

  /**
   *
   * set crossRef
   * @param {BBcCrossRef} _crossRef
   */
  setCrossRef(_crossRef) {
    if (_crossRef !== null) {
      this.crossRef = cloneDeep(_crossRef);
    }
  }

  /**
   *
   * set sigIndex
   * @param {Uint8Array} _userId
   * @param {Number} _index
   */
  setSigIndex(_userId, _index){
    this.useridSigidxMapping[_userId] = _index;
  }

  /**
   *
   * get sigIndex
   * @param {Uint8Array} _userId
   * @return {Number}
   */
  getSigIndex(_userId) {
    if (!(_userId in this.useridSigidxMapping)) {
      const sigIndexObj = Object.keys(this.useridSigidxMapping);
      this.useridSigidxMapping[_userId] = sigIndexObj.length;
      this.signatures.push(new BBcSignature(para.KeyType.NOT_INITIALIZED));
    }
    return this.useridSigidxMapping[_userId];
  }

  /**
   *
   * add signature
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   * @return {Boolean}
   */
  addSignature(_userId, _signature) {
    if (_userId in this.useridSigidxMapping) {
      const idx = this.useridSigidxMapping[cloneDeep(_userId)];
      this.signatures[idx] = cloneDeep(_signature);
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * add signature using index
   * @param {Number} _index
   * @param {Uint8Array} _signature
   * @return {Boolean}
   */
  addSignatureUsingIndex(_index, _signature) {
    this.signatures[_index] = cloneDeep(_signature);
  }

  /**
   *
   * get transaction base
   * @return {Uint8Array}
   */
  async getTransactionBase() {
    this.targetSerialize = await this.getDigestForTransactionId();
    this.transactionBaseDigest = await jscu.hash.compute(this.targetSerialize, 'SHA-256');
    return helper.concat(this.transactionBaseDigest, this.packCrossRef());
  }

  /**
   *
   * get digest
   * @return {Uint8Array}
   */
  async digest() {
    return await jscu.hash.compute(await this.getTransactionBase(), 'SHA-256');
  }

  /**
   *
   * pack crossRef
   * @return {Uint8Array}
   */
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

  /**
   *
   * set transaction id
   * @return {Uint8Array}
   */
  async setTransactionId() {
    const digest = await this.digest();
    this.transactionId = digest.slice(0, this.idsLength.transactionId);
    return this.transactionId;
  }

  /**
   *
   * get digest for transaction id
   * @return {Uint8Array}
   */
  async getDigestForTransactionId() {

    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.version, 4)));
    binaryData = binaryData.concat(this.timestamp.toArray('big', 8));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.idsLength.transactionId, 2)));

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

  /**
   *
   * pack transaction data
   * @return {Uint8Array}
   */
  async pack() {

    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.version, 4)));
    binaryData = binaryData.concat(this.timestamp.toArray('big', 8));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.idsLength.transactionId, 2)));

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

  /**
   *
   * unpack transaction data
   * @param {Uint8Array} _data
   * @return {Boolean}
   */
  async unpack(_data) {

    let posStart = 0;
    let posEnd = 4; // uint32
    this.version = helper.hboToInt32(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 8;
    this.timestamp = new BN(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    this.idsLength.transactionId = helper.hboToInt16(_data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numEvents = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numEvents > 0) {
      for (let i = 0; i < numEvents; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const eventLength = helper.hboToInt32(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + eventLength; // uint16
        const eventBin = _data.slice(posStart, posEnd);

        const event = new BBcEvent();
        event.unpack(eventBin);
        this.events.push(event);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numReference = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numReference > 0) {
      for (let i = 0; i < numReference; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const referenceLength = helper.hboToInt32(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + referenceLength; // uint16
        const referenceBin = _data.slice(posStart, posEnd);
        const ref = new BBcReference(null, null, null, null, this.idsLength.transactionId);
        ref.unpack(referenceBin);
        this.references.push(ref);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numRelation = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numRelation > 0) {
      for (let i = 0; i < numRelation; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const relationLength = helper.hboToInt32(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + relationLength; // uint16
        const relationBin = _data.slice(posStart, posEnd);
        const rtn = new BBcRelation( null, this.idsLength, this.version);
        rtn.unpack(relationBin);
        this.relations.push(rtn);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numWitness = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numWitness > 0) {
      for (let i = 0; i < numWitness; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16

        const witnessLength = helper.hboToInt32(_data.slice(posStart, posEnd));
        posStart = posEnd;
        posEnd = posEnd + witnessLength; // uint16

        const witnessBin = _data.slice(posStart, posEnd);
        const witness = new BBcWitness(this.idsLength);
        witness.unpack(witnessBin);
        this.setWitness(witness);
        this.witness.setSigIndex();
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numCrossref = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numCrossref > 0) {
      for (let i = 0; i < numCrossref; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const crossrefLength = helper.hboToInt32(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + crossrefLength; // uint16
        const crossrefBin = _data.slice(posStart, posEnd);

        this.crossRef = new BBcCrossRef(new Uint8Array(0),new Uint8Array(0));
        this.crossRef.unpack(crossrefBin);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    const numSignature = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (numSignature > 0) {
      for (let i = 0; i < numSignature; i++) {
        posStart = posEnd;
        posEnd = posEnd + 4; // uint16
        const signatureLength = helper.hboToInt32(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + signatureLength; // uint16
        const signatureBin = _data.slice(posStart, posEnd);

        const sig = new BBcSignature(0);
        await sig.unpack(signatureBin);
        this.signatures.push(sig);
      }
    }
    await this.setTransactionId();
    return true;
  }

  /**
   *
   * sign transaction data
   * @param {Number} _keyType
   * @param {Uint8Array} _privateKey
   * @param {Uint8Array} _publicKey
   * @param {KeyPair} _keyPair
   * @return {BBcSignature}
   */
  async sign(_keyType, _privateKey, _publicKey, _keyPair) {

    if (_keyPair === null) {
      if (_privateKey.length !== 32 || _publicKey.length <= 32) {

        return null;
      }

      _keyPair = new KeyPair();
      _keyPair.setKeyPair(_keyType, _privateKey, _publicKey);
      if (_keyPair == null) {

        return null;
      }
    }
    const sig = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const s = await _keyPair.sign(await this.getTransactionBase());
    if (s === null) {
      return null;
    }
    await sig.add(s, await _keyPair.exportPublicKey('jwk'));
    return sig;
  }
}
