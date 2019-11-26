import chai from 'chai';
import sampleKey  from './sampleKey.js';
import {KeyPair} from '../src/bbcClass/KeyPair.js';
const expect = chai.expect;

import {getTestEnv} from './prepare.js';

const env = getTestEnv();
const envName = env.envName;

const bits = ['1024', '2048'];

describe(`${envName}: Test KeyPair`, () => {

  it('sign and verify', async () => {
    const keypair = new KeyPair();
    await keypair.generate();
    expect(keypair.publicKey).to.not.equal(null);
    expect(keypair.privateKey).to.not.equal(null);

    const msg = new Uint8Array(32);
    for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;

    const sig = await keypair.sign(msg);
    expect(sig).to.not.eq(null);

    const result = await keypair.verify(msg, sig);
    expect(result).to.be.eq(true);

  });

  it('dumpJSON and loadJSON', async () => {
    const keypair = new KeyPair();
    const keypairUnpack = new KeyPair();
    await keypair.generate();
    expect(keypair.publicKey).to.not.equal(null);
    expect(keypair.privateKey).to.not.equal(null);

    const keypairJSON = await keypair.dumpJSON();
    keypairUnpack.loadJSON(keypairJSON);

    const jwk_public_key1 =  await keypairUnpack.exportPublicKey('jwk');
    const jwk_private_key1 =  await keypairUnpack.exportPrivateKey('jwk');
    const jwk_public_key2 =  await keypair.exportPublicKey('jwk');
    const jwk_private_key2 =  await keypair.exportPrivateKey('jwk');
    expect(jwk_public_key1).to.be.not.eq(jwk_public_key2);
    expect(jwk_private_key1).to.be.not.eq(jwk_private_key2);

  });

  it('setKeyPair for pem format', async () => {
    const array = await Promise.all(bits.map(async (bitLen) => {
      const keypair = new KeyPair();
      const ret = keypair.setKeyPair('pem', await sampleKey[bitLen].privateKey.pem, await sampleKey[bitLen].publicKey.pem);
      expect(ret).to.be.eq(true);

      const msg = new Uint8Array(32);
      for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;

      const sig = await keypair.sign(msg);

      expect(sig).to.not.eq(null);

      const result = await keypair.verify(msg, sig);
      expect(result).to.be.eq(true);

    }));
  });

  it('setKeyPair for jwk format', async () => {
    const array = await Promise.all(bits.map(async (bitLen) => {
      const keypair = new KeyPair();
      if(sampleKey[bitLen].privateKey.jwk == null || sampleKey[bitLen].publicKey.jwk == null){
        return '';
      }
      const ret = keypair.setKeyPair('jwk', sampleKey[bitLen].privateKey.jwk, sampleKey[bitLen].publicKey.jwk);
      expect(ret).to.be.eq(true);

      const msg = new Uint8Array(32);
      for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;

      const sig = await keypair.sign(msg);
      expect(sig).to.not.eq(null);

      const result = await keypair.verify(msg, sig);
      expect(result).to.be.eq(true);

    }));
  });

  it('export keypair', async () => {
    const array = await Promise.all(bits.map(async (bitLen) => {
      const keypair = new KeyPair();
      if(sampleKey[bitLen].privateKey.jwk == null || sampleKey[bitLen].publicKey.jwk == null){
        return '';
      }
      const ret = keypair.setKeyPair('jwk', sampleKey[bitLen].privateKey.jwk, sampleKey[bitLen].publicKey.jwk);
      expect(ret).to.be.eq(true);

      const jwk_public_key =  await keypair.exportPublicKey('jwk');
      const jwk_private_key =  await keypair.exportPrivateKey('jwk');
      expect(jwk_public_key).to.be.not.eq(null);
      expect(jwk_private_key).to.be.not.eq(null);

    }));
  });

});
