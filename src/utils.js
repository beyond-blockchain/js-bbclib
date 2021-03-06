import { BBcEvent } from './bbcClass/BBcEvent';
import { BBcTransaction } from './bbcClass/BBcTransaction';
import { BBcWitness } from './bbcClass/BBcWitness';
import { BBcRelation } from './bbcClass/BBcRelation';
import {IDsLength} from './bbcClass/idsLength';
import { KeyPair } from './bbcClass/KeyPair';
import * as helper from './helper.js';
import zlib from 'zlib';

/**
 *
 * make transaction data
 * @param {Number} _eventNum
 * @param {Number} _relationNum
 * @param {Boolean} _witness
 * @param {Number} _version
 * @param {Object} _idsLength
 * @return {Boolean}
 */
export const makeTransaction = async ( _eventNum, _relationNum, _witness, _version=2.0, _idsLength=IDsLength) => {
  const transaction = new BBcTransaction(_version, _idsLength);
  if (_eventNum > 0){
    for (let i = 0; i < _eventNum; i++){
      const event = new BBcEvent(new Uint8Array(_idsLength.assetGroupId), _version, _idsLength);
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
 * load Binary transaction data
 * @param {Uint8Array} _transactionBin
 * @return {BBcTransaction}
 */
export const loadBinaryTransaction = async (_transactionBin) => {
  const transaction = new BBcTransaction(2.0, IDsLength);
  await transaction.unpack(_transactionBin);
  return transaction;
};

/**
 *
 * load JSON transaction data
 * @param {Object} _transactionJSON
 * @return {BBcTransaction}
 */
export const loadJSONTransaction = async (_transactionJSON) => {
  const transaction = new BBcTransaction(2.0, IDsLength);
  await transaction.loadJSON(_transactionJSON);
  return transaction;
};

/**
 *
 * deserialize
 * @param {Uint8Array} serializeTrnsaction
 * @return {BBcTransaction}
 */
export const deserialize = async (serializeTransaction) => {
  const header = helper.hboToInt16(serializeTransaction.slice(0,2));
  if (header == 0) {
    return loadBinaryTransaction(serializeTransaction.slice(2));
  }else if(header == 16){
    return loadBinaryTransaction(new Uint8Array(zlib.inflateSync(Buffer.from(serializeTransaction.slice(2)))));
  }
};

/**
 *
 * serialize
 * @param {BBcTransaction} transaction
 * @param {Boolean} isZlib
 * @return {Uint8Array}
 */
export const serialize = async (transaction, isZlib=false) => {
  let binaryData = [];
  const header = isZlib ? helper.convertNumberToBinary(0x0010) : helper.convertNumberToBinary(0x0000);
  binaryData = binaryData.concat(Array.from(helper.hbo(header, 2)));
  const transactionPacked = isZlib ? zlib.deflateSync(Buffer.from(await transaction.pack())) : await transaction.pack();
  binaryData = binaryData.concat(Array.from(new Uint8Array(transactionPacked)));
  return new Uint8Array(binaryData);
};



/**
 *
 * create KeyPair
 * @return {KeyPair}
 */
export const createKeypair = () => new KeyPair();

export default { makeTransaction, loadBinaryTransaction, loadJSONTransaction, createKeypair, deserialize, serialize };