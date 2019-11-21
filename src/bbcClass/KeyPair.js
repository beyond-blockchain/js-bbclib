import {getJscu} from '../env.js';
import {KeyType} from '../parameter';
import jseu from "js-encoding-utils";
const jscu = getJscu();
export class KeyPair{
  /**
   *
   * constructor
   * @param {Number} _keyType
   */
  constructor(_keyType=KeyType.ECDSA_P256v1) {
    this.keyType = _keyType;
    this.privateKeyObj = null;
    this.publicKeyObj = null;
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
    let dump = `${intent}--KeyPair--\n`;
    dump += `${intent}keyType: ${this.keyType}\n`;
    if(this.privateKeyObj != null){
      dump += `${intent}privateKey: ${jseu.encoder.arrayBufferToHexString(this.exportPrivateKey('oct'))}\n`;
    }
    if(this.publicKeyObj != null){
      dump += `${intent}publicKey: ${jseu.encoder.arrayBufferToHexString(this.exportPublicKey('oct'))}\n`;
    }

    dump += `${intent}--end KeyPair--`;
    return dump;
  }

  /**
   *
   * get dump json data
   * @return {Object}
   */
  dumpJSON() {
    let privateKey;
    let publicKey;
    if(this.privateKeyObj != null){
      privateKey = jseu.encoder.arrayBufferToHexString(this.exportPrivateKey('jwk'));
    }
    if(this.publicKeyObj != null){
      publicKey = jseu.encoder.arrayBufferToHexString(this.exportPublicKey('jwk'));
    }
    const jsonData = {
      keyType: this.keyType,
      privateKey,
      publicKey
    };
    return jsonData;
  }

  /**
   *
   * load json data
   * @param {Object} _jsonData
   * @return {KeyPair}
   */
  loadJSON(_jsonData) {
    this.version = _jsonData.version;
    this.idsLength = _jsonData.idsLength;
    this.keyType = _jsonData.keyType;
    if(_jsonData.privateKeyObj != null){
      this.privateKeyObj = new jscu.Key('jwk', _jsonData.privateKey);
    }
    if(_jsonData.publicKeyObj != null){
      this.publicKeyObj = new jscu.Key('jwk', _jsonData.publicKey);
    }

    return this;
  }

  /**
   *
   * generate key
   * @return {Boolean}
   */
  async generate() {
    const keys = await jscu.pkc.generateKey('EC', {namedCurve: 'P-256'});
    this.setKeyPair('jwk', await keys.privateKey.export(), await keys.publicKey.export());
    return true;
  }

  /**
   *
   * set key pair
   * @param {String} _type
   * @param {Uint8Array|Object} _privateKey
   * @param {Uint8Array|Object} _publicKey
   * @param {Object} _options
   * @return {Boolean}
   */
  setKeyPair(_type, _privateKey, _publicKey, _options={namedCurve: 'P-256'}) {
    if (_type === 'jwk' ||  _type === 'pem' || _type === 'der'){
      if (_privateKey != null) {
        this.privateKeyObj = new jscu.Key(_type, _privateKey);
      }
      if (_publicKey != null) {
        this.publicKeyObj = new jscu.Key(_type, _publicKey);
      }
      return true;
    }else if (_type === 'oct'){
      if (_privateKey != null) {
        this.privateKeyObj = new jscu.Key(_type, _privateKey, _options);
      }
      if (_publicKey != null) {
        this.publicKeyObj = new jscu.Key(_type, _publicKey, _options);
      }
    }
    return false;
  }

  /**
   *
   * create public key from private key
   */
  async createPublicKeyFromPrivateKey(){
    if (this.privateKeyObj !== null){
      this.publicKeyObj =  new jscu.Key('pem', await this.privateKeyObj.export('pem',  {outputPublic: true}));
    }
  }

  /**
   *
   * export private key
   * @param {String} _type
   * @return {Uint8Array}
   */
  async exportPrivateKey(_type){
    if (_type === 'jwk' ||  _type === 'pem' || _type === 'der' || _type=== 'oct'){
      return this.privateKeyObj.export(_type);
    }
  }

  /**
   *
   * export public key
   * @param {String} _type
   * @return {Uint8Array}
   */
  async exportPublicKey(_type){
    if (_type === 'jwk' ||  _type === 'pem' || _type === 'der' || _type=== 'oct'){
      return this.publicKeyObj.export(_type);
    }
  }

  /**
   *
   * sign
   * @param {Uint8Array} _msg
   * @return {Uint8Array}
   */
  async sign(_msg) {
    return jscu.pkc.sign(_msg, this.privateKeyObj, 'SHA-256');
  }

  /**
   *
   * verify
   * @param {Uint8Array} _msg
   * @param {Uint8Array} _sig
   * @return {Uint8Array}
   */
  async verify(_msg, _sig) {
    return jscu.pkc.verify(_msg, _sig, this.publicKeyObj, 'SHA-256');
  }

}
