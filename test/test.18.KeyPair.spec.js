import chai from 'chai';
import sampleKey  from './sampleKey.js';

const expect = chai.expect;

import {getTestEnv} from './prepare.js';
import jseu from "js-encoding-utils";

const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

const bits = ['2048'];

describe(`${envName}: Test KeyPair`, () => {

  // it('sign and verify', async () => {
  //   console.log('***********************');
  //   console.log('Test for KeyPair Class.');
  //
  //   const keypair = new bbclib.KeyPair();
  //   const ret = await keypair.generate();
  //   expect(keypair.publicKey).to.not.equal(null);
  //   expect(keypair.privateKey).to.not.equal(null);
  //
  //   console.log(await keypair.exportPrivateKey('pem'));
  //   console.log(await keypair.exportPublicKey('pem'));
  //
  //
  //   const msg = new Uint8Array(32);
  //   for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;
  //
  //   const sig = await keypair.sign(msg);
  //   expect(sig).to.not.eq(null);
  //
  //   const result = await keypair.verify(msg, sig);
  //   expect(result).to.be.eq(true);
  //
  // });

  it('setKeyPair for pem format', async () => {
    const array = await Promise.all(bits.map(async (bitLen) => {
      const keypair = new bbclib.KeyPair();
      const ret = keypair.setKeyPair('pem', await sampleKey[bitLen].privateKey.pem, await sampleKey[bitLen].publicKey.pem);expect(ret).to.be.eq(true);

      const msg = new Uint8Array(32);
      for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;

      const sig = await keypair.sign(msg);

      expect(sig).to.not.eq(null);

      const result = await keypair.verify(msg, sig);
      expect(result).to.be.eq(true);

    }));
  });

  // it('setKeyPair for jwk format', async () => {
  //   const array = await Promise.all(bits.map(async (bitLen) => {
  //     const keypair = new bbclib.KeyPair();
  //     const ret = keypair.setKeyPair('jwk', sampleKey[bitLen].privateKey.jwk, sampleKey[bitLen].publicKey.jwk);
  //     expect(ret).to.be.eq(true);
  //
  //     const sig = await keypair.sign(msg);
  //     expect(sig).to.not.eq(null);
  //
  //     const result = await keypair.verify(msg, sig);
  //     expect(result).to.be.eq(true);
  //
  //   }));
  // });

});
