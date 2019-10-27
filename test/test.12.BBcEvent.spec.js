import chai from 'chai';
const expect = chai.expect;
import jscu from 'js-crypto-utils';
import { Buffer } from 'buffer';

import {getTestEnv} from './prepare.js';
import jseu from 'js-encoding-utils';
import * as helper from '../src/helper';
import {idsLength} from '../src/bbcClass/idsLength';
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcEvent`, () => {

  it('pack and unpack', async () => {
    console.log('***********************');
    console.log('Test for BBcEvent Class.');

    const assetGroupId = await jscu.random.getRandomBytes(32);
    const event = new bbclib.BBcEvent(assetGroupId,idsLength);
    const userId = await jscu.random.getRandomBytes(32);
    const asset = new bbclib.BBcAsset(userId, idsLength);
    await asset.setRandomNonce();
    
    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }

    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }

    await asset.addAsset(assetFile, assetBody);

    event.addAsset(asset);
    event.addAssetGroupId(assetGroupId);
    event.addMandatoryApprover(userId);

    const eventBin = event.pack();

    const eventUnpack = new bbclib.BBcEvent(assetGroupId,idsLength);
    eventUnpack.unpack(eventBin);

    //event.showEvent();
    //eventUnpack.showEvent();

    expectUint8Array(event.assetGroupId,eventUnpack.assetGroupId);
    if (event.referenceIndices.length > 0) {
      for (let i = 0; i < event.referenceIndices.length; i++) {
        expectUint8Array(event.referenceIndices[i], eventUnpack.referenceIndices[i]);
      }
    }
    if (event.mandatoryApprovers.length > 0){
      for (let i = 0; i < event.mandatoryApprovers.length; i++ ) {
        expectUint8Array(event.mandatoryApprovers[i], eventUnpack.mandatoryApprovers[i]);
      }
    }
    expect(event.optionApproverNumNumerator).to.be.eq(eventUnpack.optionApproverNumNumerator);
    expect(event.optionApproverNumDenominator).to.be.eq(eventUnpack.optionApproverNumDenominator);
    if (event.optionApprovers.length > 0){
      for (let i = 0; i < event.optionApprovers.length; i++ ){
        expectUint8Array(event.optionApprovers[i], eventUnpack.optionApprovers[i]);
      }
    }

    expectUint8Array(event.asset.assetId,eventUnpack.asset.assetId);
    expectUint8Array(event.asset.userId,eventUnpack.asset.userId);
    expectUint8Array(event.asset.nonce,eventUnpack.asset.nonce);
    expectUint8Array(event.asset.assetFileDigest,eventUnpack.asset.assetFileDigest);
    expectUint8Array(event.asset.assetBody,eventUnpack.asset.assetBody);

    expect(event.asset.assetFileSize).to.be.eq(eventUnpack.asset.assetFileSize);
    expect(event.asset.assetBodyType).to.be.eq(eventUnpack.asset.assetBodyType);
    expect(event.asset.assetBodySize).to.be.eq(eventUnpack.asset.assetBodySize);

  });

  it('load event hex string ', async () => {
    const eventHexString = '2000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13020001000200020020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b84765022000b7e70c482105bbbe7182f25e18cc7c363f55420f5e2b9519f598c8d436251c2c0100020020008c10c27d57f94f12ee2aa9599fcefa050626346fcf46276c2c8de6ca76c4fa0e20004d99a455dd570aecaa30672f38c63601788f8f79e5215bb0a80665a00741bf8e8000000020002ce7f058d4ed412453ff193ff2dc453a55cc2e4e3a7a1bd7e3dcbb7913e12e2620005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b847650220008068d7c1f994f17830b8f477aa25c1147c8b09f96b94613a2a6bdd8b8c37dbee000000000000120074657374537472696e673132333435585858';
    const eventData = helper.fromHexString(eventHexString);
    const eventUnpack = new bbclib.BBcEvent(new Uint8Array(0), idsLength);
    eventUnpack.unpack(eventData);

    //eventUnpack.showEvent();

    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.assetGroupId)).to.be.eq( "c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13" );
    expect(eventUnpack.referenceIndices[0]).to.be.eq( 1 );
    expect(eventUnpack.referenceIndices[1]).to.be.eq( 2 );

    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.mandatoryApprovers[0])).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.mandatoryApprovers[1])).to.be.eq( "b7e70c482105bbbe7182f25e18cc7c363f55420f5e2b9519f598c8d436251c2c" );

    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.optionApprovers[0])).to.be.eq( "8c10c27d57f94f12ee2aa9599fcefa050626346fcf46276c2c8de6ca76c4fa0e" );
    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.optionApprovers[1])).to.be.eq( "4d99a455dd570aecaa30672f38c63601788f8f79e5215bb0a80665a00741bf8e" );

    expect(eventUnpack.optionApproverNumNumerator).to.be.eq( 1 );
    expect(eventUnpack.optionApproverNumDenominator).to.be.eq( 2 );

    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.asset.assetId)).to.be.eq( "2ce7f058d4ed412453ff193ff2dc453a55cc2e4e3a7a1bd7e3dcbb7913e12e26" );
    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.asset.userId)).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.asset.nonce)).to.be.eq( "8068d7c1f994f17830b8f477aa25c1147c8b09f96b94613a2a6bdd8b8c37dbee" );
    expect(eventUnpack.asset.assetFileSize).to.be.eq( 0 );
    expect(eventUnpack.asset.assetBodySize).to.be.eq( 18 );
    expect(eventUnpack.asset.assetBodyType).to.be.eq( 0 );

    expect(jseu.encoder.arrayBufferToHexString(eventUnpack.asset.assetBody)).to.be.eq( "74657374537472696e673132333435585858" );

  });


});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
