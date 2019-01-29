import * as helper from '../helper';
import jseu from 'js-encoding-utils';
import cloneDeep from 'lodash.clonedeep';

export class BBcWitness{
  constructor(id_length = 32) {
    this.id_length = cloneDeep(id_length);
    this.transaction = null;
    this.user_ids = [];
    this.sig_indices = [];
  }

  show_str() {
    // eslint-disable-next-line no-console
    console.log('this.transaction :',this.transaction);
    for (let i = 0; i < this.user_ids.length; i++) {
      // eslint-disable-next-line no-console
      console.log('this.user_ids[', i, '] :', jseu.encoder.arrayBufferToHexString(this.user_ids[i]));
    }
    for (let i = 0; i < this.sig_indices.length; i++) {
      // eslint-disable-next-line no-console
      console.log('this.sig_indices[', i, '] :', this.sig_indices[i]);
    }
  }

  add_witness(user_id, keyType) {
    if (this.user_ids.indexOf(user_id) === -1) {
      this.user_ids.push(cloneDeep(user_id));
      this.sig_indices.push(this.transaction.get_sig_index(user_id, keyType));
    }
  }

  add_signature(user_id, signature) {
    this.transaction.add_signature(cloneDeep(user_id), cloneDeep(signature));
  }

  add_user(user) {
    if (user != null) {
      this.user_ids.push(cloneDeep(user));
      return true;
    }
    return false;
  }

  add_sig_indices(index) {
    if (index != null) {
      this.sig_indices.push(cloneDeep(index));
      return true;
    }
    return false;
  }

  pack() {
    let binary_data = [];
    const elements_len = this.user_ids.length;
    binary_data = binary_data.concat(Array.from(helper.hbo(elements_len, 2)));
    for (let i = 0; i < elements_len; i++) {
      binary_data = binary_data.concat(Array.from(helper.hbo(this.user_ids[i].length, 2)));
      binary_data = binary_data.concat(Array.from(this.user_ids[i]));
      binary_data = binary_data.concat(Array.from(helper.hbo(this.sig_indices[i], 2)));
    }
    return new Uint8Array(binary_data);
  }

  unpack(data) {
    let pos_s = 0;
    let pos_e = 2;
    const user_ids_length = helper.hboToInt16(data.slice(pos_s, pos_e));
    for (let i = 0; i < user_ids_length; i++) {
      pos_s = pos_e;
      pos_e = pos_e + 2;
      const user_value_length = helper.hboToInt16(data.slice(pos_s, pos_e));

      pos_s = pos_e;
      pos_e = pos_e + user_value_length;
      this.user_ids.push(data.slice(pos_s, pos_e));

      pos_s = pos_e;
      pos_e = pos_e + 2;
      const index_value = helper.hboToInt16(data.slice(pos_s, pos_e));
      this.sig_indices.push(index_value);

    }
  }
}
