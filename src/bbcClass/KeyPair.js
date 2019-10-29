import jscu from 'js-crypto-utils';

export class KeyPair{
  constructor() {
    this.privateKeyObj = null;
    this.publicKeyObj = null;
  }

  async generate() {
    const keys = await jscu.pkc.generateKey('EC', {namedCurve: 'P-256'});
    this.setKeyPair('jwk', await keys.privateKey.export(), await keys.publicKey.export());
    return true;
  }

  setKeyPair(type, privateKey, publicKey, options={namedCurve: 'P-256'}) {
    if (type === 'jwk' ||  type === 'pem' || type === 'der'){
      if (privateKey != null) {
        this.privateKeyObj = new jscu.Key(type, privateKey);
      }
      if (publicKey != null) {
        this.publicKeyObj = new jscu.Key(type, publicKey);
      }
      return true;
    }else if (type === 'oct'){
      if (privateKey != null) {
        this.privateKeyObj = new jscu.Key(type, privateKey, options);
      }
      if (publicKey != null) {
        this.publicKeyObj = new jscu.Key(type, publicKey, options);
      }
    }
    return false;
  }

  async createPublicKeyFromPrivateKey(){
    this.publicKeyObj =  new jscu.Key('pem', await this.privateKeyObj.export('pem',  {outputPublic: true}));
  }

  async exportPrivateKey(type){
    if (type === 'jwk' ||  type === 'pem' || type === 'der' || type=== 'oct'){
      return this.privateKeyObj.export(type);
    }
  }

  async exportPublicKey(type){
    if (type === 'jwk' ||  type === 'pem' || type === 'der' || type=== 'oct'){
      return this.publicKeyObj.export(type);
    }
  }

  async sign(msg) {
    return jscu.pkc.sign(msg, this.privateKeyObj, 'SHA-256');
  }

  async verify(msg, sig) {
    return jscu.pkc.verify(msg, sig, this.publicKeyObj, 'SHA-256');
  }

}
