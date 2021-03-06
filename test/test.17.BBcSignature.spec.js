import chai from 'chai';
const expect = chai.expect;
import {getJscu} from '../src/env.js';
import {KeyType} from '../src/parameter.js';
import { BBcSignature} from '../src/bbcClass/BBcSignature';
import { KeyPair} from '../src/bbcClass/KeyPair';
import {getTestEnv} from './prepare.js';
import * as helper from '../src/helper';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const envName = env.envName;

describe(`${envName}: Test BBcSignature`, () => {

  it('pack and unpack', async () => {
    const signature = new BBcSignature(KeyType.ECDSA_P256v1);
    signature.setSignature(new Uint8Array(8));
    const keyPair = new KeyPair();
    await keyPair.generate();

    const sig = new Uint8Array(8);
    await signature.addSignatureAndPublicKey(sig, await keyPair.exportPublicKey('jwk'));
    const signatureBin = await signature.pack();
    const signatureUnpack = new BBcSignature(KeyType.ECDSA_P256v1);
    await signatureUnpack.unpack(signatureBin);

    expectUint8Array(signature.signature, signatureUnpack.signature);
    expect(signature.keyType).to.equal(signatureUnpack.keyType);
    expectUint8Array(await signature.keypair.exportPublicKey('oct'), await signatureUnpack.keypair.exportPublicKey('oct'));
  });

  it('pack and unpack without publickey', async () => {
    const signature = new BBcSignature(KeyType.ECDSA_P256v1);
    signature.setSignature(new Uint8Array(8));
    const keyPair = new KeyPair();
    await keyPair.generate();

    const sig = new Uint8Array(8);
    await signature.addSignatureAndPublicKey(sig, null);
    const signatureBin = await signature.pack();
    const signatureUnpack = new BBcSignature(KeyType.ECDSA_P256v1);
    await signatureUnpack.unpack(signatureBin);

    expectUint8Array(signature.signature, signatureUnpack.signature);
    expect(signature.keyType).to.equal(signatureUnpack.keyType);
  });


  it('dumpJSON and loadJSON', async () => {
    const signature = new BBcSignature(KeyType.ECDSA_P256v1);
    signature.setSignature(new Uint8Array(8));
    const keyPair = new KeyPair();
    await keyPair.generate();

    const sig = new Uint8Array(8);
    await signature.addSignatureAndPublicKey(sig, await keyPair.exportPublicKey('jwk'));
    const signatureJSON = await signature.dumpJSON();

    const signatureUnpack = new BBcSignature(KeyType.ECDSA_P256v1);
    await signatureUnpack.loadJSON(signatureJSON);

    expectUint8Array(signature.signature, signatureUnpack.signature);
    expect(signature.keyType).to.equal(signatureUnpack.keyType);
    expectUint8Array(await signature.keypair.exportPublicKey('oct'), await signatureUnpack.keypair.exportPublicKey('oct'));
  });

  it('dump', async () => {

    const signature = new BBcSignature(KeyType.ECDSA_P256v1);
    signature.setSignature(new Uint8Array(8));
    const keyPair = new KeyPair();
    await keyPair.generate();

    const sig = new Uint8Array(8);
    await signature.addSignatureAndPublicKey(sig, await keyPair.exportPublicKey('jwt'));
    const dump = await signature.dump();
    expect(dump).to.be.not.eq(null);
  });

  it('serialize and deserialize with KeyType == 0', async () => {
    const signature = new BBcSignature(KeyType.NOT_INITIALIZED);
    const signatureBin = await signature.pack();
    const signatureUnpack = new BBcSignature(KeyType.NOT_INITIALIZED);
    await signatureUnpack.unpack(signatureBin);
    expect(signature.keyType).to.equal(signatureUnpack.keyType);
  });

  it('load signature hex string 1 ', async () => {
    const signatureHexString = '0200000008020000043750d6dcb679608cb533e93cfb22ec2df17e10a61c79f113bc1651d02caed51640121e53e4ec83effe9804df5f39521a28a1ba1f41d3198ffd54999fbcb60dd700020000e98b77e2f1bba5c65645aaa9aa7cc7b057240cc49f7e47c09a1a2a93b5cbf249d2c85fb4cb674670369a484d4e3c1e51680a22b8b95caaebdada752bf16e9675';
    const signatureData = helper.fromHexString(signatureHexString);
    const signatureUnpack = new BBcSignature(KeyType.ECDSA_P256v1);

    await signatureUnpack.unpack(signatureData);

    //signatureUnpack.showSig();
    expect(jseu.encoder.arrayBufferToHexString(signatureUnpack.signature)).to.be.eq( "e98b77e2f1bba5c65645aaa9aa7cc7b057240cc49f7e47c09a1a2a93b5cbf249d2c85fb4cb674670369a484d4e3c1e51680a22b8b95caaebdada752bf16e9675" );
    expect(jseu.encoder.arrayBufferToHexString(await signatureUnpack.keypair.exportPublicKey('oct'))).to.be.eq( "043750d6dcb679608cb533e93cfb22ec2df17e10a61c79f113bc1651d02caed51640121e53e4ec83effe9804df5f39521a28a1ba1f41d3198ffd54999fbcb60dd7" );

  });

  it('load signature hex string 2 ', async () => {
    const signatureHexString = '0200000008020000048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb0002000046c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c';
    const signatureData = helper.fromHexString(signatureHexString);
    const signatureUnpack = new BBcSignature(KeyType.ECDSA_P256v1);

    await signatureUnpack.unpack(signatureData);

    expect(jseu.encoder.arrayBufferToHexString(signatureUnpack.signature)).to.be.eq( "46c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c" );
    expect(jseu.encoder.arrayBufferToHexString(await signatureUnpack.keypair.exportPublicKey('oct'))).to.be.eq( "048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb" );

  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}