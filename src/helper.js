import { BBcAsset } from './bbcClass/BBcAsset';
import {getJscu} from './env.js';
import {IDsLength} from './bbcClass/idsLength';

const jscu = getJscu();

export async function getRandomValue(length) {
  const msg = await jscu.random.getRandomBytes(length);
  return await jscu.hash.compute(msg, 'SHA-256');
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

export function sboToInt16(bin){
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
