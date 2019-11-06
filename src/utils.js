import { BBcEvent } from './bbcClass/BBcEvent';
import { BBcAsset } from './bbcClass/BBcAsset';
import { BBcAssetRaw } from './bbcClass/BBcAssetRaw';
import { BBcTransaction } from './bbcClass/BBcTransaction';
import { BBcWitness } from './bbcClass/BBcWitness';
import { BBcRelation } from './bbcClass/BBcRelation';
import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import {idsLength} from './bbcClass/idsLength';

export async function makeRelationWithAssetRaw(assetGroupId, assetId, assetBody, idLength=idsLength) {
  const relation = new BBcRelation(assetGroupId, idLength, 2.0);
  const assetRaw = new BBcAssetRaw(idLength);
  assetRaw.setAsset(assetId, assetBody);
  relation.setAssetRaw(assetRaw);
  return relation;
}

export async function makeRelationWithAssetHash(assetGroupId, assetIds,idLength=idsLength ) {
  const relation = new BBcRelation(assetGroupId, idLength, 2.0);
  const assetHash = new BBcAssetHash(idLength);
  for (let i = 0; i < assetIds.length; i++){
    assetHash.addAssetId(assetIds[i]);
  }
  relation.setAssetHash(assetHash);
  return relation;
}

export async function makeTransaction(relationNum, eventNum, witness, version, idsLength=idsLength){

  let transaction = new BBcTransaction(version, idsLength);

  if (eventNum > 0){
    for (let i = 0; i < eventNum; i++){
      const event = new BBcEvent(assetGroupId, idsLength);
      const asset = new BBcAsset(userId, idsLength);
      event.addAsset(asset);
      transaction.addEvent(event);
    }
  }

  if (relationNum > 0){
    for (let i = 0; i < relationNum; i++){
      const relation = new BBcRelation(null, idsLength, version);
      transaction.addRelation(relation);
    }
  }

  if (witness){
    transaction.setWitness(new BBcWitness(idsLength));
  }
  return transaction;
}

export async function addRelationAsset(transaction, relationIndex, assetGroupId, userId, assetBody, assetFile, idsLength=idsLength){
  const asset = new BBcAsset(userId, idsLength);
  await asset.addAsset(assetFile, assetBody);
  transaction.relations[relationIndex].setAsset(asset);
  transaction.relations[relationIndex].addAssetGroupId(assetGroupId);
  return transaction;
}

export async function addEventAsset(transaction, eventIndex, assetGroupId, userId, assetBody, assetFile, idsLength=idsLength){
  const asset = new BBcAsset(userId, idsLength);
  await asset.addAsset(assetFile, assetBody);
  transaction.events[eventIndex].addAsset(asset);
  transaction.events[eventIndex].addAssetGroupId(assetGroupId);
  return transaction;
}

export async function addRelationPointer(transaction, relationIndex, refTransactionId, refAssetId){
  const pointer = new BBcPointer(refTransactionId, refAssetId, idLength);
  transaction.relations[relationIndex].addPointer(pointer);
  return transaction;
}

export async function addRefernceToTransaction(transaction, assetGroupId, refTransaction, eventIndexInRef){
  const reference = new BBcReference(assetGroupId, transaction, refTransaction, eventIndexInRef, idLength);
  await reference.prepareReference(refTransaction);
  if (reference.transactionId === null){
    return null;
  }
  transaction.addReference(reference);
  return transaction;
}
