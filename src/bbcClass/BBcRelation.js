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
   */
  setAsset(_asset) {
    this.asset = cloneDeep(_asset);
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
   * set assetRaw
   * @param {BBcAssetRaw} _assetRaw
   */
  setAssetRaw(_assetRaw) {
    if(this.version >= 2){
      this.assetRaw = cloneDeep(_assetRaw);
    }
  }

  createAssetRaw(assetId, assetBody){
    this.assetRaw = new BBcAssetRaw(assetId, assetBody, this.version, this.idsLength);
  }

  createAssetHash(assetIds){
    this.assetHash = new BBcAssetHash(assetIds, this.version, this.idsLength);
  }

  /**
   *
   * set assetHash
   * @param {BBcAssetHash} _assetHash
   */
  setAssetHash(_assetHash) {
    if(this.version >= 2){
      this.assetHash = cloneDeep(_assetHash);
    }
  }

  async createAsset(userId=new Uint8Array(0), assetBody=new Uint8Array(0), assetFile=new Uint8Array(0)){
    this.asset = new BBcAsset(userId,this.version, this.idsLength);
    await this.asset.setAssetFile(assetFile);
    await this.asset.setAssetBody(assetBody);
  }


  /**
   *
   * get dump data
   * @return {String}
   */
  dump() {
    let dump = '--Relation--\n';
    dump += `idsLength: ${this.idsLength} \n`;
    dump += `assetGroupId: ${jseu.encoder.arrayBufferToHexString(this.assetGroupId)}\n`;
    dump += `pointers.length: ${this.pointers.length}\n`;
    for (let i = 0; i < this.pointers.length; i++) {
      dump += `pointers[${i}]: ${this.pointers[i].dump()}\n`;
    }
    if (this.asset != null) {
      dump += `asset: ${this.asset.dump()}\n`;
    }

    if (this.version > 1 && this.assetRaw !== null){
      dump += `assetRaw: ${this.assetRaw.dump()}\n`;
    }
    if (this.version > 1 && this.assetHash !== null){
      dump += `assetHash: ${this.assetHash.dump()}\n`;
    }
    dump += '--end Relation--';
    return dump;
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

