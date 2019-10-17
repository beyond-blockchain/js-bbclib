import chai from 'chai';

const expect = chai.expect;


import {getTestEnv} from './prepare.js';

const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test KeyPair`, () => {

  it('sign and verify', async () => {
    console.log('***********************');
    console.log('Test for KeyPair Class.');

    const keypair = new bbclib.KeyPair();
    const ret = await keypair.generate();
    expect(keypair.publicKey).to.not.equal(null);
    expect(keypair.privateKey).to.not.equal(null);

    const msg = new Uint8Array(32);
    for (let i = 0; i < 32; i++) msg[i] = 0xFF & i;

    const sig = await keypair.sign(msg);
    const result = await keypair.verify(msg, sig);
    expect(ret).to.be.eq(result);

  });
});
