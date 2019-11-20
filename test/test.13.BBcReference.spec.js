import chai from 'chai';
const expect = chai.expect;
import {BBcReference} from '../src/bbcClass/BBcReference';
import {getTestEnv} from './prepare.js';
import {getJscu} from '../src/env.js';
import * as helper from '../src/helper';
import {IDsLength} from '../src/bbcClass/idsLength';
import jseu from 'js-encoding-utils';
const jscu = getJscu();
const env = getTestEnv();
const envName = env.envName;

describe(`${envName}: Test BBcReference`, () => {

  it('pack and unpack', async () => {
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const transaction = await jscu.random.getRandomBytes(32);

    const reference = new BBcReference(assetGroupId, transaction, null, 3, 1.0, IDsLength);
    await reference.prepareReference(reference.refTransaction);
    const referenceUnpack = new BBcReference(null, null, null, null, 1.0, IDsLength);
    await referenceUnpack.prepareReference(referenceUnpack.refTransaction);

    const referenceBin = reference.pack();
    referenceUnpack.unpack(referenceBin);

    expectUint8Array(reference.assetGroupId, referenceUnpack.assetGroupId);
    expectUint8Array(reference.transactionId, referenceUnpack.transactionId);
    expect( reference.eventIndexInRef).to.be.eq(referenceUnpack.eventIndexInRef);

    for (let i = 0 ; i < reference.sigIndices.length; i++){
      expect( reference.sigIndices[i]).to.be.eq(referenceUnpack.sigIndices[i]);
    }
  });

  it('dump', async () => {

    const assetGroupId = await jscu.random.getRandomBytes(32);
    const transaction = await jscu.random.getRandomBytes(32);
    const reference = new BBcReference(assetGroupId, transaction, null, 3, 1.0, IDsLength);
    await reference.prepareReference(reference.refTransaction);
    const referenceUnpack = new BBcReference(null, null, null, null, 1.0, IDsLength);
    await referenceUnpack.prepareReference(referenceUnpack.refTransaction);

    const referenceBin = reference.pack();
    referenceUnpack.unpack(referenceBin);

    expectUint8Array(reference.assetGroupId, referenceUnpack.assetGroupId);
    expectUint8Array(reference.transactionId, referenceUnpack.transactionId);
    expect( reference.eventIndexInRef).to.be.eq(referenceUnpack.eventIndexInRef);

    for (let i = 0 ; i < reference.sigIndices.length; i++){
      expect( reference.sigIndices[i]).to.be.eq(referenceUnpack.sigIndices[i]);
    }
  });

  it('load reference hex string ', async () => {
    const referenceHexString = '2000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13200078a07ce9ee51c3454e9a71c5b0930a85ed091389970f0804b110204c5ec8bdfe0000020000000100';
    const referenceData = helper.fromHexString(referenceHexString);

    const referenceUnpack = new BBcReference(null, null, null, null, 1.0, IDsLength);
    await referenceUnpack.unpack(referenceData);

    expect(jseu.encoder.arrayBufferToHexString(referenceUnpack.assetGroupId)).to.be.eq( "c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13" );
    expect(jseu.encoder.arrayBufferToHexString(referenceUnpack.transactionId)).to.be.eq( "78a07ce9ee51c3454e9a71c5b0930a85ed091389970f0804b110204c5ec8bdfe" );

    expect( referenceUnpack.eventIndexInRef).to.be.eq(0);
    expect( referenceUnpack.sigIndices[0]).to.be.eq(0);
    expect( referenceUnpack.sigIndices[1]).to.be.eq(1);
  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}

