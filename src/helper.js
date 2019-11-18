import { BBcEvent } from './bbcClass/BBcEvent';
import { BBcAsset } from './bbcClass/BBcAsset';
import { BBcTransaction } from './bbcClass/BBcTransaction';
import { BBcWitness } from './bbcClass/BBcWitness';
import { BBcRelation } from './bbcClass/BBcRelation';
import {getJscu} from './env.js';
import jseu from 'js-encoding-utils';
import {IDsLength} from './bbcClass/idsLength';

const jscu = getJscu();


export async function signAndAddSignature(transaction, keyPair) {
  const sig = await transaction.sign(null, null, keyPair);
  transaction.addSignatureObject(transaction.userId, sig);
}

export async function getNewTransaction(userId, eventNum, relationNum, witness, version=1.0, idsLength=IDsLength) {

  const transaction = new BBcTransaction(version, idsLength);
  if (eventNum > 0) {
    for (let i = 0; i < eventNum; i++) {
      const evt = new BBcEvent(null, version, idsLength);
      const ast = new BBcAsset(null, version, idsLength);
      ast.addUserId(userId);
      await ast.digest();
      evt.setAsset(ast);
      evt.setAssetGroupId(new Uint8Array(8));
      transaction.addEvent(evt);
    }
  }

  if (relationNum > 0) {
    for (let i = 0; i < relationNum; i++) {
      transaction.add(new BBcRelation(new Uint8Array(0), version, idsLength));
    }
  }
  if (witness) {
    transaction.addWitness(new BBcWitness(version, idsLength));
  }
  return transaction;
}

export async function getRandomValue(length) {
  const msg = await jscu.random.getRandomBytes(length);
  return await jscu.hash.compute(msg, 'SHA-256');
}

export async function createPubkeyByte(pubkey) {
  const byteX = await jseu.encoder.decodeBase64Url(pubkey['x']);
  const byteY = await jseu.encoder.decodeBase64Url(pubkey['y']);
  const publicKey= new Uint8Array(65);
  publicKey[0] = 0x04;
  for (let i = 0; i < 32; i++) {
    publicKey[i + 1] = byteX[i];
    publicKey[i + 1 + 32] = byteY[i];
  }
  return publicKey;
}

export async function createAsset(userId, idsLength=IDsLength) {

  const bbcAsset = new BBcAsset(userId, idsLength);
  await bbcAsset.setRandomNonce();
  const assetFile = new Uint8Array(32);
  const assetBody = new Uint8Array(32);
  await bbcAsset.setAsset(assetFile, assetBody);

  return bbcAsset;
}

export async function createAssetWithoutFile(userId, idsLength=IDsLength) {

  const bbcAsset = new BBcAsset(userId, idsLength);
  await bbcAsset.setRandomNonce();

  const assetBody = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    assetBody[i] = 0xFF & (i + 32);
  }
  await bbcAsset.setAsset(null, assetBody);

  return bbcAsset;
}

export function hbo(num, len){
  const arr = new Uint8Array(len);
  for(let i=0; i<len; i++){
    arr[i] = 0xFF && (Math.floor(num/Math.pow(256, i)));
  }
  return arr;
}

export function hboToInt64(bin){

  let num = hboToInt32(bin);
  num = num + (bin[4] * 256 * 256 * 256 * 256);
  num = num + (bin[5] * 256 * 256 * 256 * 256 * 256 );
  num = num + (bin[6] * 256 * 256 * 256 * 256 * 256 * 256);
  num = num + (bin[7] * 256 * 256 * 256 * 256 * 256 * 256 * 256);
  return num;
}

export function hboToInt32(bin){
  let num = hboToInt16(bin);
  num = num + (bin[2] * 256 * 256);
  num = num + (bin[3] * 256 * 256 * 256);
  return num;
}

export function hboToInt16(bin){
  let num = 0;
  num = num + (bin[0]);
  num = num + (bin[1] * 256 );
  return num;
}

export function fromHexString (hexString){
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

export function concat(buf1, buf2) {
  // Checks for truthy values on both arrays
  if(!buf1 && !buf2) throw 'Please specify valid arguments for parameters buf1 and buf2.';

  if(!buf2 || buf2.length === 0) return buf1;
  if(!buf1 || buf1.length === 0) return buf2;

  let tmp = new Uint8Array(buf1.length + buf2.length);
  tmp.set(new Uint8Array(buf1), 0);
  tmp.set(new Uint8Array(buf2), buf1.length);
  return tmp;
}