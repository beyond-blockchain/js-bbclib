import { BBcAsset } from './BBcAsset.js';
import { BBcAssetRaw } from './BBcAssetRaw.js';
import { BBcAssetHash } from './BBcAssetHash.js';
import { BBcPointer } from './BBcPointer.js';
import jseu from 'js-encoding-utils';
import * as helper from '../helper';
import cloneDeep from 'lodash.clonedeep';

export class BBcRelation{
  constructor(asset_group_id, id_length=32, version=1) {
    this.version = version;
    this.id_length = cloneDeep(id_length);
    if (asset_group_id !== null) {
      this.asset_group_id = cloneDeep(asset_group_id);
    } else {
      this.asset_group_id = new Uint8Array(this.id_length);
    }

    this.pointers = [];
    this.asset = null;
    this.asset_raw = null;
    this.asset_hash = null;
  }

  set_version(ver) {
    this.version = ver;
  }

  show_relation() {
    console.log('asset_group_id :', jseu.encoder.arrayBufferToHexString(this.asset_group_id));
    console.log('pointers.length :', this.pointers.length);
    if (this.pointers.length > 0) {
      for (let i = 0; i < this.pointers.length; i++) {
        console.log('pointers[',i,'] :');
        this.pointers[i].show_pointer();
      }
    }

    if (this.asset != null) {
      console.log('asset:',this.asset.show_asset());
    }
  }

  add_asset_group_id(asset_group_id) {
    if (asset_group_id != null) {
      this.asset_group_id = cloneDeep(asset_group_id);
    }
  }

  set_asset(asset) {
    this.asset = cloneDeep(asset);
  }

  add_pointer(pointer) {
    if (pointer != null) {
      this.pointers.push(cloneDeep(pointer));
    }
  }

  pack() {
    let binary_data = [];

    binary_data = binary_data.concat(Array.from(helper.hbo(this.asset_group_id.length, 2)));
    binary_data = binary_data.concat(Array.from(this.asset_group_id));
    binary_data = binary_data.concat(Array.from(helper.hbo(this.pointers.length,2)));

    if (this.pointers.length > 0){
      for (let i = 0; i < this.pointers.length; i++ ) {
        binary_data = binary_data.concat(Array.from(helper.hbo(this.pointers[i].pack().length, 2)));
        binary_data = binary_data.concat(Array.from(this.pointers[i].pack()));
      }
    }
    binary_data = binary_data.concat(Array.from(helper.hbo(this.asset.pack().length, 4)));

    if(this.asset.pack().length > 0){
      binary_data = binary_data.concat(Array.from(this.asset.pack()));
    }
    if (this.version >= 2) {
      if(this.asset_raw !== null && this.asset.pack().length > 0){
        binary_data = binary_data.concat(Array.from(this.asset_raw.pack()));
      }
      if(this.asset_hash !== null && this.asset.pack().length > 0){
        binary_data = binary_data.concat(Array.from(this.asset_hash.pack()));
      }
    }

    return new Uint8Array(binary_data);

  }

  unpack(data) {

    let pos_s = 0;
    let pos_e = 2; // uint16
    let value_length = helper.hboToInt16(data.slice(pos_s, pos_e));

    pos_s = pos_e;
    pos_e = pos_e + value_length;
    this.asset_group_id = data.slice(pos_s, pos_e);

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    value_length = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (value_length > 0) {
      for (let i = 0; i < value_length; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 2;
        const pointer_length = helper.hboToInt16(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + pointer_length;

        const pointer_bin = data.slice(pos_s, pos_e);
        const ptr = new BBcPointer(null, null, this.id_length);

        ptr.unpack(pointer_bin);
        this.pointers.push(ptr);
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 4; // uint32
    value_length = helper.hboToInt32(data.slice(pos_s, pos_e));

    if (value_length > 0) {
      pos_s = pos_e;
      pos_e = pos_e + value_length; // uint32
      const asset_bin = data.slice(pos_s, pos_e);
      this.asset = new BBcAsset(null, this.id_length);
      this.asset.unpack(asset_bin);
    }

    if (this.version >= 2) {
      pos_s = pos_e;
      pos_e = pos_e + 4; // uint32
      value_length = helper.hboToInt32(data.slice(pos_s, pos_e));
      if (value_length > 0) {
        pos_s = pos_e;
        pos_e = pos_e + value_length; // uint32
        const asset_raw_bin = data.slice(pos_s, pos_e);
        this.asset_raw = new BBcAssetRaw(this.id_length);
        this.asset_raw.unpack(asset_raw_bin);
      }

      pos_s = pos_e;
      pos_e = pos_e + 4; // uint32
      value_length = helper.hboToInt32(data.slice(pos_s, pos_e));
      if (value_length > 0) {
        pos_s = pos_e;
        pos_e = pos_e + value_length; // uint32
        const asset_hash_bin = data.slice(pos_s, pos_e);
        this.asset_hash = new BBcAssetHash(this.id_length);
        this.asset_raw.unpack(asset_hash_bin);
      }
    }
  }
}

