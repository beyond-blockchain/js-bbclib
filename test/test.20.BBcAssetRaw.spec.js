import chai from 'chai';
const expect = chai.expect;
import {getJscu} from '../src/env.js';
import {IDsLength} from '../src/bbcClass/idsLength';
import {BBcAssetRaw} from '../src/bbcClass/BBcAssetRaw';
import {getTestEnv} from './prepare.js';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const envName = env.envName;

describe(`${envName}: Test BBcAssetRaw`, () => {

  it('pack and unpack', async () => {
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    assetRaw.setAsset(assetId, assetBody);
    const assetRawBin = assetRaw.pack();

    const assetRawUnpack = new BBcAssetRaw(null, null, 2.0, IDsLength);
    await assetRawUnpack.unpack(assetRawBin);

    expectUint8Array(assetRaw.assetId,assetRawUnpack.assetId);
    expectUint8Array(assetRaw.assetBody,assetRawUnpack.assetBody);
    expect( assetRaw.assetBodySize,assetRawUnpack.assetBodySize);
  });

  it('dumpJSON and loadJSON', async () => {
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    assetRaw.setAsset(assetId, assetBody);
    const assetRawJSON = assetRaw.dumpJSON();

    const assetRawUnpack = new BBcAssetRaw(null, null, 2.0, IDsLength);
    await assetRawUnpack.loadJSON(assetRawJSON);

    expectUint8Array(assetRaw.assetId,assetRawUnpack.assetId);
    expectUint8Array(assetRaw.assetBody,assetRawUnpack.assetBody);
    expect( assetRaw.assetBodySize,assetRawUnpack.assetBodySize);
  });

  it('dump', async () => {
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    assetRaw.setAsset(assetId, assetBody);
    const dump = assetRaw.dump();

    expect(dump).to.be.not.eq(null);
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}