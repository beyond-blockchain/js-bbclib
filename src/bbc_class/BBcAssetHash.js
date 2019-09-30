import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';

export class BBcAssetHash{
  constructor(id_length=32) {
    this.set_length(id_length); // int
    this.asset_ids = [];
  }

  set_length(id_length){
    this.id_length = cloneDeep(id_length);
  }

  show_asset() {
    // eslint-disable-next-line no-console
    console.log('this.asset_ids.length :', this.asset_ids.length);
    for (let i = 0; i < this.asset_ids.length; i++) {
      // eslint-disable-next-line no-console
      console.log('asset_ids[',i,'] :', jseu.encoder.arrayBufferToHexString(this.asset_ids[i]));
    }
  }

  async add_asset_id(asset_id) {
    this.asset_ids.push(cloneDeep(asset_id));
    return true;
  }

  pack() {

    let binary_data = [];
    binary_data = binary_data.concat(Array.from(helper.hbo(this.asset_ids.length,2)));
    for (let i = 0; i < this.asset_ids.length; i++ ) {
      binary_data = binary_data.concat(Array.from(this.asset_ids[i]));
    }

    return new Uint8Array(binary_data);
  }

  unpack(data) {
    this.asset_ids = [];

    let pos_s = 0;
    let pos_e = 2; // uint16
    const ids_count =  helper.hboToInt16(data.slice(pos_s,pos_e));

    if (ids_count > 0) {
      pos_s = pos_e;
      pos_e = pos_e + 2;
      const id_length = helper.hboToInt16(data.slice(pos_s, pos_e));

      pos_s = pos_e;
      pos_e = pos_e + id_length;
      this.asset_ids.push(data.slice(pos_s, pos_e));
    }

    return true;
  }

}


