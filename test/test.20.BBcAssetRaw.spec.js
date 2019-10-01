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

describe(`${envName}: Test BBcAssetRaw`, () => {
  console.log('***********************');
  console.log('Test for BBcAssetRaw Class.');

  it('pack and unpack', async () => {
    const id_length = 32;
    const asset_id = await jscu.random.getRandomBytes(32);
    const asset_body = await jscu.random.getRandomBytes(512);
    const asset_raw_for_pack = new bbclib.BBcAssetRaw(id_length);
    asset_raw_for_pack.set_asset(asset_id, asset_body);
    const pack_asset_raw = asset_raw_for_pack.pack();

    const asset_raw_for_unpack = new bbclib.BBcAssetRaw(id_length);
    await asset_raw_for_unpack.unpack(pack_asset_raw);

    // console.log("----------");
    // asset_raw_for_pack.show_asset();
    // console.log("----------");
    // asset_raw_for_unpack.show_asset();

    expect_uint8Array(asset_raw_for_pack.asset_id,asset_raw_for_unpack.asset_id);
    expect_uint8Array(asset_raw_for_pack.asset_body,asset_raw_for_unpack.asset_body);
    expect( asset_raw_for_pack.asset_body_size,asset_raw_for_unpack.asset_body_size);
  });
});

function expect_uint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}
