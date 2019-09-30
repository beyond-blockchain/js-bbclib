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

const date = new Date();

export class BBcTransaction {

  constructor( version=1.0, id_length=32) {
    this.id_length = cloneDeep(id_length);
    this.version = cloneDeep(version);
    this.timestamp = (new BN(date.getTime())).mul(new BN(1000000)); //timestampはミリ秒なので nano秒へ変換
    this.events = [];
    this.references = [];
    this.relations = [];
    this.witness = null;
    this.cross_ref = null;
    this.signatures = [];
    this.userid_sigidx_mapping = {};
    this.transaction_id = new Uint8Array(0);
    this.transaction_base_digest = new Uint8Array(0);
    this.transaction_data = null;
    this.asset_group_ids = {};
    this.target_serialize = null;
  }

  show_str() {
    console.log('**************show_str*************** :');

    console.log('id_length :', this.id_length);
    console.log('version :', this.version);
    console.log('timestamp :', this.timestamp);

    if (this.events.length > 0) {
      console.log('events');
      for (let i = 0; i < this.events.length; i++) {
        console.log('event[', i, '] :', this.events[i].show_event());
      }
    }

    console.log('references :', this.references);
    console.log('relations :', this.relations);
    if (this.witness !== null) {
      console.log(this.witness.show_str());
    } else {
      console.log(this.witness);
    }

    console.log('cross_ref :', this.cross_ref);
    console.log('signatures :', this.signatures);

    console.log('signatures length :', this.signatures.length);

    if (this.signatures != null && this.signatures.length > 0) {
      console.log('signatures length :', this.signatures.length);
      console.log(this.signatures[0].show_sig());
    } else {
      console.log(this.signatures);
    }
    console.log('userid_sigidx_mapping :', this.userid_sigidx_mapping);
    console.log('transaction_id :', jseu.encoder.arrayBufferToHexString(this.transaction_id));
    console.log('transaction_base_digest :', jseu.encoder.arrayBufferToHexString(this.transaction_base_digest));
    console.log('transaction_data :', this.transaction_data);
    console.log('asset_group_ids :', this.asset_group_ids);

  }

  add_parts(_event, _reference, _relation, _witness, _cross_ref) {
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
          _relation[i].set_version(this.version);
          this.relations.push(cloneDeep(_relation[i]));
        }
      }
    }

    if (_witness !== null) {
      this.witness = cloneDeep(_witness);
    }

    if (_cross_ref !== null) {
      this.cross_ref = cloneDeep(_cross_ref);
    }

    return true;
  }

  set_witness(witness) {
    if (witness !== null) {
      this.witness = cloneDeep(witness);
      this.witness.transaction = this;
    }
  }

  add_event(event) {
    if (event !== null){
      this.events.push(cloneDeep(event));
    }
  }

  set_event(events) {
    if (event !== null && Array.isArray(events) ){
      this.events = cloneDeep(events);
    }
  }

  add_reference(reference) {
    if(reference !== null){
      this.references.push(cloneDeep(reference));
    }
  }

  set_reference(references) {
    if (Array.isArray(references)) {
      if (references.length > 0) {
        this.references = cloneDeep(references);
      }
    }
  }

  add_relation(relation) {
    if(relation !== null){
      this.relations.push(cloneDeep(relation));
    }
  }

  set_relation(relations) {
    if (Array.isArray(relations)) {
      if (relations.length > 0) {
        this.relations = cloneDeep(relations);
      }
    }
  }


  set_cross_ref(cross_ref) {
    if (cross_ref !== null) {
      this.cross_ref = cloneDeep(cross_ref);
    }
  }

  set_sig_index(user_id, index){
    this.userid_sigidx_mapping[user_id] = index;
  }

  get_sig_index(user_id) {
    if (!(user_id in this.userid_sigidx_mapping)) {
      const sig_index_obj = Object.keys(this.userid_sigidx_mapping);
      this.userid_sigidx_mapping[user_id] = sig_index_obj.length;
      this.signatures.push(new BBcSignature(para.KeyType.NOT_INITIALIZED));
    }
    return this.userid_sigidx_mapping[user_id];
  }

  add_signature(user_id, signature) {
    if (user_id in this.userid_sigidx_mapping) {
      const idx = this.userid_sigidx_mapping[cloneDeep(user_id)];
      this.signatures[idx] = cloneDeep(signature);
      return true;
    } else {
      return false;
    }
  }

  add_signature_using_index(index, signature) {
    this.signatures[index] = cloneDeep(signature);
  }

  async digest() {
    this.target_serialize = await this.get_digest_for_transaction_id();
    return this.target_serialize;
  }

  pack_cross_ref() {
    let binary_data = [];
    if (this.cross_ref !== null) {
      binary_data = binary_data.concat(Array.from(helper.hbo(1, 2)));
      const packed_data = this.cross_ref.pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    } else {
      binary_data = binary_data.concat(Array.from(helper.hbo(0, 2)));
    }
    return new Uint8Array(binary_data);
  }

  async set_transaction_id() {
    this.target_serialize = await this.get_digest_for_transaction_id();
    this.transaction_base_digest = await jscu.hash.compute(this.target_serialize, 'SHA-256');
    const id = await jscu.hash.compute(helper.concat(this.transaction_base_digest, this.pack_cross_ref()), 'SHA-256');
    this.transaction_id = id.slice(0, this.id_length);
    return this.transaction_id;
  }

  async get_digest_for_transaction_id() {

    let binary_data = [];

    binary_data = binary_data.concat(Array.from(helper.hbo(this.version, 4)));
    binary_data = binary_data.concat(this.timestamp.toArray('big', 8));
    binary_data = binary_data.concat(Array.from(helper.hbo(this.id_length, 2)));

    binary_data = binary_data.concat(Array.from(helper.hbo(this.events.length, 2)));
    for (let i = 0; i < this.events.length; i++) {
      const packed_data = this.events[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    binary_data = binary_data.concat(Array.from(helper.hbo(this.references.length, 2)));
    for (let i = 0; i < this.references.length; i++) {
      const packed_data = this.references[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    binary_data = binary_data.concat(Array.from(helper.hbo(this.relations.length, 2)));
    for (let i = 0; i < this.relations.length; i++) {
      const packed_data = this.relations[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    if (this.witness !== null) {
      binary_data = binary_data.concat(Array.from(helper.hbo(1, 2)));
      const packed_data = this.witness.pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    } else {
      binary_data = binary_data.concat(Array.from(helper.hbo(0, 2)));
    }

    return new Uint8Array(binary_data);
  }

  async pack() {

    let binary_data = [];

    binary_data = binary_data.concat(Array.from(helper.hbo(this.version, 4)));
    binary_data = binary_data.concat(this.timestamp.toArray('big', 8));
    binary_data = binary_data.concat(Array.from(helper.hbo(this.id_length, 2)));

    binary_data = binary_data.concat(Array.from(helper.hbo(this.events.length, 2)));
    for (let i = 0; i < this.events.length; i++) {
      const packed_data = this.events[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    binary_data = binary_data.concat(Array.from(helper.hbo(this.references.length, 2)));
    for (let i = 0; i < this.references.length; i++) {
      const packed_data = this.references[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    binary_data = binary_data.concat(Array.from(helper.hbo(this.relations.length, 2)));
    for (let i = 0; i < this.relations.length; i++) {
      const packed_data = this.relations[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    if (this.witness !== null) {
      binary_data = binary_data.concat(Array.from(helper.hbo(1, 2)));
      const packed_data = this.witness.pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    } else {
      binary_data = binary_data.concat(Array.from(helper.hbo(0, 2)));
    }

    if (this.cross_ref !== null) {
      binary_data = binary_data.concat(Array.from(helper.hbo(1, 2)));
      const packed_data = this.cross_ref.pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    } else {
      binary_data = binary_data.concat(Array.from(helper.hbo(0, 2)));
    }

    binary_data = binary_data.concat(Array.from(helper.hbo(this.signatures.length, 2)));
    for (let i = 0; i < this.signatures.length; i++) {
      const packed_data = this.signatures[i].pack();
      binary_data = binary_data.concat(Array.from(helper.hbo(packed_data.length, 4)));
      binary_data = binary_data.concat(Array.from(packed_data));
    }

    return new Uint8Array(binary_data);

  }


  async unpack(data) {

    let pos_s = 0;
    let pos_e = 4; // uint32
    this.version = helper.hboToInt32(data.slice(pos_s, pos_e));

    pos_s = pos_e;
    pos_e = pos_e + 8;
    this.timestamp = new BN(data.slice(pos_s, pos_e));

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    this.id_length = helper.hboToInt16(data.slice(pos_s, pos_e));

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_events = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_events > 0) {
      for (let i = 0; i < num_events; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16
        const event_length = helper.hboToInt32(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + event_length; // uint16
        const event_bin = data.slice(pos_s, pos_e);

        const event = new BBcEvent();
        event.unpack(event_bin);
        this.events.push(event);
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_reference = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_reference > 0) {
      for (let i = 0; i < num_reference; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16
        const reference_length = helper.hboToInt32(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + reference_length; // uint16
        const reference_bin = data.slice(pos_s, pos_e);
        const ref = new BBcReference(null, null, null, null, this.id_length);
        ref.unpack(reference_bin);
        this.references.push(ref);
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_relation = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_relation > 0) {
      for (let i = 0; i < num_relation; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16
        const relation_length = helper.hboToInt32(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + relation_length; // uint16
        const relation_bin = data.slice(pos_s, pos_e);
        const rtn = new BBcRelation( null, this.id_length, this.version);
        rtn.unpack(relation_bin);
        this.relations.push(rtn);
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_witness = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_witness > 0) {
      for (let i = 0; i < num_witness; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16

        const witness_length = helper.hboToInt32(data.slice(pos_s, pos_e));
        pos_s = pos_e;
        pos_e = pos_e + witness_length; // uint16

        const witness_bin = data.slice(pos_s, pos_e);
        const witness = new BBcWitness(this.id_length);
        witness.unpack(witness_bin);
        this.set_witness(witness);
        this.witness.set_sig_index();
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_crossref = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_crossref > 0) {
      for (let i = 0; i < num_crossref; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16
        const crossref_length = helper.hboToInt32(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + crossref_length; // uint16
        const crossref_bin = data.slice(pos_s, pos_e);

        this.cross_ref = new BBcCrossRef(new Uint8Array(0),new Uint8Array(0));
        this.cross_ref.unpack(crossref_bin);
      }
    }

    pos_s = pos_e;
    pos_e = pos_e + 2; // uint16
    const num_signature = helper.hboToInt16(data.slice(pos_s, pos_e));

    if (num_signature > 0) {
      for (let i = 0; i < num_signature; i++) {
        pos_s = pos_e;
        pos_e = pos_e + 4; // uint16
        const signature_length = helper.hboToInt32(data.slice(pos_s, pos_e));

        pos_s = pos_e;
        pos_e = pos_e + signature_length; // uint16
        const signature_bin = data.slice(pos_s, pos_e);

        const sig = new BBcSignature(0);
        await sig.unpack(signature_bin);
        this.signatures.push(sig);
      }
    }

    return true;
  }

  async sign(private_key, public_key, key_pair) {

    if (key_pair === null) {
      if (private_key.length !== 32 || public_key.length <= 32) {

        return null;
      }

      key_pair = new KeyPair();
      key_pair.set_key_pair(private_key, public_key);
      if (key_pair == null) {

        return null;
      }
    }

    const sig = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const s = await key_pair.sign(await this.digest());
    if (s === null) {
      return null;
    }

    await sig.add(s, await key_pair.public_key.jwk);
    return sig;
  }

}


