import { BBcEvent } from './bbcClass/BBcEvent';
import { BBcTransaction } from './bbcClass/BBcTransaction';
import { BBcWitness } from './bbcClass/BBcWitness';
import { BBcRelation } from './bbcClass/BBcRelation';
import {IDsLength} from './bbcClass/idsLength';
import { KeyPair } from './bbcClass/KeyPair';

/**
 *
 * make transaction data
 * @param {Number} _eventNum
 * @param {Number} _relationNum
 * @param {Boolean} _witness
 * @return {Boolean}
 */
export const makeTransaction = async ( _eventNum, _relationNum, _witness, _version=2.0, _idsLength=IDsLength) => {
  const transaction = new BBcTransaction(_version, _idsLength);
  if (_eventNum > 0){
    for (let i = 0; i < _eventNum; i++){
      const event = new BBcEvent(new Uint8Array(_idsLength.assetGroupId), _version, _idsLength);
      //event.setAsset(new BBcAsset(new Uint8Array(_idsLength.userId), _version, _idsLength));
      transaction.addEvent(event);
    }
  }
  if (_relationNum > 0){
    for (let i = 0; i < _relationNum; i++){
      const relation = new BBcRelation(new Uint8Array(_idsLength.assetGroupId), _version, _idsLength);
      transaction.addRelation(relation);
    }
  }

  if (_witness){
    transaction.setWitness(new BBcWitness(_version, _idsLength));
  }
  return transaction;
};

/**
 *
 * load transaction data
 * @param {Uint8Array} _transactionBin
 * @param {Number} _version
 * @param {Object} _idsLength
 * @return {BBcTransaction}
 */
export const loadTransactionBinary = async (_transactionBin, _version=2.0, _idsLength=IDsLength) => {
  const transaction = new BBcTransaction(_version, _idsLength);
  await transaction.unpack(_transactionBin);
  return transaction;
};

export const loadTransactionJSON = async (_transactionJSON, _version=2.0, _idsLength=IDsLength) => {
  const transaction = new BBcTransaction(_version, _idsLength);
  await transaction.unpack(_transactionJSON);
  return transaction;
};

/**
 *
 * create KeyPair
 * @return {KeyPair}
 */
export const createKeypair = () => new KeyPair();

export default { makeTransaction, loadTransactionBinary, loadTransactionJSON, createKeypair };