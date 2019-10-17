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

describe(`${envName}: Test BBcAssetRaw`, () => {
  console.log('***********************');
  console.log('Test for BBcAssetRaw Class.');

  it('pack and unpack', async () => {
    const idLength = 32;
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new bbclib.BBcAssetRaw(idLength);
    assetRaw.setAsset(assetId, assetBody);
    const assetRawBin = assetRaw.pack();

    const assetRawUnpack = new bbclib.BBcAssetRaw(idLength);
    await assetRawUnpack.unpack(assetRawBin);

    // console.log("----------");
    // assetRaw.showAsset();
    // console.log("----------");
    // assetRawUnpack.showAsset();

    expectUint8Array(assetRaw.assetId,assetRawUnpack.assetId);
    expectUint8Array(assetRaw.assetBody,assetRawUnpack.assetBody);
    expect( assetRaw.assetBodySize,assetRawUnpack.assetBodySize);
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
