import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';
import * as helper from '../helper';

export class BBcAssetRaw{
  constructor(id_length=32) {
    this.set_length(id_length); // int
    this.asset_id = new Uint8Array(this.id_length); // Uint8Array
    this.asset_body_size = 0; // int
    this.asset_body = new Uint8Array(0); // Uint8Array
  }

  set_length(id_length){
    this.id_length = cloneDeep(id_length);
  }

  show_asset() {
    if (this.asset_id != null) {
      // eslint-disable-next-line no-console
      console.log('this.asset_id :', jseu.encoder.arrayBufferToHexString(this.asset_id));
    }
    // eslint-disable-next-line no-console
    console.log('this.asset_body_size', this.asset_body_size);
    // eslint-disable-next-line no-console
    console.log('this.asset_body :', jseu.encoder.arrayBufferToHexString(this.asset_body));
  }

  async set_asset(asset_id, asset_body) {
    if (asset_body !== null) {
      this.asset_body = asset_body;
      this.asset_body_size = asset_body.length;
    }
    return true;
  }

  async digest() {
    return this.asset_id;
  }

  pack() {

    let binary_data = [];
    binary_data = binary_data.concat(Array.from(helper.hbo(this.asset_id.length, 2)));
    binary_data = binary_data.concat(Array.from(this.asset_id));
    binary_data = binary_data.concat(Array.from(helper.hbo(this.asset_body_size, 2)));
    if (this.asset_body_size > 0 && this.asset_body != null){
      binary_data = binary_data.concat(Array.from(this.asset_body));
    }

    return new Uint8Array(binary_data);
  }

  unpack(data) {

    let pos_s = 0;
    let pos_e = 2; // uint16
    const value_length =  helper.hboToInt16(data.slice(pos_s,pos_e));

    if (value_length > 0){
      pos_s = pos_e;
      pos_e = pos_e + value_length;
      this.asset_id = data.slice(pos_s,pos_e);
    }

    pos_s = pos_e;
    pos_e = pos_e + 2;  // uint16
    this.asset_body_size = helper.hboToInt16(data.slice(pos_s,pos_e));

    if (this.asset_body_size > 0) {
      pos_s = pos_e;
      pos_e = pos_e + this.asset_body_size;
      this.asset_body = data.slice(pos_s, pos_e);
    }

    return true;
  }

}


