import chai from 'chai';
const expect = chai.expect;
import {getJscu} from '../src/env.js';
import * as helper from '../src/helper';
import {BBcAsset} from '../src/bbcClass/BBcAsset';
import {getTestEnv} from './prepare.js';
import {IDsLength} from '../src/bbcClass/idsLength';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcAsset`, () => {

  it('pack and unpack with file and body', async () => {
    console.log('***********************');
    console.log('Test for BBcAsset Class.');

    const userId = await jscu.random.getRandomBytes(32);
    const asset = await helper.createAsset(userId);
    const assetBin = await asset.pack();
    const assetUnpack = new bbclib.BBcAsset(userId, 1.0, IDsLength);
    await assetUnpack.unpack(assetBin);

    expectUint8Array(asset.assetId,assetUnpack.assetId);
    expectUint8Array(asset.userId,assetUnpack.userId);
    expectUint8Array(asset.nonce,assetUnpack.nonce);
    expectUint8Array(asset.assetFileDigest,assetUnpack.assetFileDigest);
    expectUint8Array(asset.assetBody,assetUnpack.assetBody);
    expect( asset.assetFileSize).to.be.eq(assetUnpack.assetFileSize);
    expect( asset.assetBodySize).to.be.eq(assetUnpack.assetBodySize);
    expect( asset.assetBodyType).to.be.eq(assetUnpack.assetBodyType);

  });

  it('dump', async () => {
    const userId = await jscu.random.getRandomBytes(32);
    const asset = await helper.createAsset(userId);
    const dump = asset.dump();
    expect(dump).to.be.not.eq(null);
  });

  it('serialize and deserialize without file', async () => {
    const userId = await jscu.random.getRandomBytes(32);
    const asset = await helper.createAssetWithoutFile(userId);
    const assetBin = await asset.pack();
    const assetUnpack = new BBcAsset(userId,1.0, IDsLength);
    await assetUnpack.unpack(assetBin);

    expectUint8Array(asset.assetId,assetUnpack.assetId);
    expectUint8Array(asset.userId,assetUnpack.userId);
    expectUint8Array(asset.nonce,assetUnpack.nonce);
    expectUint8Array(asset.assetFileDigest,assetUnpack.assetFileDigest);
    expectUint8Array(asset.assetBody,assetUnpack.assetBody);
    expect( asset.assetFileSize).to.be.eq(assetUnpack.assetFileSize);
    expect( asset.assetBodySize).to.be.eq(assetUnpack.assetBodySize);
    expect( asset.assetBodyType).to.be.eq(assetUnpack.assetBodyType);

  });

  it('get digest ', async () => {
    const userId = new Uint8Array(8);
    for (let i = 0; i < 1; i++) {
      userId[i] = 0xFF & 0x00;
    }
    userId[0] = 0x00;

    const assetBody = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      assetBody[i] = 0xFF & 0x00;
    }
    assetBody[0] = 0x00;

    const asset = new bbclib.BBcAsset(userId, 1.0, IDsLength);

    const nonce = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      nonce[i] = 0xFF & 0x00;
    }

    asset.setNonce(nonce);

    await asset.setAssetBody(assetBody);
    const digest = await asset.digest();

    expect(jseu.encoder.arrayBufferToHexString(digest)).to.be.eq('5feda19fb60af18c8c1d0e4af7d613726ec71cc9f6067c924ce2d081a61aa6d1');
  });

  it('load asset hex string ', async () => {
    const assetHexString = '200036335a38ca83d7594d96d00f50288644cc180c47d870eae291185bf8a111dbba20005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b84765022000a3bc8fa47aed0ab75817e516a52a17df27c1233c0eab5a97bc1049b8285481b7000000000000120074657374537472696e673132333435585858';
    const assetData = helper.fromHexString(assetHexString);
    const userId = await jscu.random.getRandomBytes(32);
    const assetUnpack = new BBcAsset(userId, 1.0, IDsLength);
    await assetUnpack.unpack(assetData);

    const digest = await assetUnpack.digest();

    expect(jseu.encoder.arrayBufferToHexString(digest)).to.be.eq( "36335a38ca83d7594d96d00f50288644cc180c47d870eae291185bf8a111dbba" );
    expect(jseu.encoder.arrayBufferToHexString(assetUnpack.assetId)).to.be.eq( "36335a38ca83d7594d96d00f50288644cc180c47d870eae291185bf8a111dbba" );
    expect(jseu.encoder.arrayBufferToHexString(assetUnpack.userId)).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect(jseu.encoder.arrayBufferToHexString(assetUnpack.nonce)).to.be.eq( "a3bc8fa47aed0ab75817e516a52a17df27c1233c0eab5a97bc1049b8285481b7" );
    expect(jseu.encoder.arrayBufferToHexString(assetUnpack.assetFileDigest)).to.be.eq( "" );
    expect(jseu.encoder.arrayBufferToHexString(assetUnpack.assetBody)).to.be.eq( "74657374537472696e673132333435585858" );

    expect( assetUnpack.assetFileSize).to.be.eq(0);
    expect( assetUnpack.assetBodySize).to.be.eq(18);
    expect( assetUnpack.assetBodyType).to.be.eq(0);

  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
