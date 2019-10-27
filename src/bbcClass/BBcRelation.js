import { BBcAsset } from './BBcAsset.js';
import { BBcAssetRaw } from './BBcAssetRaw.js';
import { BBcAssetHash } from './BBcAssetHash.js';
import { BBcPointer } from './BBcPointer.js';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';
import {idsLength} from './idsLength';

export class BBcRelation{
  constructor(assetGroupId, idsLengthConf=null, version=1) {
    this.version = version;
    if (idsLengthConf !== null){
      this.setLength(idsLengthConf);
    }else{
      this.setLength(idsLength);
    }
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

  setVersion(ver) {
    this.version = ver;
  }

  setLength(_idsLength){
    this.idsLength = cloneDeep(_idsLength);
  }


  setAsset(asset) {
    this.asset = cloneDeep(asset);
  }

  setAssetRaw(assetRaw) {
    if(this.version >= 2){
      this.assetRaw = cloneDeep(assetRaw);
    }
  }

  setAssetHash(assetHash) {
    if(this.version >= 2){
      this.assetHash = cloneDeep(assetHash);
    }
  }

  showRelation() {
    console.log('assetGroupId :', jseu.encoder.arrayBufferToHexString(this.assetGroupId));
    console.log('pointers.length :', this.pointers.length);
    if (this.pointers.length > 0) {
      for (let i = 0; i < this.pointers.length; i++) {
        console.log('pointers[',i,'] :');
        this.pointers[i].showPointer();
      }
    }

    if (this.asset != null) {
      console.log('asset:',this.asset.showAsset());
    }
  }

  addAssetGroupId(assetGroupId) {
    if (assetGroupId != null) {
      this.assetGroupId = cloneDeep(assetGroupId);
    }
  }

  addPointer(pointer) {
    if (pointer != null) {
      this.pointers.push(cloneDeep(pointer));
    }
  }

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

  unpack(data) {

    let posStart = 0;
    let posEnd = 2; // uint16
    let valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

    posStart = posEnd;
    posEnd = posEnd + valueLength;
    this.assetGroupId = data.slice(posStart, posEnd);

    posStart = posEnd;
    posEnd = posEnd + 2; // uint16
    valueLength = helper.hboToInt16(data.slice(posStart, posEnd));

    if (valueLength > 0) {
      for (let i = 0; i < valueLength; i++) {
        posStart = posEnd;
        posEnd = posEnd + 2;
        const pointerLength = helper.hboToInt16(data.slice(posStart, posEnd));

        posStart = posEnd;
        posEnd = posEnd + pointerLength;

        const pointerBin = data.slice(posStart, posEnd);
        const ptr = new BBcPointer(null, null, this.idsLength);

        ptr.unpack(pointerBin);
        this.pointers.push(ptr);
      }
    }

    posStart = posEnd;
    posEnd = posEnd + 4; // uint32
    valueLength = helper.hboToInt32(data.slice(posStart, posEnd));

    if (valueLength > 0) {
      posStart = posEnd;
      posEnd = posEnd + valueLength; // uint32
      const assetBin = data.slice(posStart, posEnd);
      this.asset = new BBcAsset(null, this.idsLength);
      this.asset.unpack(assetBin);
    }

    if (this.version >= 2) {
      posStart = posEnd;
      posEnd = posEnd + 4; // uint32
      valueLength = helper.hboToInt32(data.slice(posStart, posEnd));

      if (valueLength > 0) {
        posStart = posEnd;
        posEnd = posEnd + valueLength; // uint32
        const assetRawBin = data.slice(posStart, posEnd);
        this.assetRaw = new BBcAssetRaw(this.idsLength);
        this.assetRaw.unpack(assetRawBin);
      }

      posStart = posEnd;
      posEnd = posEnd + 4; // uint32
      valueLength = helper.hboToInt32(data.slice(posStart, posEnd));

      if (valueLength > 0) {
        posStart = posEnd;
        posEnd = posEnd + valueLength; // uint32
        const assetHashBin = data.slice(posStart, posEnd);
        this.assetHash = new BBcAssetHash(this.idsLength);
        this.assetHash.unpack(assetHashBin);
      }
    }
  }
}

