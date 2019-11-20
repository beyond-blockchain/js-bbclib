import chai from 'chai';
import {IDsLength} from '../src/bbcClass/idsLength';
import {BBcRelation} from '../src/bbcClass/BBcRelation';
const expect = chai.expect;
import {getJscu} from '../src/env.js';
import {getTestEnv} from './prepare.js';
import * as helper from '../src/helper';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const envName = env.envName;

describe(`${envName}: Test BBcRelation`, () => {

  it('BBcRelation pack and unpack for asset', async () => {
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const transactionId = await jscu.random.getRandomBytes(32);
    const userId = await jscu.random.getRandomBytes(32);
    const relation = new BBcRelation(assetGroupId, 2.0, IDsLength);
    relation.setAssetGroupId(new Uint8Array(8));
    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await relation.createAsset(userId, assetBody, assetFile);
    relation.createPointer(transactionId, assetGroupId);

    const relationBin = relation.pack();
    const relationUnpack = new BBcRelation(null, 2.0, IDsLength);
    relationUnpack.unpack(relationBin);

    expect( relation.version).to.be.eq(relationUnpack.version);
    expectUint8Array(relation.assetGroupId,relationUnpack.assetGroupId);

    expectUint8Array(relation.pointers[0].transactionId,relationUnpack.pointers[0].transactionId);
    expectUint8Array(relation.pointers[0].assetId,relationUnpack.pointers[0].assetId);

    expectUint8Array(relation.asset.userId,relationUnpack.asset.userId);
    expectUint8Array(relation.asset.nonce,relationUnpack.asset.nonce);
    expectUint8Array(relation.asset.assetFileDigest,relationUnpack.asset.assetFileDigest);
    expectUint8Array(relation.asset.assetBody,relationUnpack.asset.assetBody);

    expect( relation.asset.assetBodySize).to.be.eq(relationUnpack.asset.assetBodySize);
    expect( relation.asset.assetBodyType).to.be.eq(relationUnpack.asset.assetBodyType);
  });

  it('BBcRelation pack and unpack for asset raw', async () => {
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const relation = new BBcRelation(assetGroupId, 2.0, IDsLength);
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    relation.createAssetRaw(assetId, assetBody);
    const relationBin = relation.pack();
    const relationUnpack = new BBcRelation(assetGroupId, 2.0, IDsLength);
    relationUnpack.unpack(relationBin);

    expect(relation.version).to.be.eq(relationUnpack.version);
    expectUint8Array(relation.assetGroupId,relationUnpack.assetGroupId);
    expectUint8Array(relation.assetRaw.assetId,relationUnpack.assetRaw.assetId);
    expect(relation.assetRaw.assetBodySize,relationUnpack.assetRaw.assetBodySize);
    expectUint8Array(relation.assetRaw.assetBody,relationUnpack.assetRaw.assetBody);

  });

  it('BBcRelation pack and unpack for asset hash', async () => {
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const relation = new BBcRelation(assetGroupId, 2.0, IDsLength);
    const assetId0 = await jscu.random.getRandomBytes(32);
    const assetId1 = await jscu.random.getRandomBytes(32);
    relation.createAssetHash([assetId0, assetId1]);
    const relationBin = relation.pack();
    const relationUnpack = new BBcRelation(assetGroupId, 2.0, IDsLength);
    relationUnpack.unpack(relationBin);

    expect(relation.version).to.be.eq(relationUnpack.version);
    expectUint8Array(relation.assetGroupId,relationUnpack.assetGroupId);
    expectUint8Array(relation.assetHash.assetIds[0],relationUnpack.assetHash.assetIds[0]);
    expectUint8Array(relation.assetHash.assetIds[1],relationUnpack.assetHash.assetIds[1]);

  });

  it('load relation hex string ', async () => {
    const relationHexString = '2000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f130200460020003eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9010020008c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa824002000e15cf56122ef6612ccf43bb1077f322fe13291c93edab097fe7e99fe6f40285a00008000000020002ca34ba3da69f2af5ddd54fce95ce59df797eff797ed45477e284f03dcfb198c20005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b84765022000164ab9da6db8f0a877d81e9d1daea26fed15301cdf84a1c6c8ae3265c6f46013000000000000120074657374537472696e673132333435585858';
    const relationData = helper.fromHexString(relationHexString);
    const assetId = await jscu.random.getRandomBytes(32);

    const relationUnpack = new BBcRelation(assetId, 2.0, IDsLength);
    await relationUnpack.unpack(relationData);

    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.assetGroupId)).to.be.eq("c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.pointers[0].transactionId)).to.be.eq("3eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.pointers[0].assetId)).to.be.eq("8c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.pointers[1].transactionId)).to.be.eq("e15cf56122ef6612ccf43bb1077f322fe13291c93edab097fe7e99fe6f40285a");

    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.asset.assetId)).to.be.eq("2ca34ba3da69f2af5ddd54fce95ce59df797eff797ed45477e284f03dcfb198c");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.asset.userId)).to.be.eq("5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.asset.nonce)).to.be.eq("164ab9da6db8f0a877d81e9d1daea26fed15301cdf84a1c6c8ae3265c6f46013");
    expect( jseu.encoder.arrayBufferToHexString(relationUnpack.asset.assetBody)).to.be.eq("74657374537472696e673132333435585858");

    expect( relationUnpack.asset.assetBodySize).to.be.eq(18);
    expect( relationUnpack.asset.assetBodyType).to.be.eq(0);
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
