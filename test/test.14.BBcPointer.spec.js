import chai from 'chai';
const expect = chai.expect;
import jscu from 'js-crypto-utils';
import { BBcPointer } from '../src/bbcClass/BBcPointer';

import {getTestEnv} from './prepare.js';
import * as helper from '../src/helper';
import jseu from 'js-encoding-utils';
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcPointer`, () => {

  it('pack and unpack', async () => {
    console.log('***********************');
    console.log('Test for BBcPointer Class');

    const transactionId = await jscu.random.getRandomBytes(32);
    const assetId = await jscu.random.getRandomBytes(32);

    const pointer = new BBcPointer(transactionId, assetId, 32);

    const pointerBin = pointer.pack();
    const pointerUnpack = new BBcPointer(null, null, 32);
    pointerUnpack.unpack(pointerBin);

    expectUint8Array(pointer.transactionId,pointerUnpack.transactionId);
    expect(pointer.assetIdExistence,pointerUnpack.assetIdExistence);
    expectUint8Array(pointer.assetId,pointerUnpack.assetId);

  });

  it('pack and unpack without asset id', async () => {

    const transactionId = await jscu.random.getRandomBytes(32);

    const pointer = new BBcPointer(transactionId, null, 32);

    const pointerBin = pointer.pack();
    const pointerUnpack = new BBcPointer(null, null, 32);
    pointerUnpack.unpack(pointerBin);

    expectUint8Array(pointer.transactionId,pointerUnpack.transactionId);
    expect(pointer.assetIdExistence,pointerUnpack.assetIdExistence);

  });

  it('dump', async () => {

    const transactionId = await jscu.random.getRandomBytes(32);
    const assetId = await jscu.random.getRandomBytes(32);

    const pointer = new BBcPointer(transactionId, assetId, 32);
    const dump = pointer.dump();

    expect(dump).to.be.not.eq(null);

  });

  it('load pointer hex string ', async () => {
    const pointerHexString = '20003eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9010020008c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8';
    const pointerData = helper.fromHexString(pointerHexString);

    const pointerUnpack = new BBcPointer(null, null, 32);
    await pointerUnpack.unpack(pointerData);

    expect(jseu.encoder.arrayBufferToHexString(pointerUnpack.assetId)).to.be.eq( "8c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8" );
    expect(jseu.encoder.arrayBufferToHexString(pointerUnpack.transactionId)).to.be.eq( "3eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9" );

  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
