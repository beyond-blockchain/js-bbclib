import chai from 'chai';
const expect = chai.expect;
import jscu from 'js-crypto-utils';
import jseu from 'js-encoding-utils';
import { Buffer } from 'buffer';
import * as helper from '../src/helper';

import {getTestEnv} from './prepare.js';
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcAssetHash`, () => {
  console.log('***********************');
  console.log('Test for BBcAssetHash Class.');

  it('pack and unpack', async () => {
    const id_length = 32;
    const asset_id_1 = await jscu.random.getRandomBytes(32);
    const asset_id_2 = await jscu.random.getRandomBytes(32);
    const asset_id_3 = await jscu.random.getRandomBytes(32);
    const asset_hash_for_pack = new bbclib.BBcAssetHash(id_length);
    asset_hash_for_pack.add_asset_id(asset_id_1);
    asset_hash_for_pack.add_asset_id(asset_id_2);
    asset_hash_for_pack.add_asset_id(asset_id_3);
    const pack_asset_hash = asset_hash_for_pack.pack();
    const asset_hash_for_unpack = new bbclib.BBcAssetHash(id_length);
    await asset_hash_for_unpack.unpack(pack_asset_hash);

    // console.log("----------");
    // asset_hash_for_pack.show_asset();
    // console.log("----------");
    // asset_hash_for_unpack.show_asset();

    expect_uint8Array(asset_hash_for_pack.asset_ids[0],asset_hash_for_unpack.asset_ids[0]);
    expect_uint8Array(asset_hash_for_pack.asset_ids[1],asset_hash_for_unpack.asset_ids[1]);
    expect_uint8Array(asset_hash_for_pack.asset_ids[2],asset_hash_for_unpack.asset_ids[2]);
  });
});

function expect_uint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
