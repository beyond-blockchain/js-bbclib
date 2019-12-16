import chai from 'chai';
import {getTestEnv} from './prepare.js';
import {getJscu} from '../src/env.js';
import {IDsLength} from '../src/bbcClass/idsLength';
import jseu from 'js-encoding-utils';
import * as data from './sample';
const jscu = getJscu();
const expect = chai.expect;
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;


describe(`${envName}: Test BBclib`, () => {
  it('makeTransaction with event and relation for binary', async () => {
    const keypair = bbclib.createKeypair();
    await keypair.generate();
    const userId = await jscu.random.getRandomBytes(32);
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(32);
    const assetFile = await jscu.random.getRandomBytes(32);
    const transaction = await bbclib.makeTransaction(1, 1, true, 2.0, IDsLength);
    transaction.events[0].setAssetGroup(assetGroupId);
    await transaction.events[0].createAsset(userId, assetBody, assetFile);
    transaction.events[0].addMandatoryApprover(userId);
    transaction.relations[0].setAssetGroup(assetGroupId);
    await transaction.relations[0].createAsset(userId, assetBody, assetFile);
    transaction.witness.addWitness(userId);
    await transaction.sign(userId, keypair);

    const transactionBin = await transaction.pack();
    const transactionUnpack = await bbclib.loadBinaryTransaction(transactionBin , 2.0, IDsLength);

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
    await transaction.events[0].setAssetGroup(assetGroupId).createAsset(userId, assetBody, assetFile).then((event) => {
      event.addMandatoryApprover(userId);
    });
    transaction.events[0].setAssetGroup(assetGroupId).addMandatoryApprover(userId).createAsset(userId, assetBody, assetFile);
    // console.log(transaction);
    transaction.relations[0].setAssetGroup(assetGroupId).createAsset(userId, assetBody, assetFile);
    transaction.relations[1].setAssetGroup(assetGroupId).createPointer(transactionId, assetId);
    transaction.relations[2].setAssetGroup(assetGroupId).createAssetRaw(assetId, assetBody);
    transaction.relations[3].setAssetGroup(assetGroupId).createAssetHash([assetId]);
    transaction.addWitness(userId);
    await transaction.sign(userId, keypair);
    const transactionBin = await transaction.pack();
    const transactionUnpack = await bbclib.loadBinaryTransaction(transactionBin , 2.0, IDsLength);

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

  it('makeTransaction with event and relation for JSON', async () => {
    const keypair = bbclib.createKeypair();
    await keypair.generate();
    const userId = await jscu.random.getRandomBytes(32);
    const assetGroupId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(32);
    const assetFile = await jscu.random.getRandomBytes(32);
    const transaction = await bbclib.makeTransaction(1, 1, true, 2.0, IDsLength);
    transaction.events[0].setAssetGroup(assetGroupId);
    await transaction.events[0].createAsset(userId, assetBody, assetFile);
    transaction.events[0].addMandatoryApprover(userId);
    transaction.relations[0].setAssetGroup(assetGroupId);
    await transaction.relations[0].createAsset(userId, assetBody, assetFile);
    transaction.witness.addWitness(userId);
    await transaction.sign(userId, keypair);

    const transactionJSON = await transaction.dumpJSON();

    const transactionUnpack = await bbclib.loadJSONTransaction(transactionJSON , 2.0, IDsLength);

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

  it('helper hboToInt', async () => {

    const number64 = bbclib.helper.hboToInt64(new Uint8Array(64));
    const number32 = bbclib.helper.hboToInt32(new Uint8Array(32));
    const number16 = bbclib.helper.hboToInt16(new Uint8Array(16));
    expect(number64).to.be.eq(0);
    expect(number32).to.be.eq(0);
    expect(number16).to.be.eq(0);
  });

  it('deserialize zlib ', async () => {
    const transaction = await bbclib.deserialize(jseu.encoder.hexStringToArrayBuffer(data.sample.zlib));
    const serialized = await bbclib.serialize(transaction, true);
    expect(data.sample.zlib).to.be.eq(jseu.encoder.arrayBufferToHexString(serialized));
  });

  it('deserialize plain ', async () => {
    const transaction = await bbclib.deserialize(jseu.encoder.hexStringToArrayBuffer(data.sample.plain));
    const serialized = await bbclib.serialize(transaction);
    expect(data.sample.plain).to.be.eq(jseu.encoder.arrayBufferToHexString(serialized));
  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
