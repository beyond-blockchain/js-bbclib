import { BBcWitness } from './BBcWitness.js';
import { BBcReference } from './BBcReference.js';
import { BBcSignature } from './BBcSignature.js';
import { BBcRelation } from './BBcRelation.js';
import { BBcEvent } from './BBcEvent.js';
import { BBcCrossRef } from './BBcCrossRef';
import * as para from '../parameter.js';
import * as helper from '../helper.js';
import {getJscu} from '../env.js';
import cloneDeep from 'lodash.clonedeep';
import BN from 'bn.js';
import {IDsLength} from './idsLength.js';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const date = new Date();

export class BBcTransaction {
  /**
   *
   * constructor
   * @param {Number} version
   * @param {Object} idsLengthConf
   */
  constructor(version=1.0, idsLengthConf=IDsLength) {
    this.idsLength = idsLengthConf;
    this.version = cloneDeep(version);
    this.timestamp = (new BN(date.getTime())).mul(new BN(1000000)); //timestampはミリ秒なので nano秒へ変換
    this.events = [];
    this.references = [];
    this.relations = [];
    this.witness = null;
    this.crossRef = null;
    this.signatures = [];
    this.useridSigidxMapping = {};

    this.transactionBaseDigest = new Uint8Array(0);
    this.targetSerialize = null;
  }

  /**
   *
   * get dump data
   * @param {Number} intentNum
   * @return {String}
   */
  async dump(intentNum=0) {
    let intent = '';
    for(let i = 0; i < intentNum; i++){
      intent += '  ';
    }
    let dump = `${intent}--Transaction--\n`;
    dump += `${intent}idsLength: ${this.idsLength}\n`;
    dump += `${intent}version: ${this.version}\n`;
    dump += `${intent}timestamp: ${this.timestamp}\n`;

    if (this.events.length > 0) {
      for (let i = 0; i < this.events.length; i++) {
        dump += `${intent}event[${i}]: ${this.events[i].dump(intentNum + 1)}\n`;
      }
    }

    if (this.references.length > 0) {
      for (let i = 0; i < this.references.length; i++) {
        dump += `${intent}references[${i}]: ${this.references[i].dump(intentNum + 1)}\n`;
      }
    }

    if (this.relations.length > 0) {
      for (let i = 0; i < this.relations.length; i++) {
        dump += `${intent}relations[${i}]: ${this.relations[i].dump(intentNum + 1)}\n`;
      }
    }

    if (this.witness !== null) {
      dump += `${intent}witness: ${this.witness.dump(intentNum + 1)}\n`;
    }

    if (this.crossRef !== null) {
      dump += `${intent}crossRef: ${this.crossRef.dump(intentNum + 1)}\n`;
    }

    for (let i = 0; i < this.signatures.length; i++) {
      dump += `${intent}signatures[${i}]: ${await this.signatures[i].dump(intentNum + 1)}\n`;
    }

    Object.keys(this.useridSigidxMapping).forEach( (key) => {
      dump += `${intent}${key}: ${this.useridSigidxMapping[key]}\n`;
    });

    dump += `${intent}transactionBaseDigest: ${jseu.encoder.arrayBufferToHexString(this.transactionBaseDigest)}\n`;
    dump += `${intent}--end Transaction--`;

    return dump;

  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  async dumpJSON() {

    const events = [];
    const references = [];
    const relations = [];
    let witness = null;
    let crossRef = null;
    const signatures = [];
    const useridSigidxMapping = {};

    if (this.events.length > 0) {
      for (let i = 0; i < this.events.length; i++) {
        events.push(this.events[i].dumpJSON());
      }
    }

    if (this.references.length > 0) {
      for (let i = 0; i < this.references.length; i++) {
        references.push(this.references[i].dumpJSON());
      }
    }

    if (this.relations.length > 0) {
      for (let i = 0; i < this.relations.length; i++) {
        relations.push(this.relations[i].dumpJSON());
      }
    }

    if (this.witness !== null) {
      witness = this.witness.dumpJSON();
    }

    if (this.crossRef !== null) {
      crossRef = this.crossRef.dumpJSON();
    }

    if (this.signatures.length > 0) {
      for (let i = 0; i < this.signatures.length; i++) {
        signatures.push(await this.signatures[i].dumpJSON());
      }
    }

    const jsonData = {
      idsLength: this.idsLength,
      version: this.version,
      timestamp: jseu.encoder.arrayBufferToHexString(new Uint8Array(this.timestamp.toArray('big', 8))),
      events,
      references,
      relations,
      witness,
      crossRef,
      signatures,
      useridSigidxMapping: this.useridSigidxMapping
    };
    return jsonData;
  }

  /**
   *
   * load json data
   * @param {Object} _jsonData
   * @return {BBcTransaction}
   */
  async loadJSON(_jsonData) {
    this.version = _jsonData.version;
    this.idsLength = _jsonData.idsLength;
    this.timestamp = new BN(jseu.encoder.hexStringToArrayBuffer(_jsonData.timestamp));
    const events = [];
    if (_jsonData.events.length > 0) {
      for (let i = 0; i < _jsonData.events.length; i++) {
        const event = new BBcEvent(new Uint8Array(0), this.version, this.idsLength);
        events.push(event.loadJSON(_jsonData.events[i]));
      }
    }
    this.events = events;

    const references = [];
    if (_jsonData.references.length > 0) {
      for (let i = 0; i < _jsonData.references.length; i++) {
        const refernce = new BBcReference(null, null, null, null, this.version, this.idsLength.transactionId);
        references.push(refernce.loadJSON(_jsonData.references[i]));
      }
    }
    this.references = references;

    const relations = [];
    if (_jsonData.relations.length > 0) {
      for (let i = 0; i < _jsonData.relations.length; i++) {
        const relation = new BBcRelation( new Uint8Array(0), this.version, this.idsLength);
        relations.push(relation.loadJSON(_jsonData.relations[i]));
      }
    }
    this.relations = relations;

    if (_jsonData.witness !== null) {
      const witness = new BBcWitness(this.version, this.idsLength);
      this.witness = witness.loadJSON(_jsonData.witness);
    }

    if (_jsonData.crossRef !== null) {
      const crossRef = new BBcCrossRef(new Uint8Array(0),new Uint8Array(0), this.version, this.idsLength);
      this.crossRef = crossRef.loadJSON(_jsonData.crossRef);
    }

    const signatures =[];
    if (_jsonData.signatures.length > 0) {
      for (let i = 0; i < _jsonData.signatures.length; i++) {
        const signature = new BBcSignature(0, this.version, this.idsLength);
        signatures.push(await signature.loadJSON(_jsonData.signatures[i]))
      }
    }
    this.signatures = signatures;
    this.useridSigidxMapping = _jsonData.useridSigidxMapping;
    return this;
  }

  /**
   *
   * add parts
   * @param {Array<BBcEvent>} _event
   * @param {Array<BBcReference>} _reference
   * @param {Array<BBcRelation>} _relation
   * @param {BBcWitness} _witness
   * @param {BBcCrossRef} _crossRef
   * @return {BBcTransaction}
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

    return this;
  }

  /**
   *
   * set witness
   * @param {BBcWitness} _witness
   * @return {BBcTransaction}
   */
  setWitness(_witness) {
    if (_witness !== null) {
      this.witness = cloneDeep(_witness);
      this.witness.transaction = this;
    }
    return this;
  }

  /**
   *
   * add witness
   * @param {Uint8Array} _userId
   * @return {BBcTransaction}
   */
  addWitness(_userId) {
    if (_userId !== null) {
      this.witness.addWitness(_userId)
    }
    return this;
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
    return this;
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
    return this;
  }

   /**
   *
   * create event
   * @param {Uint8Array} _assetGroupId
   */
  createEvent(_assetGroupId) {
    this.events.push(new BBcEvent(_assetGroupId, this.version, this.idsLength));
    return this;
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
    return this;
  }

  /**
   *
   * set references
   * @param {Array<BBcReference>} _references
   */
  setReferences(_references) {
    if (_references != null && Array.isArray(_references)) {
      this.references = cloneDeep(_references);
    }
    return this;
  }

  /**
   *
   * create reference
   * @param {Uint8Array} _assetGroupId
   * @param {BBcTransaction} _transaction
   * @param {BBcTransaction} _refTransaction
   * @param {Number} _eventIndexInRef
   */
  createReference(_assetGroupId, _transaction, _refTransaction, _eventIndexInRef) {
    this.references.push(new BBcReference(_assetGroupId, _transaction, _refTransaction, _eventIndexInRef, this.version, this.idsLength));
    return this;
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
    return this;
  }

  /**
   *
   * set relations
   * @param {Array<BBcRelation>} _relations
   */
  setRelations(_relations) {
    if (_relations != null && Array.isArray(_relations)) {
      this.relations = cloneDeep(_relations);
    }
    return this;
  }

  /**
   *
   * create relation
   * @param {Uint8Array} _assetGroupId
   */
  createRelation(_assetGroupId) {
    this.relations.push(new BBcRelation(_assetGroupId, this.version, this.idsLength));
    return this;
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
    return this;
  }

  /**
   *
   * create crossRef
   * @param {Uint8Array} _domainId
   * @param {Uint8Array} _transactionId
   */
  createCrossRef(_domainId, _transactionId) {
    this.crossRef = new BBcCrossRef(_domainId, _transactionId, this.version, this.idsLength);

    return this;
  }

  /**
   *
   * set sigIndex
   * @param {Uint8Array} _userId
   * @param {Number} _index
   */
  setSigIndex(_userId, _index){
    this.useridSigidxMapping[_userId] = _index;
    return this;
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
      this.signatures.push(new BBcSignature(para.KeyType.NOT_INITIALIZED, this.version, this.idsLength));
    }
    return this.useridSigidxMapping[_userId];
  }

  /**
   *
   * add signature object
   * @param {Uint8Array} _userId
   * @param {Uint8Array} _signature
   * @return {Boolean}
   */
  addSignatureObject(_userId, _signature) {
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
   * add signature
   * @param {Uint8Array} _userId
   * @param {Number} _keyType
   * @param {Uint8Array} _privateKey
   * @param {Uint8Array} _publicKey
   * @param {Object} _keyPair
   * @param {Uint8Array} _isPublicKey
   * @return {Boolean}
   */
  addSignature(_userId, _keyType=null, _privateKey=new Uint8Array(0), _publicKey=new Uint8Array(0), _keyPair=null) {
    _userId = _userId.slice(0, this.idsLength.userId);
    const sig = this.sign(_keyType, _privateKey, _publicKey, _keyPair);
    if (!this.addSignatureObject(_userId, sig)){
      for (let i = 0; i < this.references.length; i++){
        if (this.references[i].addSignature(_userId, sig)){
          return true;
        }
      }
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
    return this;
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

  async getTransactionId() {
    this.targetSerialize = await this.getDigestForTransactionId();
    this.transactionBaseDigest = await jscu.hash.compute(this.targetSerialize, 'SHA-256');
    const id = await jscu.hash.compute(helper.concat(this.transactionBaseDigest, this.packCrossRef()), 'SHA-256');
    return id.slice(0, this.idsLength.transactionId);
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
      const packedData = await this.signatures[i].pack();
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

        const event = new BBcEvent(new Uint8Array(0), this.version, this.idsLength);
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
        const ref = new BBcReference(null, null, null, null, this.version, this.idsLength.transactionId);
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
        const rtn = new BBcRelation( new Uint8Array(0), this.version, this.idsLength);
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
        const witness = new BBcWitness(this.version, this.idsLength);
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

        this.crossRef = new BBcCrossRef(new Uint8Array(0),new Uint8Array(0), this.version, this.idsLength);
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

        const sig = new BBcSignature(0, this.version, this.idsLength);
        await sig.unpack(signatureBin);
        this.signatures.push(sig);
      }
    }

    return true;
  }

  /**
   *
   * sign transaction data
   * @param {Uint8Array} _userId
   * @param {KeyPair} _keyPair
   * @return {BBcSignature}
   */
  async sign(_userId, _keyPair) {
    const sig = new BBcSignature(_keyPair.keyType, this.version, this.idsLength);
    const s = await _keyPair.sign(await this.getTransactionBase());
    if (s === null) {
      return null;
    }
    await sig.addSignatureAndPublicKey(s, await _keyPair.exportPublicKey('jwk'));
    return this.addSignatureObject(_userId, sig);
  }
}
