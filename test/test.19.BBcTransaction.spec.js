import chai from 'chai';

const expect = chai.expect;
import jscu from 'js-crypto-utils';
import {Buffer} from 'buffer';

import {getTestEnv} from './prepare.js';
import jseu from 'js-encoding-utils';
import * as helper from '../src/helper';
import * as para from '../src/parameter';
import {BBcSignature} from "../src";

const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcTransaction`, () => {

  it('pack and unpack only witness', async () => {
    console.log('***********************');
    console.log('Test for BBcTransaction Class.');

    const transaction = new bbclib.BBcTransaction(1.0, 32);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(32);
      const refTransaction = await jscu.random.getRandomBytes(32);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const witness = new bbclib.BBcWitness(32);
    witness.addSigIndices(0);
    witness.addUser(new Uint8Array(2));
    transaction.addParts([], refs, [], witness, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

  it('pack and unpack with asset relations', async () => {
    const idLength = 32;

    const transaction = new bbclib.BBcTransaction(1.0, idLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new bbclib.BBcRelation(assetGroupId, idLength);
    const asset = new bbclib.BBcAsset(userId, idLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

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
    relation.setAsset(asset);
    relation.addPointer(new bbclib.BBcPointer(transactionId, assetGroupId, idLength));

    transaction.addParts([], refs, [relation], null, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

  it('pack and unpack with assetRaw relations', async () => {
    const idLength = 32;

    const transaction = new bbclib.BBcTransaction(2.0, idLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const relation = new bbclib.BBcRelation(assetGroupId, idLength,2);
    const assetId = await jscu.random.getRandomBytes(32);
    const assetBody = await jscu.random.getRandomBytes(512);
    const assetRaw = new bbclib.BBcAssetRaw(idLength);
    assetRaw.setAsset(assetId, assetBody);
    relation.setAssetRaw(assetRaw);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new bbclib.BBcPointer(transactionId, assetGroupId, idLength));

    transaction.addParts([], refs, [relation], null, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(2.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

      expectUint8Array(relations.assetRaw.assetId,relationsUnpack.assetRaw.assetId);
      expectUint8Array(relations.assetRaw.assetBody,relationsUnpack.assetRaw.assetBody);
      expect( relations.assetRaw.assetBodySize).to.be.eq(relationsUnpack.assetRaw.assetBodySize);
    }

    expect(transaction.crossRef).to.be.eq(transactionUnpack.crossRef);
    //expect(transactionPack.signatures).to.be.eq(transaction_deserialize.signatures);
  });

  it('pack and unpack with assetHash relations', async () => {
    const idLength = 32;

    const transaction = new bbclib.BBcTransaction(2.0, idLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const relation = new bbclib.BBcRelation(assetGroupId, idLength, 2);
    const assetId_1 = await jscu.random.getRandomBytes(32);
    const assetId_2 = await jscu.random.getRandomBytes(32);
    const assetId_3 = await jscu.random.getRandomBytes(32);
    const assetHash = new bbclib.BBcAssetHash(idLength);
    assetHash.addAssetId(assetId_1);
    assetHash.addAssetId(assetId_2);
    assetHash.addAssetId(assetId_3);

    relation.setAssetHash(assetHash);
    const transactionId = await jscu.random.getRandomBytes(idLength);
    relation.addPointer(new bbclib.BBcPointer(transactionId, assetGroupId, idLength));

    transaction.addParts([], refs, [relation], null, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(2.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

  it('pack and unpack with witness and relations', async () => {
    const idLength = 32;

    const transaction = new bbclib.BBcTransaction(1.0, idLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);

    const witness = new bbclib.BBcWitness(32);
    witness.addSigIndices(0);
    witness.addUser(new Uint8Array(2));

    const relation = new bbclib.BBcRelation(assetGroupId, idLength);
    const asset = new bbclib.BBcAsset(userId, idLength);
    const transactionId = await jscu.random.getRandomBytes(idLength);

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
    relation.setAsset(asset);
    relation.addPointer(new bbclib.BBcPointer(transactionId, assetGroupId, idLength));

    transaction.addParts([], refs, [relation], witness, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

  it('pack and unpack with Event', async () => {
    const idLength = 32;

    const transaction = new bbclib.BBcTransaction(1.0, idLength);
    const refs = [];
    for (let i = 0; i < 2; i++) {
      const refAssetGroupId = await jscu.random.getRandomBytes(idLength);
      const refTransaction = await jscu.random.getRandomBytes(idLength);
      // const refEventIndexInRef  = await jscu.random.getRandomBytes(32);
      const bbcReference = new bbclib.BBcReference(refAssetGroupId, refTransaction, null, 3);

      refs.push(bbcReference);
    }

    const assetGroupId = await jscu.random.getRandomBytes(idLength);
    const userId = await jscu.random.getRandomBytes(idLength);
    const event = new bbclib.BBcEvent(assetGroupId,idLength);
    const asset = new bbclib.BBcAsset(userId, idLength);
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

    transaction.addParts([event], refs, [], null, null);
    //event reference relation witness crossRef

    const transactionBin = await transaction.pack();
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);
    await transactionUnpack.unpack(transactionBin);

    expect(transaction.version).to.be.eq(transactionUnpack.version);
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

  it('transaction add signature', async () => {
    const transaction = new bbclib.BBcTransaction(1.0, 32);

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new bbclib.BBcWitness(32);
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

  it('transaction add signature after unpack', async () => {
    const transaction = new bbclib.BBcTransaction(1, 32);
    const transactionUnpack = new bbclib.BBcTransaction(1, 32);

    const userId_0 = await jscu.random.getRandomBytes(32);
    const userId_1 = await jscu.random.getRandomBytes(32);
    const userId_2 = await jscu.random.getRandomBytes(32);
    const userId_3 = await jscu.random.getRandomBytes(32);

    const witness = new bbclib.BBcWitness(32);
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
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);

    await transactionUnpack.unpack(transactionData);

    expect( transactionUnpack.version).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8) ))).to.be.eq( "204f8c64bcf77115" );
    expect( transactionUnpack.idLength).to.be.eq( 32 );

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

    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].pubkeyByte)).to.be.eq("045c0d6779546f198e8e4454263a0279bc8cd2df0607da638fd934020fa383c3c8c67065affc5395523e84e121287b7f2628c7762c817853192fe3fe08cce2756b");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].signature)).to.be.eq("96e1ed7b4c17720b683ba03fd2f1824f52c1cea921b3c1aac2894a8869f5380b58fb9c2dabcdca352013bb302df3aabb24647684ffa13931094d79c8d661ad8a")

    await transactionUnpack.setTransactionId();

    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.transactionId)).to.be.eq("78a07ce9ee51c3454e9a71c5b0930a85ed091389970f0804b110204c5ec8bdfe");

  });
  
  it('load transaction with relations ', async () => {
    const transactionHexString = '01000000e00c7d64bcf771152000000000000100160100002000c3786b5358bb1e46509c81e75bc1a9726e3be08fcb537910c2f3ad7499cc5f130200460020003eb1bd439947eb762998e566ccc2e099c791118b2f40579cc4f7da2b5061b7f9010020008c2f9fd27c0044c83e64bc66162be45810cadb85e774fb9ab5eaf26ea68f7fa8240020003a77784128c045f171984af534a3ff40af3499ea4b170ec9adaa87329b3626d5000080000000200051c515dcb465283ebd179ede9b538c512525b56bd08937a4e70617d9e93ac92a20005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b847650220001c556e050b1ede536257d1d0d0e87d9ac0f96f8477877f552d0d2fc8d52a0d46000000000000120074657374537472696e67313233343558585801004a000000020020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502000020005d122c5f03ce34c998a5c90eae9b336e9563b860f405c3e34b7438d8915f17b50100010044000000200016347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33200071a70662cee85ab655e7a602720690033364b24a12d5b7a889b184efa670fc0f02008d0000000200000008020000048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb0002000046c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c8d0000000200000008020000048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb000200007b8157b97564a960df4f26b876b19a83a8f707f05398defa7ee844327e48d015f42ee9827d68ee77ad1617a55b90281037aa9104089a856c34cc6d45d8974748';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);

    await transactionUnpack.unpack(transactionData);

    //transactionUnpack.showStr();

    expect( transactionUnpack.version).to.be.eq( 1 );
    expect( jseu.encoder.arrayBufferToHexString(new Uint8Array(transactionUnpack.timestamp.toArray('lt',8) ))).to.be.eq( "e00c7d64bcf77115" );
    expect( transactionUnpack.idLength).to.be.eq( 32 );
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
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].pubkeyByte)).to.be.eq("048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[0].signature)).to.be.eq("46c820b3f758bea877f108e7efda0ba76d1e4a4ac021dd8357dfe423537033f7172f35e23005d51c6011cd93c7d2100cc7cf713e05da3c41df96f1ebe957238c")
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[1].pubkeyByte)).to.be.eq("048d6ba60d212be64213662a08f7b2fe2ec70226b468e3bb1bfa22b6470ef041c1651e4d010a0f9139b06c775901d2cc41786029bd15e362dbe5ea6b7761aca2eb");
    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.signatures[1].signature)).to.be.eq("7b8157b97564a960df4f26b876b19a83a8f707f05398defa7ee844327e48d015f42ee9827d68ee77ad1617a55b90281037aa9104089a856c34cc6d45d8974748");

    await transactionUnpack.setTransactionId();

    expect( jseu.encoder.arrayBufferToHexString(transactionUnpack.transactionId)).to.be.eq("2bb8d5690044d5105158ec1094458e5e2d2c6551f0452371a18ff89f68a430b0");

  });

  it('load transaction with KeyType == 0 ', async () => {
    const transactionHexString = '01000000157e472e4c6849802000000000000200b00000002000b01269bde4f5422dcd19346a51472a063174584227eb27cc905c449c0bc64eee010004000000000082000000200008d36ba72b8c152b2a028b7a7587f7bd262a0cb0d3fafc99ab460f3b92c6910520006dbd0f28d0d97656768b7b4ed96255e67fd11740a44b1c4b575191b06e9e3a3520003247f901d1ecb848673f3fa7bb28393822042c3b2b458d97eeb8adcfad4648bb00000000000014007b22706f77223a33302c22756e6974223a32357daf0000002000b01269bde4f5422dcd19346a51472a063174584227eb27cc905c449c0bc64eee0100040000000000810000002000c6e4d83e5ca74512fa2aa73da70d2aef4ab13f7b558cd4f498537baf065221ac2000a4279eae47aaa7417da62434795a011ccb0ec870f7f56646d181b5500a892a9a2000667c3e8b2f84e55eacd012841998da5ce240d13dd93480703826a819dc26fa9100000000000013007b22706f77223a352c22756e6974223a32357d01004a000000020020006dbd0f28d0d97656768b7b4ed96255e67fd11740a44b1c4b575191b06e9e3a3500002000a4279eae47aaa7417da62434795a011ccb0ec870f7f56646d181b5500a892a9a0100000002000c0000000000000000000000000000000c000000000000000000000000000000';
    const transactionData = helper.fromHexString(transactionHexString);
    const transactionUnpack = new bbclib.BBcTransaction(1.0, 32);
    await transactionUnpack.unpack(transactionData);
    await transactionUnpack.setTransactionId();
  });

  it('test sign transaction', async () => {

    let keyPair = await getKeyPair();
    const userId = await jscu.random.getRandomBytes(32);
    const transactionPack = new bbclib.BBcTransaction(1.0, 32);

    const witness = new bbclib.BBcWitness();
    transactionPack.setWitness(witness);
    transactionPack.witness.addWitness(userId);

    const sig = await transactionPack.sign(null,null,keyPair);
    const ret = transactionPack.addSignature(userId, sig);
    expect(ret).to.be.eq(true);

    transactionPack.witness.addSignature(userId, sig);
    const transactionBin = await transactionPack.pack();
  });

});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}

async function getKeyPair(){
  let keyPair = new bbclib.KeyPair();
  await keyPair.generate();
  return keyPair;
};

