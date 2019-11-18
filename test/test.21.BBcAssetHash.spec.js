import chai from 'chai';
const expect = chai.expect;
import {getJscu} from '../src/env.js';
import {IDsLength} from '../src/bbcClass/idsLength';
import {BBcAssetHash} from '../src/bbcClass/BBcAssetHash';
import {getTestEnv} from './prepare.js';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcAssetHash`, () => {


  it('pack and unpack', async () => {
    console.log('***********************');
    console.log('Test for BBcAssetHash Class.');

    const assetId_1 = await jscu.random.getRandomBytes(32);
    const assetId_2 = await jscu.random.getRandomBytes(32);
    const assetId_3 = await jscu.random.getRandomBytes(32);
    const assetIds= [assetId_1, assetId_2, assetId_3];

    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);
    const assetHashBin = assetHash.pack();
    const assetHashUnpack = new BBcAssetHash([], 2.0, IDsLength);
    await assetHashUnpack.unpack(assetHashBin);

    expectUint8Array(assetHash.assetIds[0],assetHashUnpack.assetIds[0]);
    expectUint8Array(assetHash.assetIds[1],assetHashUnpack.assetIds[1]);
    expectUint8Array(assetHash.assetIds[2],assetHashUnpack.assetIds[2]);
  });

  it('dump', async () => {
    const assetId_1 = await jscu.random.getRandomBytes(32);
    const assetId_2 = await jscu.random.getRandomBytes(32);
    const assetId_3 = await jscu.random.getRandomBytes(32);
    const assetIds= [assetId_1, assetId_2, assetId_3];

    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);
    const dump = assetHash.dump();
    expect(dump).to.be.not.eq(null);
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
