import { BBcAsset } from './BBcAsset.js';
import { BBcAssetRaw } from './BBcAssetRaw.js';
import { BBcAssetHash } from './BBcAssetHash.js';
import { BBcPointer } from './BBcPointer.js';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';
import {IDsLength} from './idsLength';

export class BBcRelation{
  /**
   *
   * constructor
   * @param {Uint8Array} assetGroupId
   * @param {Number} version
   * @param {Object} idsLength
   */
  constructor(assetGroupId,  version=1, idsLength=IDsLength) {
    this.version = version;
    this.setLength(idsLength);
    if (assetGroupId !== null) {
      this.assetGroupId = cloneDeep(assetGroupId);
    } else {
      this.assetGroupId = new Uint8Array(this.idsLength.assetGroupId);
    }

    this.pointers = [];
    this.asset = null;
    this.assetRaw = null;
    this.assetHash = null;
  }

  /**
   *
   * set version
   * @return {String}
   */
  setVersion(_version) {
    this.version = _version;
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
   * set asset
   * @param {BBcAsset} _asset
   * @return {BBcRelation}
   */
  setAsset(_asset) {
    this.asset = cloneDeep(_asset);
    return this;
  }

  /**
   *
   * set asset group id
   * @param {Uint8Array} _assetGroupId
   * @return {BBcRelation}
   */
  setAssetGroup(_assetGroupId) {
    this.assetGroupId = cloneDeep(_assetGroupId);
    return this;
  }

  /**
   *
   * set assetRaw
   * @param {BBcAssetRaw} _assetRaw
   * @return {BBcRelation}
   */
  setAssetRaw(_assetRaw) {
    if(this.version >= 2){
      this.assetRaw = cloneDeep(_assetRaw);
    }
    return this;
  }

  /**
   *
   * create assetRaw
   * @param {Uint8Array} assetId
   * @param {Uint8Array} assetBody
   * @return {BBcRelation}
   */
  createAssetRaw(assetId, assetBody){
    this.assetRaw = new BBcAssetRaw(assetId, assetBody, this.version, this.idsLength);
    return this;
  }

  /**
   *
   * create assetHash
   * @param {Array<Uint8Array>} assetIds
   * @return {BBcRelation}
   */
  createAssetHash(assetIds){
    this.assetHash = new BBcAssetHash(assetIds, this.version, this.idsLength);
    return this;
  }

  /**
   *
   * set assetHash
   * @param {BBcAssetHash} _assetHash
   * @return {BBcRelation}
   */
  setAssetHash(_assetHash) {
    if(this.version >= 2){
      this.assetHash = cloneDeep(_assetHash);
    }
    return this;
  }

  /**
   *
   * crete asset
   * @param {Uint8Array} userId
   * @param {Uint8Array} assetBody
   * @param {Uint8Array} assetFile
   * @return {BBcRelation}
   */
  async createAsset(userId=new Uint8Array(0), assetBody=new Uint8Array(0), assetFile=new Uint8Array(0)){
    this.asset = new BBcAsset(userId,this.version, this.idsLength);
    await this.asset.setAssetFile(assetFile);
    await this.asset.setAssetBody(assetBody);
    return this;
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
    let dump = `${intent}--Relation--\n`;
    dump += `${intent}idsLength.assetGroupId: ${this.idsLength.assetGroupId} \n`;
    dump += `${intent}assetGroupId: ${jseu.encoder.arrayBufferToHexString(this.assetGroupId)}\n`;
    dump += `${intent}pointers.length: ${this.pointers.length}\n`;
    for (let i = 0; i < this.pointers.length; i++) {
      dump += `${intent}pointers[${i}]: \n${this.pointers[i].dump(intentNum + 1)}\n`;
    }
    if (this.asset != null) {
      dump += `${intent}asset: \n${this.asset.dump(intentNum +1 )}\n`;
    }

    if (this.version > 1 && this.assetRaw !== null){
      dump += `${intent}assetRaw: \n${this.assetRaw.dump(intentNum +1)}\n`;
    }
    if (this.version > 1 && this.assetHash !== null){
      dump += `${intent}assetHash: \n${this.assetHash.dump(intentNum +1)}\n`;
    }
    dump += `${intent}--end Relation--`;
    return dump;
  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  dumpJSON() {
    const pointers = [];
    let asset;
    let assetRaw;
    let assetHash;
    for (let i = 0; i < this.pointers.length; i++) {
      pointers.push(this.pointers.dumpJSON());
    }
    if (this.asset !== null) {
      asset = this.asset.dumpJSON();
    }
    if (this.version > 1 && this.assetRaw !== null){
      assetRaw = this.assetRaw.dumpJSON();
    }
    if (this.version > 1 && this.assetHash !== null){
      assetHash = this.assetHash.dumpJSON();
    }

    const jsonData = {
      idsLength: this.idsLength,
      version: this.version,
      assetGroupId: jseu.encoder.arrayBufferToHexString(this.assetGroupId),
      pointers,
      asset,
      assetHash,
      assetRaw
    };
    return jsonData;
  }

  /**
   *
   * create pointer
   * @param {BBcPointer} _pointer
   */
  createPointer(transactionId=null, assetId=null) {
    this.pointers.push( new BBcPointer(transactionId, assetId, this.version, this.idsLength));
  }

  /**
   *
   * create pointer
   * @param {BBcPointer} _pointer
   */
  addPointer(_pointer) {
    if (_pointer != null) {
      this.pointers.push(cloneDeep(_pointer));
    }
  }

  /**
   *
   * pack relation data
   * @return {Uint8Array}
   */
  pack() {
    let binaryData = [];

    binaryData = binaryData.concat(Array.from(helper.hbo(this.assetGroupId.length, 2)));
    binaryData = binaryData.concat(Array.from(this.assetGroupId));
    binaryData = binaryData.concat(Array.from(helper.hbo(this.pointers.length,2)));

    if (this.pointers.length > 0){
      for (let i = 0; i < this.pointers.length; i++ ) {
        binaryData = binaryData.concat(Array.from(helper.hbo(this.pointers[i].pack().length, 2)));
        binaryData = binaryData.concat(Array.from(this.pointers[i].pack()));
      }
    }
    if (this.asset !== null){
      binaryData = binaryData.concat(Array.from(helper.hbo(this.asset.pack().length, 4)));
      binaryData = binaryData.concat(Array.from(this.asset.pack()));
    }else{
      binaryData = binaryData.concat(Array.from(helper.hbo(0, 4)));
    }

    if (this.version >= 2) {
      if(this.assetRaw !== null){
        binaryData = binaryData.concat(Array.from(helper.hbo(this.assetRaw.pack().length, 4)));
        binaryData = binaryData.concat(Array.from(this.assetRaw.pack()));
      }else{
        binaryData = binaryData.concat(Array.from(helper.hbo(0, 4)));
      }

      if(this.assetHash !== null){
        binaryData = binaryData.concat(Array.from(helper.hbo(this.assetHash.pack().length, 4)));
        binaryData = binaryData.concat(Array.from(this.assetHash.pack()));
      }else{
        binaryData = binaryData.concat(Array.from(helper.hbo(0, 4)));
      }
    }

    return new Uint8Array(binaryData);

  }

  /**
   *
   * unpack relation data
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
    posEnd = posEnd + 2; // uint16
    valueLength = helper.hboToInt16(_data.slice(posStart, posEnd));

    if (valueLength > 0) {
      for (let i = 0; i < valueLength; i++) {
        posStart = posEnd;
        posEnd = posEnd + 2;
        const pointerLength = helper.hboToInt16(_data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + pointerLength;

        const pointerBin = _data.slice(posStart, posEnd);
        const ptr = new BBcPointer(null, null, this.idsLength);

        ptr.unpack(pointerBin);
        this.pointers.push(ptr);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength = helper.hboToInt32(_data.slice(posStart, posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength; // uint32
      const assetBin = _data.slice(posStart, posEnd);
      this.asset = new BBcAsset(null, this.idsLength);
      this.asset.unpack(assetBin);
    }

    if (this.version >= 2) {
      posStart = posEnd;
      posEnd = posEnd + 4; // uint32
      valueLength = helper.hboToInt32(_data.slice(posStart, posEnd));

      if (valueLength > 0) {
        posStart = posEnd;
        posEnd = posEnd + valueLength; // uint32
        const assetRawBin = _data.slice(posStart, posEnd);
        this.assetRaw = new BBcAssetRaw(null, null, this.version, this.idsLength);
        this.assetRaw.unpack(assetRawBin);
      }

      posStart = posEnd;
      posEnd = posEnd + 4; // uint32
      valueLength = helper.hboToInt32(_data.slice(posStart, posEnd));

      if (valueLength > 0) {
        posStart = posEnd;
        posEnd = posEnd + valueLength; // uint32
        const assetHashBin = _data.slice(posStart, posEnd);
        this.assetHash = new BBcAssetHash([], this.version, this.idsLength);
        this.assetHash.unpack(assetHashBin);
      }
    }
  }
}

