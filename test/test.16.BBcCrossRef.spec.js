import chai from 'chai';
import {getTestEnv} from './prepare.js';
import * as helper from '../src/helper';
import jseu from 'js-encoding-utils';
const expect = chai.expect;
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcCrossRef`, () => {

  it('pack and unpack', async () => {
    // eslint-disable-next-line no-console
    console.log('***********************');
    // eslint-disable-next-line no-console
    console.log('Test for BBcCrossRef Class');

    const crossRef = new bbclib.BBcCrossRef(null, null);
    const domainId = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      domainId[i] = 0xFF & (i + 8);
    }

    const transactionId = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
      transactionId[i] = 0xFF & (i + 16);
    }

    crossRef.setDomainId(domainId);
    crossRef.setTransactionId(transactionId);

    const crossRefBin = crossRef.pack();
    const crossRefUnpack = new bbclib.BBcCrossRef(null, null);
    await crossRefUnpack.unpack(crossRefBin);

    expectUint8Array(crossRef.domainId, crossRefUnpack.domainId);
    expectUint8Array(crossRef.transactionId, crossRefUnpack.transactionId);
  });

  it('load crossref hex string ', async () => {
    const crossref_hex_string = '200016347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33200070bad87b2799a237a1144cc6e898b2a29c3a27c0761cf7b9438d27d4d47a65af';
    const crossref_data = helper.fromHexString(crossref_hex_string);

    const crossRefUnpack = new bbclib.BBcCrossRef(null, null);
    await crossRefUnpack.unpack(crossref_data);

    expect(jseu.encoder.arrayBufferToHexString(crossRefUnpack.domainId)).to.be.eq('16347198acdeed2b6e90715e6f50ba6e8e2728135c7af36aa9903a2b8b834c33');
    expect(jseu.encoder.arrayBufferToHexString(crossRefUnpack.transactionId)).to.be.eq('70bad87b2799a237a1144cc6e898b2a29c3a27c0761cf7b9438d27d4d47a65af');
  });
});

function expectUint8Array(bin1, bin2){
  expect(jseu.encoder.arrayBufferToHexString(bin1)).to.be.eq(jseu.encoder.arrayBufferToHexString(bin2));
}

