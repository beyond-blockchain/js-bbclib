import { BBcEvent } from './bbcClass/BBcEvent';
import { BBcAsset } from './bbcClass/BBcAsset';
import { BBcAssetRaw } from './bbcClass/BBcAssetRaw';
import { BBcAssetHash } from './bbcClass/BBcAssetHash';
import { BBcTransaction } from './bbcClass/BBcTransaction';
import { BBcWitness } from './bbcClass/BBcWitness';
import { BBcRelation } from './bbcClass/BBcRelation';
import { BBcReference } from './bbcClass/BBcReference';
import { BBcPointer } from './bbcClass/BBcPointer';
import {IDsLength} from './bbcClass/idsLength';

export async function makeRelationWithAssetRaw(_assetGroupId, _assetId, _assetBody, _version=2.0, _idsLength=IDsLength) {
  const relation = new BBcRelation(_assetGroupId, _version, _idsLength);
  const assetRaw = new BBcAssetRaw(_assetId, _assetBody, _version, _idsLength);
  relation.setAssetRaw(assetRaw);
  return relation;
}

export async function makeRelationWithAssetHash(_assetGroupId, _assetIds, _version=2.0, _idsLength=IDsLength ) {
  const relation = new BBcRelation(_assetGroupId,_version, _idsLength);
  const assetHash = new BBcAssetHash(_assetIds, _version, _idsLength);
  relation.setAssetHash(assetHash);
  return relation;
}

export async function makeTransaction(_relationNum, _eventNum, _witness, _version=2.0, _idsLength=IDsLength, _assetGroupId=new Uint8Array(0), _userId=new Uint8Array(0)){
  const transaction = new BBcTransaction(_version, _idsLength);
  if (_eventNum > 0){
    for (let i = 0; i < _eventNum; i++){
      const event = new BBcEvent(_assetGroupId, _version, _idsLength);
      event.setAsset(new BBcAsset(_userId, _version, _idsLength));
      transaction.addEvent(event);
    }
  }
  if (_relationNum > 0){
    for (let i = 0; i < _relationNum; i++){
      const relation = new BBcRelation(null, _version, _idsLength);
      transaction.addRelation(relation);
    }
  }
  if (_witness){
    transaction.setWitness(new BBcWitness(_version, _idsLength));
  }
  return transaction;
}

export async function addRelationAsset(_transaction, _relationIndex, _assetGroupId, _userId, _assetBody, _assetFile, _version, _idsLength=IDsLength){
  const asset = new BBcAsset(_userId, _version, _idsLength);
  await asset.setAsset(_assetFile, _assetBody);
  _transaction.relations[_relationIndex].setAsset(asset);
  _transaction.relations[_relationIndex].setAssetGroupId(_assetGroupId);
  return _transaction;
}

export async function addEventAsset(_transaction, _eventIndex, _assetGroupId, _userId, _assetBody, _assetFile, _version, _idsLength=IDsLength){
  const asset = new BBcAsset(_userId, _version, _idsLength);
  await asset.setAsset(_assetFile, _assetBody);
  _transaction.events[_eventIndex].setAsset(asset);
  _transaction.events[_eventIndex].setAssetGroupId(_assetGroupId);
  return _transaction;
}

export async function addRelationPointer(_transaction, _relationIndex, _refTransactionId, _refAssetId, _version, _idsLength=IDsLength){
  const pointer = new BBcPointer(_refTransactionId, _refAssetId, _version, _idsLength);
  _transaction.relations[_relationIndex].addPointer(pointer);
  return _transaction;
}

export async function addReferenceToTransaction(_transaction, _assetGroupId, _refTransaction, _eventIndexInRef, _version, _idsLength=IDsLength){
  const reference = new BBcReference(_assetGroupId, _transaction, _refTransaction, _eventIndexInRef, _version, _idsLength);
  await reference.prepareReference(_refTransaction);
  if (reference.transactionId === null){
    return null;
  }
  _transaction.addReference(reference);
  return _transaction;
}
