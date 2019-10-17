import chai from 'chai';
const expect = chai.expect;
import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import { Buffer } from 'buffer';
import * as helper from '../src/helper';

import {getTestEnv} from './prepare.js';
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcAssetHash`, () => {
  console.log('***********************');
  console.log('Test for BBcAssetHash Class.');

  it('pack and unpack', async () => {
    const idLength = 32;
    const assetId_1 = await jscu.random.getRandomBytes(32);
    const assetId_2 = await jscu.random.getRandomBytes(32);
    const assetId_3 = await jscu.random.getRandomBytes(32);
    const assetHash = new bbclib.BBcAssetHash(idLength);
    assetHash.addAssetId(assetId_1);
    assetHash.addAssetId(assetId_2);
    assetHash.addAssetId(assetId_3);
    const assetHashBin = assetHash.pack();
    const assetHashUnpack = new bbclib.BBcAssetHash(idLength);
    await assetHashUnpack.unpack(assetHashBin);

    // console.log("----------");
    // assetHash.showAsset();
    // console.log("----------");
    // assetHashUnpack.showAsset();

    expectUint8Array(assetHash.assetIds[0],assetHashUnpack.assetIds[0]);
    expectUint8Array(assetHash.assetIds[1],assetHashUnpack.assetIds[1]);
    expectUint8Array(assetHash.assetIds[2],assetHashUnpack.assetIds[2]);
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
