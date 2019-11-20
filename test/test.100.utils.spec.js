import chai from 'chai';
import {getTestEnv} from './prepare.js';
import {getJscu} from '../src/env.js';
import * as helper from '../src/helper';
import {IDsLength} from '../src/bbcClass/idsLength';
import jseu from "js-encoding-utils";
const jscu = getJscu();
const expect = chai.expect;
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBclib`, () => {
  it('makeTransaction with event and relation', async () => {
    const keypair = bbclib.createKeypair();
    await keypair.generate();
    // const transaction = bbclib.makeTransaction(_relationNum, _eventNum, _witness, _version=2.0, _idsLength=IDsLength, _assetGroupId=new Uint8Array(0), _userId=new Uint8Array(0));
    const userId = await jscu.random.getRandomBytes(32);
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(32);
    const assetFile = await jscu.random.getRandomBytes(32);
    const transaction = await bbclib.makeTransaction(1, 1, true, 2.0, IDsLength);
    transaction.events[0].setAssetGroupId(assetGroupId);
    await transaction.events[0].createAsset(userId, assetBody, assetFile);
    transaction.events[0].addMandatoryApprover(userId);
    transaction.relations[0].setAssetGroupId(assetGroupId);
    await transaction.relations[0].createAsset(userId, assetBody, assetFile);
    transaction.witness.addWitness(userId);
    await transaction.sign(userId, keypair);
    transaction.setTransactionId();

    const transactionBin = await transaction.pack();
    const transactionUnpack = await bbclib.loadTransaction(transactionBin , 2.0, IDsLength);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));

    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(), transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      expectUint8Array(transaction.relations[i].pack(), transactionUnpack.relations[i].pack());
    }
    expectUint8Array(transaction.witness.pack(), transactionUnpack.witness.pack());
    expectUint8Array(await transaction.pack(), await transactionUnpack.pack());
  });

  it('makeTransaction with AssetRaw and AssetHash in relation ', async () => {
    const keypair = bbclib.createKeypair();
    await keypair.generate();

    const transactionId = await jscu.random.getRandomBytes(32);
    const userId = await jscu.random.getRandomBytes(32);
    const assetId = await jscu.random.getRandomBytes(32);
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(32);
    const assetFile = await jscu.random.getRandomBytes(32);
    const transaction = await bbclib.makeTransaction(1, 4, true, 2.0, IDsLength);
    transaction.events[0].setAssetGroupId(assetGroupId);
    await transaction.events[0].createAsset(userId, assetBody, assetFile);
    transaction.events[0].addMandatoryApprover(userId);
    transaction.relations[0].setAssetGroupId(assetGroupId);
    await transaction.relations[0].createAsset(userId, assetBody, assetFile);
    transaction.relations[1].setAssetGroupId(assetGroupId);
    await transaction.relations[1].createPointer(transactionId, assetId);
    transaction.relations[2].setAssetGroupId(assetGroupId);
    transaction.relations[2].createAssetRaw(assetId, assetBody);
    transaction.relations[3].setAssetGroupId(assetGroupId);
    transaction.relations[3].createAssetHash([assetId]);
    transaction.witness.addWitness(userId);
    await transaction.sign(userId, keypair);
    transaction.setTransactionId();

    const transactionBin = await transaction.pack();
    const transactionUnpack = await bbclib.loadTransaction(transactionBin , 2.0, IDsLength);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));

    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(), transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      expectUint8Array(transaction.relations[i].pack(), transactionUnpack.relations[i].pack());
    }
    expectUint8Array(transaction.witness.pack(), transactionUnpack.witness.pack());
    expectUint8Array(await transaction.pack(), await transactionUnpack.pack());
  });


});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
