import chai from 'chai';

const expect = chai.expect;

import {getTestEnv} from './prepare.js';
import {getJscu} from '../src/env.js';
import * as helper from '../src/helper';
import * as para from '../src/parameter.js';
import {IDsLength} from '../src/bbcClass/idsLength';
import { BBcAsset } from '../src/bbcClass/BBcAsset.js';
import { BBcAssetRaw } from '../src/bbcClass/BBcAssetRaw.js';
import { BBcAssetHash } from '../src/bbcClass/BBcAssetHash.js';
import { BBcWitness } from '../src/bbcClass/BBcWitness.js';
import { BBcReference } from '../src/bbcClass/BBcReference.js';
import { BBcTransaction } from '../src/bbcClass/BBcTransaction.js';
import { BBcEvent }  from '../src/bbcClass/BBcEvent.js';
import { BBcSignature } from '../src/bbcClass/BBcSignature.js';
import { BBcRelation } from '../src/bbcClass/BBcRelation.js';
import { BBcPointer } from '../src/bbcClass/BBcPointer.js';
import { KeyPair } from '../src/bbcClass/KeyPair.js';
import { makeTransaction, loadBinaryTransaction, loadJSONTransaction, createKeypair } from '../src/utils.js';
import jseu from 'js-encoding-utils';
import BN from 'bn.js';
const jscu = getJscu();
const env = getTestEnv();
const envName = env.envName;

describe(`${envName}: Test BBcTransaction`, () => {

  it('pack and unpack only witness', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3);

      refs.push(bbcReference);
    }

    const witness = new BBcWitness(IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));
    transaction.addParts([], refs, [], witness, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength.transactionId).to.be.eq(transactionUnpack.idsLength.transactionId);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations['idLength']).to.be.eq(relationsUnpack['idLength']);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    for (let i = 0; i < transaction.witness.sigIndices.length; i++) {
      const transactionWitness = transaction.witness;
      const transactionWitnessUnpack = transactionUnpack.witness;
      expect(transactionWitness.sigIndices[i]).to.be.eq(transactionWitnessUnpack.sigIndices[i]);
      expectUint8Array(transactionWitness.userIds[i],transactionWitnessUnpack.userIds[i]);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
  });

  it('dumpJSON and loadJSON only witness', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3);
      refs.push(bbcReference);
    }

    const witness = new BBcWitness(IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));
    transaction.addParts([], refs, [], witness, null);

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength.transactionId).to.be.eq(transactionUnpack.idsLength.transactionId);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations['idLength']).to.be.eq(relationsUnpack['idLength']);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    for (let i = 0; i < transaction.witness.sigIndices.length; i++) {
      const transactionWitness = transaction.witness;
      const transactionWitnessUnpack = transactionUnpack.witness;
      expect(transactionWitness.sigIndices[i]).to.be.eq(transactionWitnessUnpack.sigIndices[i]);
      expectUint8Array(transactionWitness.userIds[i],transactionWitnessUnpack.userIds[i]);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
  });

  it('dump only witness', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const witness = new BBcWitness(IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));
    transaction.addParts([], refs, [], witness, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('pack and unpack with asset relations', async () => {

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(32);
    const userId = await jscu.random.getRandomBytes(32);

    const relation = new BBcRelation(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId,  1.0, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(32);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, 1.0, IDsLength));

    transaction.addParts([], refs, [relation], null, null);
    //event reference relation witness crossRef
    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expectUint8Array(new Uint8Array(transaction.timestamp.toArray('lt',8)), new Uint8Array(transactionUnpack.timestamp.toArray('lt',8)));

    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength.assetGroupId).to.be.eq(relationsUnpack.idsLength.assetGroupId);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dumpJSON and loadJSON with asset relations', async () => {

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(32);
    const userId = await jscu.random.getRandomBytes(32);

    const relation = new BBcRelation(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId,  1.0, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(32);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, 1.0, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expectUint8Array(new Uint8Array(transaction.timestamp.toArray('lt',8)), new Uint8Array(transactionUnpack.timestamp.toArray('lt',8)));

    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength.assetGroupId).to.be.eq(relationsUnpack.idsLength.assetGroupId);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
  });

  it('dump with asset relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new BBcRelation(assetGroupId, IDsLength);
    const asset = new BBcAsset(userId, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetBody[i] = 0xFF & (i + idLength);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('pack and unpack with assetRaw relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 2.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const relation = new BBcRelation(assetGroupId,2.0, IDsLength);
    const assetId = await jscu.random.getRandomBytes(idLength);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    relation.setAssetRaw(assetRaw);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, 2.0, IDsLength));
    transaction.addParts([], refs, [relation], null, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength.transactionId).to.be.eq(transactionUnpack.idsLength.transactionId);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength.assetGroupId).to.be.eq(relationsUnpack.idsLength.assetGroupId);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.assetRaw.assetId,relationsUnpack.assetRaw.assetId);
      expectUint8Array(relations.assetRaw.assetBody,relationsUnpack.assetRaw.assetBody);
      expect( relations.assetRaw.assetBodySize).to.be.eq(relationsUnpack.assetRaw.assetBodySize);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dumpJSON and loaJSON with assetRaw relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 2.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const relation = new BBcRelation(assetGroupId,2.0, IDsLength);
    const assetId = await jscu.random.getRandomBytes(idLength);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    relation.setAssetRaw(assetRaw);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, 2.0, IDsLength));
    transaction.addParts([], refs, [relation], null, null);

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength.transactionId).to.be.eq(transactionUnpack.idsLength.transactionId);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength.assetGroupId).to.be.eq(relationsUnpack.idsLength.assetGroupId);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.assetRaw.assetId,relationsUnpack.assetRaw.assetId);
      expectUint8Array(relations.assetRaw.assetBody,relationsUnpack.assetRaw.assetBody);
      expect( relations.assetRaw.assetBodySize).to.be.eq(relationsUnpack.assetRaw.assetBodySize);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dump with assetRaw relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const relation = new BBcRelation(assetGroupId, 2.0, IDsLength);
    const assetId = await jscu.random.getRandomBytes(idLength);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new BBcAssetRaw(assetId, assetBody, 2.0, IDsLength);
    relation.setAssetRaw(assetRaw);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('pack and unpack with assetHash relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new BBcRelation(assetGroupId,  2.0, IDsLength);
    const assetId_1 = await jscu.random.getRandomBytes(idLength);
    const assetId_2 = await jscu.random.getRandomBytes(idLength);
    const assetId_3 = await jscu.random.getRandomBytes(idLength);
    const assetIds = [assetId_1, assetId_2, assetId_3];
    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);

    relation.setAssetHash(assetHash);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idLength).to.be.eq(transactionUnpack.idLength);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations['idLength']).to.be.eq(relationsUnpack['idLength']);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array( relations.assetHash.assetIds[0],relationsUnpack.assetHash.assetIds[0]);
      expectUint8Array( relations.assetHash.assetIds[1],relationsUnpack.assetHash.assetIds[1]);
      expectUint8Array( relations.assetHash.assetIds[2],relationsUnpack.assetHash.assetIds[2]);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('pack and unpack with assetHash relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new BBcRelation(assetGroupId,  2.0, IDsLength);
    const assetId_1 = await jscu.random.getRandomBytes(idLength);
    const assetId_2 = await jscu.random.getRandomBytes(idLength);
    const assetId_3 = await jscu.random.getRandomBytes(idLength);
    const assetIds = [assetId_1, assetId_2, assetId_3];
    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);

    relation.setAssetHash(assetHash);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idLength).to.be.eq(transactionUnpack.idLength);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations['idLength']).to.be.eq(relationsUnpack['idLength']);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array( relations.assetHash.assetIds[0],relationsUnpack.assetHash.assetIds[0]);
      expectUint8Array( relations.assetHash.assetIds[1],relationsUnpack.assetHash.assetIds[1]);
      expectUint8Array( relations.assetHash.assetIds[2],relationsUnpack.assetHash.assetIds[2]);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dumpJSON and loadJSON with assetHash relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new BBcRelation(assetGroupId,  2.0, IDsLength);
    const assetId_1 = await jscu.random.getRandomBytes(idLength);
    const assetId_2 = await jscu.random.getRandomBytes(idLength);
    const assetId_3 = await jscu.random.getRandomBytes(idLength);
    const assetIds = [assetId_1, assetId_2, assetId_3];
    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);

    relation.setAssetHash(assetHash);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idLength).to.be.eq(transactionUnpack.idLength);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations['idLength']).to.be.eq(relationsUnpack['idLength']);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array( relations.assetHash.assetIds[0],relationsUnpack.assetHash.assetIds[0]);
      expectUint8Array( relations.assetHash.assetIds[1],relationsUnpack.assetHash.assetIds[1]);
      expectUint8Array( relations.assetHash.assetIds[2],relationsUnpack.assetHash.assetIds[2]);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dump with assetHash relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(2.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new BBcRelation(assetGroupId,2,  IDsLength);
    const assetId_1 = await jscu.random.getRandomBytes(idLength);
    const assetId_2 = await jscu.random.getRandomBytes(idLength);
    const assetId_3 = await jscu.random.getRandomBytes(idLength);
    const assetIds = [assetId_1, assetId_2, assetId_3];
    const assetHash = new BBcAssetHash(assetIds, 2.0, IDsLength);

    relation.setAssetHash(assetHash);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], null, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('pack and unpack with witness and relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, refTransaction, null, 3, 2.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const witness = new BBcWitness(2.0, IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));

    const relation = new BBcRelation(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 2.0, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetBody[i] = 0xFF & (i + idLength);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], witness, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      // expect(relations.idsLength).to.be.eq(relationsUnpack.idsLength);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    for (let i = 0; i < transaction.witness.sigIndices.length; i++) {
      const transactionWitness = transaction.witness;
      const transactionWitnessUnpack = transactionUnpack.witness;
      expect(transactionWitness.sigIndices[i]).to.be.eq(transactionWitnessUnpack.sigIndices[i]);
      expectUint8Array(transactionWitness.userIds[i],transactionWitnessUnpack.userIds[i]);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dmupJSON and loadJSON with witness and relations', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, refTransaction, null, 3, 2.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const witness = new BBcWitness(2.0, IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));

    const relation = new BBcRelation(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 2.0, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetBody[i] = 0xFF & (i + idLength);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], witness, null);
    //event reference relation witness crossRef

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      // expect(relations.idsLength).to.be.eq(relationsUnpack.idsLength);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    for (let i = 0; i < transaction.witness.sigIndices.length; i++) {
      const transactionWitness = transaction.witness;
      const transactionWitnessUnpack = transactionUnpack.witness;
      expect(transactionWitness.sigIndices[i]).to.be.eq(transactionWitnessUnpack.sigIndices[i]);
      expectUint8Array(transactionWitness.userIds[i],transactionWitnessUnpack.userIds[i]);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('dump with witness and relations', async () => {
    const idLength = 32;
    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);
      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const witness = new BBcWitness(IDsLength);
    witness.addSigIndices(0);
    witness.addUserId(new Uint8Array(2));

    const relation = new BBcRelation(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 1.0, IDsLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

    await asset.setRandomNonce();
    const assetFile = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(idLength);
    for(let i = 0; i < idLength; i++){
      assetBody[i] = 0xFF & (i + idLength);
    }
    await asset.setAsset(assetFile, assetBody);
    relation.setAsset(asset);
    relation.addPointer(new BBcPointer(transactionId, assetGroupId, IDsLength));

    transaction.addParts([], refs, [relation], witness, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('pack and unpack with Event', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);
    const event = new BBcEvent(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 1.0, IDsLength);
    await asset.setRandomNonce();

    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await asset.setAsset(assetFile, assetBody);

    event.setAsset(asset);
    event.setAssetGroup(assetGroupId);
    event.addMandatoryApprover(userId);

    transaction.addParts([event], refs, [], null, null);

    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength).to.be.eq(transactionUnpack.idsLength);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength).to.be.eq(relationsUnpack.idsLength);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
  });

  it('dumpJSON and loadJSON with Event', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);
    const event = new BBcEvent(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 1.0, IDsLength);
    await asset.setRandomNonce();

    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await asset.setAsset(assetFile, assetBody);

    event.setAsset(asset);
    event.setAssetGroup(assetGroupId);
    event.addMandatoryApprover(userId);

    transaction.addParts([event], refs, [], null, null);

    const transactionJSON = await transaction.dumpJSON();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.loadJSON(transactionJSON);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
    expect(transaction.getUnixTime()).to.be.eq(transactionUnpack.getUnixTime());
    expect(jseu.encoder.arrayBufferToHexString(new Uint8Array(transaction.timestamp.toArray('lt',8)))).to.be.eq(jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8))));
    expect(transaction.idsLength).to.be.eq(transactionUnpack.idsLength);
    for (let i = 0; i < transaction.events.length; i++) {
      expectUint8Array(transaction.events[i].pack(),transactionUnpack.events[i].pack());
    }
    for (let i = 0; i < transaction.references.length; i++) {
      expectUint8Array(transaction.references[i].pack(),transactionUnpack.references[i].pack());
    }
    for (let i = 0; i < transaction.relations.length; i++) {
      const relations = transaction.relations[i];
      const relationsUnpack = transactionUnpack.relations[i];

      expect(relations.idsLength).to.be.eq(relationsUnpack.idsLength);
      expectUint8Array(relations.assetGroupId,relationsUnpack.assetGroupId);

      expectUint8Array(relations.pointers[0].transactionId,relationsUnpack.pointers[0].transactionId);
      expectUint8Array(relations.pointers[0].assetId,relationsUnpack.pointers[0].assetId);

      expectUint8Array(relations.asset.userId,relationsUnpack.asset.userId);
      expectUint8Array(relations.asset.nonce,relationsUnpack.asset.nonce);
      expectUint8Array(relations.asset.assetFileDigest,relationsUnpack.asset.assetFileDigest);
      expectUint8Array(relations.asset.assetBody,relationsUnpack.asset.assetBody);
      expect( relations.asset.assetBodySize).to.be.eq(relationsUnpack.asset.assetBodySize);
      expect( relations.asset.assetBodyType).to.be.eq(relationsUnpack.asset.assetBodyType);

    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
  });

  it('dump with Event', async () => {
    const idLength = 32;

    const transaction = new BBcTransaction(1.0, IDsLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new BBcReference(refAssetGroupId, transaction, null, 3, 1.0, IDsLength);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);
    const event = new BBcEvent(assetGroupId, 1.0, IDsLength);
    const asset = new BBcAsset(userId, 1.0, IDsLength);
    await asset.setRandomNonce();

    const assetFile = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetFile[i] = 0xFF & i;
    }
    const assetBody = new Uint8Array(32);
    for(let i = 0; i < 32; i++){
      assetBody[i] = 0xFF & (i + 32);
    }
    await asset.setAsset(assetFile, assetBody);

    event.setAsset(asset);
    event.setAssetGroup(assetGroupId);
    event.addMandatoryApprover(userId);

    transaction.addParts([event], refs, [], null, null);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);

  });

  it('transaction add signature', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new BBcWitness(IDsLength);
    transaction.setWitness(witness);
    transaction.witness.addWitness(userId_0);
    transaction.witness.addWitness(userId_1);
    transaction.witness.addWitness(userId_2);
    transaction.witness.addWitness(userId_3);

    const sig_0 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_1 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_2 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_3 = new BBcSignature(para.KeyType.ECDSA_P256v1);

    transaction.witness.addSignatureUsingIndex(userId_0, sig_0);
    expect( transaction.signatures[0].keyType).to.be.eq( 2 );
    transaction.witness.addSignatureUsingIndex(userId_3, sig_3);
    expect( transaction.signatures[3].keyType).to.be.eq( 2 );
    transaction.witness.addSignatureUsingIndex(userId_1, sig_1);
    expect( transaction.signatures[1].keyType).to.be.eq( 2 );
    transaction.witness.addSignatureUsingIndex(userId_2, sig_2);
    expect( transaction.signatures[2].keyType).to.be.eq( 2 );

  });

  it('dump with signature', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new BBcWitness(IDsLength);
    transaction.setWitness(witness);
    transaction.witness.addWitness(userId_0);
    transaction.witness.addWitness(userId_1);
    transaction.witness.addWitness(userId_2);
    transaction.witness.addWitness(userId_3);

    const sig_0 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_1 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_2 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_3 = new BBcSignature(para.KeyType.ECDSA_P256v1);

    transaction.witness.addSignatureUsingIndex(userId_0, sig_0);
    transaction.witness.addSignatureUsingIndex(userId_3, sig_3);
    transaction.witness.addSignatureUsingIndex(userId_1, sig_1);
    transaction.witness.addSignatureUsingIndex(userId_2, sig_2);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);
  });

  it('dump with signature and publickey', async () => {
    const transaction = new BBcTransaction(1.0, IDsLength);

    const keyPair_0 = await getKeyPair();
    const keyPair_1 = await getKeyPair();
    const keyPair_2 = await getKeyPair();
    const keyPair_3 = await getKeyPair();

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new BBcWitness(1.0, IDsLength);
    transaction.setWitness(witness);
    transaction.witness.addWitness(userId_0);
    transaction.witness.addWitness(userId_1);
    transaction.witness.addWitness(userId_2);
    transaction.witness.addWitness(userId_3);

    await transaction.sign(userId_0, keyPair_0);
    await transaction.sign(userId_1, keyPair_1);
    await transaction.sign(userId_2, keyPair_2);
    await transaction.sign(userId_3, keyPair_3);

    const dump = await transaction.dump();
    expect(dump).to.be.not.eq(null);
  });

  it('transaction add signature after unpack', async () => {
    const transaction = new BBcTransaction(1, IDsLength);
    const transactionUnpack = new BBcTransaction(1, IDsLength);

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new BBcWitness(IDsLength);
    transaction.setWitness(witness);
    transaction.witness.addWitness(userId_0);
    transaction.witness.addWitness(userId_1);
    transaction.witness.addWitness(userId_2);
    transaction.witness.addWitness(userId_3);

    const transactionBin = await transaction.pack();
    await transactionUnpack.unpack(transactionBin);

    const sig_0 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_1 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_2 = new BBcSignature(para.KeyType.ECDSA_P256v1);
    const sig_3 = new BBcSignature(para.KeyType.ECDSA_P256v1);

    transactionUnpack.witness.addSignature(userId_0, sig_0);
    expect( transactionUnpack.signatures[0].keyType).to.be.eq( 2 );
    transactionUnpack.witness.addSignature(userId_3, sig_3);
    expect( transactionUnpack.signatures[3].keyType).to.be.eq( 2 );
    transactionUnpack.witness.addSignature(userId_1, sig_1);
    expect( transactionUnpack.signatures[1].keyType).to.be.eq( 2 );
    transactionUnpack.witness.addSignature(userId_2, sig_2);
    expect( transactionUnpack.signatures[2].keyType).to.be.eq( 2 );

  });

  it('load transaction with event', async () => {
    const transactionHexString = '01000000204f8c64bcf7711520000100140100002000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f130000020020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502200089da422bbd6e85cdf6f8941ad4fdc905429da3a658ca00af4078489894b8115101000100200099ce84bb678d89e057840e5c4b90f1ee8fdc59e52889e4c4b9da8ab48ba259188000000020004f306a23a0c1a41f9aa1a56802bb8c21229ae6978e18b651a072a455ad55c34b20005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b84765022000898aa28f3dcdf9790b6047af18accd537db061138111df62d27d55c0546ba952000000000000120074657374537472696e67313233343558585800000000010026000000010020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b84765020000010044000000200016347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33200052acc5c800d9c3e8dbd81d0e4bdb233ce238953f762c409a2097e7e3451888ad01008d0000000200000008020000045c0d6779546f198e8e4454263a0279bc8cd2df0607da638fd934020fa383c3c8c67065affc5395523e84e121287b7f2628c7762c817853192fe3fe08cce2756b0002000096e1ed7b4c17720b683ba03fd2f1824f52c1cea921b3c1aac2894a8869f5380b58fb9c2dabcdca352013bb302df3aabb24647684ffa13931094d79c8d661ad8a';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionData);

    expect( transactionUnpack.version).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8) ))).to.be.eq( "1571f7bc648c4f20" );
    expect( transactionUnpack.idsLength.transactionId).to.be.eq( IDsLength.transactionId );

    expect( transactionUnpack.events.length).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].assetGroupId)).to.be.eq( "c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].mandatoryApprovers[0])).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].mandatoryApprovers[1])).to.be.eq( "89da422bbd6e85cdf6f8941ad4fdc905429da3a658ca00af4078489894b81151" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].optionApprovers[0])).to.be.eq( "99ce84bb678d89e057840e5c4b90f1ee8fdc59e52889e4c4b9da8ab48ba25918" );

    expect( transactionUnpack.events[0].optionApproverNumNumerator).to.be.eq( 1 );
    expect( transactionUnpack.events[0].optionApproverNumDenominator).to.be.eq( 1 );

    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.assetId )).to.be.eq( "4f306a23a0c1a41f9aa1a56802bb8c21229ae6978e18b651a072a455ad55c34b" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.userId )).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.nonce )).to.be.eq( "898aa28f3dcdf9790b6047af18accd537db061138111df62d27d55c0546ba952" );
    expect( transactionUnpack.events[0].asset.assetFileSize  ).to.be.eq( 0 );
    expect( transactionUnpack.events[0].asset.assetBodySize  ).to.be.eq( 18 );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.assetBody)).to.be.eq("74657374537472696e673132333435585858");

    expect( transactionUnpack.references.length).to.be.eq( 0 );
    expect( transactionUnpack.relations.length).to.be.eq( 0 );
    expect( transactionUnpack.witness.sigIndices[0]).to.be.eq(0);
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.witness.userIds[0])).to.be.eq("5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502");

    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.crossRef.domainId)).to.be.eq("16347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.crossRef.transactionId)).to.be.eq("52acc5c800d9c3e8dbd81d0e4bdb233ce238953f762c409a2097e7e3451888ad");

    expect( jseu.encoder.arrayBufferToHexString(await transactionUnpack.signatures[0].keypair.exportPublicKey('oct'))).to.be.eq("045c0d6779546f198e8e4454263a0279bc8cd2df0607da638fd934020fa383c3c8c67065affc5395523e84e121287b7f2628c7762c817853192fe3fe08cce2756b");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].signature)).to.be.eq("96e1ed7b4c17720b683ba03fd2f1824f52c1cea921b3c1aac2894a8869f5380b58fb9c2dabcdca352013bb302df3aabb24647684ffa13931094d79c8d661ad8a")
  });

  it('load transaction with relations ', async () => {
    const transactionHexString = '01000000e00c7d64bcf771152000000000000100160100002000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f130200460020003eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9010020008c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8240020003a77784128c045f171984af534a3ff40af3499ea4b170ec9adaa87329b3626d5000080000000200051c515dcb465283ebd179ede9b538c512525b56bd08937a4e70617d9e93ac92a20005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b847650220001c556e050b1ede536257d1d0d0e87d9ac0f96f8477877f552d0d2fc8d52a0d46000000000000120074657374537472696e67313233343558585801004a000000020020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502000020005d122c5f03ce34c998a5c90eae9b336e9563b860f405c3e34b7438d8915f17b50100010044000000200016347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33200071a70662cee85ab655e7a602720690033364b24a12d5b7a889b184efa670fc0f02008d0000000200000008020000048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb0002000046c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c8d0000000200000008020000048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb000200007b8157b97564a960df4f26b876b19a83a8f707f05398defa7ee844327e48d015f42ee9827d68ee77ad1617a55b90281037aa9104089a856c34cc6d45d8974748';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);

    await transactionUnpack.unpack(transactionData);

    expect( transactionUnpack.version).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8) ))).to.be.eq( "1571f7bc647d0ce0" );
    expect( transactionUnpack.idsLength.transactionId).to.be.eq( 32 );
    expect( transactionUnpack.events.length).to.be.eq( 0 );
    expect( transactionUnpack.references.length).to.be.eq( 0 );
    expect( transactionUnpack.relations.length).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].assetGroupId) ).to.be.eq( "c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f13" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].pointers[0].transactionId) ).to.be.eq( "3eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].pointers[0].assetId) ).to.be.eq( "8c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].pointers[1].transactionId) ).to.be.eq( "3a77784128c045f171984af534a3ff40af3499ea4b170ec9adaa87329b3626d5" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.assetId ) ).to.be.eq( "51c515dcb465283ebd179ede9b538c512525b56bd08937a4e70617d9e93ac92a" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.userId ) ).to.be.eq( "5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502" );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.nonce ) ).to.be.eq( "1c556e050b1ede536257d1d0d0e87d9ac0f96f8477877f552d0d2fc8d52a0d46" );
    expect( transactionUnpack.relations[0].asset.assetFileSize  ).to.be.eq( 0 );
    expect( transactionUnpack.relations[0].asset.assetBodySize  ).to.be.eq( 18 );
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.assetBody)).to.be.eq("74657374537472696e673132333435585858");
    expect( transactionUnpack.witness.sigIndices[0]).to.be.eq(0);
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.witness.userIds[0])).to.be.eq("5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502");
    expect( transactionUnpack.witness.sigIndices[1]).to.be.eq(1);
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.witness.userIds[1])).to.be.eq("5d122c5f03ce34c998a5c90eae9b336e9563b860f405c3e34b7438d8915f17b5");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.crossRef.domainId)).to.be.eq("16347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.crossRef.transactionId)).to.be.eq("71a70662cee85ab655e7a602720690033364b24a12d5b7a889b184efa670fc0f");
    expect( jseu.encoder.arrayBufferToHexString(await transactionUnpack.signatures[0].keypair.exportPublicKey('oct'))).to.be.eq("048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].signature)).to.be.eq("46c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c")
    expect( jseu.encoder.arrayBufferToHexString(await transactionUnpack.signatures[1].keypair.exportPublicKey('oct'))).to.be.eq("048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[1].signature)).to.be.eq("7b8157b97564a960df4f26b876b19a83a8f707f05398defa7ee844327e48d015f42ee9827d68ee77ad1617a55b90281037aa9104089a856c34cc6d45d8974748");

  });

  it('load traction for closs platform ', async () => {
    const transactionHexString = '020000000b3c1e016e010000180001005c0000000600c3f9f38b8756000001000800693792d5850481d3000000003e00000010001585287eace88020c85e1bff9a3853570800693792d5850481d30900eca679bed097be054a0000000000000f006576656e743a61737365745f302d3000000100570000000600c3f9f38b87560000410000001000dec2ea322300a8c58635a87a30fd807a0800693792d5850481d30900f088fd6fed8ecd6976000000000000120072656c6174696f6e3a61737365745f302d30000000000000000001000e00000001000800693792d5850481d30000000001008d000000020000000802000004c30086644125a356c2717759afd40c0373d4ce90e74e992389951788c98222c5f2a6aed0a266ea7b63af0fd5191f760931edf6a67e61a1b75fdbd5506fb789900002000030aa656137bba50d837b33cf37880220ad341e30dc253e69c77e6e0bb1e69a6617c64bdde63942eaea8b8caa256516a9b34b836e66266e4590f222c74e697aa7';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionData);

    //transactionUnpack.showStr();

    expect(transactionUnpack.version).to.be.eq(2);
    expect(transactionUnpack.idsLength.transactionId).to.be.eq(24);
    expect(transactionUnpack.events.length).to.be.eq(1);
    expect(transactionUnpack.references.length).to.be.eq(0);
    expect(transactionUnpack.relations.length).to.be.eq(1);
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].assetGroupId)).to.be.eq("c3f9f38b8756");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.assetId)).to.be.eq("dec2ea322300a8c58635a87a30fd807a");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.userId)).to.be.eq("693792d5850481d3");
    expect(transactionUnpack.relations[0].asset.nonce.length).to.be.eq(9);
    expect(transactionUnpack.relations[0].asset.assetFileSize).to.be.eq(0);
    expect(transactionUnpack.relations[0].asset.assetBodySize).to.be.eq(18);
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.relations[0].asset.assetBody)).to.be.eq("72656c6174696f6e3a61737365745f302d30");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].assetGroupId)).to.be.eq("c3f9f38b8756");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].mandatoryApprovers[0])).to.be.eq("693792d5850481d3");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.userId)).to.be.eq("693792d5850481d3");
    expect(jseu.encoder.arrayBufferToHexString(transactionUnpack.events[0].asset.assetBody)).to.be.eq("6576656e743a61737365745f302d30");
    expect(transactionUnpack.events[0].asset.nonce.length).to.be.eq(9);
    expect(transactionUnpack.witness.userIds.length).to.be.eq(1);
    expect(transactionUnpack.witness.sigIndices.length).to.be.eq(1);
    expect(transactionUnpack.signatures.length).to.be.eq(1);
    const serialize = await transactionUnpack.getTransactionBase();
    expect(await transactionUnpack.signatures[0].verify(serialize)).to.be.eq(true);
  });

  it('load transaction with KeyType == 0 ', async () => {
    const transactionHexString = '01000000157e472e4c6849802000000000000200b00000002000b01269bde4f5422dcd19346a51472a063174584227eb27cc905c449c0bc64eee010004000000000082000000200008d36ba72b8c152b2a028b7a7587f7bd262a0cb0d3fafc99ab460f3b92c6910520006dbd0f28d0d97656768b7b4ed96255e67fd11740a44b1c4b575191b06e9e3a3520003247f901d1ecb848673f3fa7bb28393822042c3b2b458d97eeb8adcfad4648bb00000000000014007b22706f77223a33302c22756e6974223a32357daf0000002000b01269bde4f5422dcd19346a51472a063174584227eb27cc905c449c0bc64eee0100040000000000810000002000c6e4d83e5ca74512fa2aa73da70d2aef4ab13f7b558cd4f498537baf065221ac2000a4279eae47aaa7417da62434795a011ccb0ec870f7f56646d181b5500a892a9a2000667c3e8b2f84e55eacd012841998da5ce240d13dd93480703826a819dc26fa9100000000000013007b22706f77223a352c22756e6974223a32357d01004a000000020020006dbd0f28d0d97656768b7b4ed96255e67fd11740a44b1c4b575191b06e9e3a3500002000a4279eae47aaa7417da62434795a011ccb0ec870f7f56646d181b5500a892a9a0100000002000c0000000000000000000000000000000c000000000000000000000000000000';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionData);
  });

  it('load transaction for timestamp', async () => {
    const transactionHexString = '000002000000253c3d1e70010000180001005d0000000600c3f9f38b8756000001000800693792d5850481d3000000003f0000001000e7b00457bca98eafa46ae41be2e6f3220800730201e5f80b4a5709008a596810292bfe190a00000000000010006576656e743a61737365745f332d31390100280000000600c3f9f38b87561800a0a1132e498f072dd70a6482a29df3c63892688353e624a80000010000000400880000000600c3f9f38b875601002e001800a0a1132e498f072dd70a6482a29df3c63892688353e624a80100100020dc0c25b916762a8b894d906b287dd6420000001000950461298819c46cea713d7dd5c1b3920800693792d5850481d30900d287529b274cda521b000000000000130072656c6174696f6e3a61737365745f312d31390000000000000000b800000006001caa82dfdf7102002e001800a0a1132e498f072dd70a6482a29df3c63892688353e624a80100100020dc0c25b916762a8b894d906b287dd62e001800f476a8a94a05af58f4c12fe52ce5c460d292d559ca3fdf47010010001fb9d6cc70f360e634590009d7a03ea6420000001000ff51cc11e99d1f752ca32efb999a51730800730201e5f80b4a570900390f30b5e1f7f6cf71000000000000130072656c6174696f6e3a61737365745f322d313900000000000000008b0000000600c3f9f38b875602002e001800f476a8a94a05af58f4c12fe52ce5c460d292d559ca3fdf47010010001fb9d6cc70f360e634590009d7a03ea61c001800f476a8a94a05af58f4c12fe52ce5c460d292d559ca3fdf47000000000000270000001000a3bcf8ed735ab5f60929a9785d0d7d33130072656c6174696f6e3a61737365745f342d3139000000009000000006001caa82dfdf7101002e001800f476a8a94a05af58f4c12fe52ce5c460d292d559ca3fdf47010010001fb9d6cc70f360e634590009d7a03ea600000000000000004a000000040010003cc20b5c718c28ee4ccf39107a7d2ec91000119ca37c506767c908750f625c0163161000cdee0238d98753e0ffe4d1e04206ceb710006eb4d400b9dced214198210da070bc6301001a00000002000800693792d5850481d300000800730201e5f80b4a57010001003c000000200082f10651e04288b6ffea5c5ea129244dcf887e25bf939ca302d57c87ed6d16591800f476a8a94a05af58f4c12fe52ce5c460d292d559ca3fdf4702004c0000000200000000000000000200000e0de30160200b70cbe84d547f4df8e84ba201657a2a32e691c422bff108c7783def172f39474f483225bf1e4b6b798a742029d0b5397e38fc766a6cd7382e864c0000000200000000000000000200002724da9cede92cd80322576d7b7e8f095403d8d8499ad9b7bd32348ccec6f45389cdc92d355009672dd779845f6d470ab60bfd6777a4b613883ba6504a30c073';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionData);

  });

  it('test sign transaction1', async () => {
    const keyPair = await getKeyPair();
    const userId = await jscu.random.getRandomBytes(32);
    const transactionPack = new BBcTransaction(1.0, IDsLength);

    const witness = new BBcWitness(1.0, IDsLength);
    transactionPack.setWitness(witness);
    transactionPack.witness.addWitness(userId);
    const ret = await transactionPack.sign(userId, keyPair);
    expect(ret).to.be.eq(true);
    expect(await transactionPack.signatures[0].verify(await transactionPack.getTransactionBase())).to.be.eq(true);

    const transactionBin = await transactionPack.pack();
    const transactionUnpack = new BBcTransaction(1.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    const transactionBase = await transactionUnpack.getTransactionBase();
    const flag = await transactionUnpack.signatures[0].verify(transactionBase);
    expect(flag).to.be.eq(true);
  });

  it('test sign transaction2', async () => {
    const keyPair = await getKeyPair();
    const userId1 = await jscu.random.getRandomBytes(32);
    const assetGroupId1 = await jscu.random.getRandomBytes(32);

    const transaction = await makeTransaction(1,1, true, 2.0, IDsLength);
    const relationBody1 = await jscu.random.getRandomBytes(32);
    await transaction.relations[0].setAssetGroup(assetGroupId1).createAsset(userId1, relationBody1, null);
    const eventBody = await jscu.random.getRandomBytes(32);
    await (transaction.events[0].setAssetGroup(assetGroupId1)).createAsset(userId1, eventBody, null);
    await transaction.events[0].setAssetGroup(assetGroupId1).createAsset(userId1, eventBody, null);
    transaction.events[0].addMandatoryApprover(userId1);
    transaction.addWitness(userId1);
    await transaction.sign(userId1, keyPair);
    const flag =  await transaction.signatures[0].verify(await transaction.getTransactionBase());
    expect(flag).to.be.eq(true);
  });

  it('test sign transaction with pack and unpack', async () => {
    const keyPair = await getKeyPair();
    const userId1 = await jscu.random.getRandomBytes(32);
    const assetGroupId1 = await jscu.random.getRandomBytes(32);

    const transaction = await makeTransaction(1,1, true, 2.0, IDsLength);
    const relationBody1 = await jscu.random.getRandomBytes(32);
    await transaction.relations[0].setAssetGroup(assetGroupId1).createAsset(userId1, relationBody1, null);
    const eventBody = await jscu.random.getRandomBytes(32);
    await (transaction.events[0].setAssetGroup(assetGroupId1)).createAsset(userId1, eventBody, null);
    await transaction.events[0].setAssetGroup(assetGroupId1).createAsset(userId1, eventBody, null);
    transaction.events[0].addMandatoryApprover(userId1);
    transaction.addWitness(userId1);
    const transactionBin = await transaction.pack();
    const transactionUnpack = new BBcTransaction(2.0, IDsLength);
    await transactionUnpack.unpack(transactionBin);

    await transactionUnpack.sign(userId1, keyPair);
    const flag =  await transactionUnpack.signatures[0].verify(await transactionUnpack.getTransactionBase());
    expect(flag).to.be.eq(true);
  });
});



function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}

async function getKeyPair(){
  let keyPair = new KeyPair();
  await keyPair.generate();
  return keyPair;
}

