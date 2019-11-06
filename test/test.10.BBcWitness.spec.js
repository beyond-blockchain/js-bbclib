import chai from 'chai';
import {getTestEnv} from './prepare.js';
import jscu from 'js-crypto-utils';
import * as helper from '../src/helper';
import {idsLength} from '../src/bbcClass/idsLength';
import {BBcWitness} from '../src';

const expect = chai.expect;
const env = getTestEnv();
const bbclib = env.library;
const envName = env.envName;

describe(`${envName}: Test BBcWitness`, () => {
  it('pack and unpack', async () => {
    // eslint-disable-next-line no-console
    console.log('***********************');
    // eslint-disable-next-line no-console
    console.log('Test for BBcWitness Class');

    const witness = new BBcWitness(idsLength);
    const witnessUnpack = new BBcWitness(idsLength);

    witness.addSigIndices(0);
    const userId0 = await jscu.random.getRandomBytes(32);
    witness.addUserId(userId0);

    witness.addSigIndices(1);
    const userId1 = await jscu.random.getRandomBytes(32);
    witness.addUserId(userId1);

    const witnessBin = witness.pack();
    await witnessUnpack.unpack(witnessBin);

    expect(witnessUnpack.sigIndices[0]).to.be.eq(0);
    expect(witnessUnpack.userIds[0]).to.be.eql(userId0);
    expect(witnessUnpack.sigIndices[1]).to.be.eq(1);
    expect(witnessUnpack.userIds[1]).to.be.eql(userId1);
  });

  it('dump', async () => {
    const witness = new BBcWitness(idsLength);
    witness.addSigIndices(0);
    const userId0 = await jscu.random.getRandomBytes(32);
    witness.addUserId(userId0);

    witness.addSigIndices(1);
    const userId1 = await jscu.random.getRandomBytes(32);
    witness.addUserId(userId1);
    const dump = witness.dump();
    expect(dump).to.be.not.eq(null);
  });

  it('load witness hex string ', async () => {
    const witnessHexString = '020020005e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b847650200002000d7b571c2e4e2e2c18b73ae78e522b542c7964d8a29728cca906099089b76e7850100';
    const witnessData = helper.fromHexString(witnessHexString);
    const witnessUnpack = new BBcWitness(idsLength);
    await witnessUnpack.unpack(witnessData);

    expect(witnessUnpack.sigIndices[0]).to.be.eq(0);
    const userId0HexString = '5e64bb946e38aa0dd3dce77abe38f017834bf1e32c2de1ced4bce443b8476502';
    const userId0Data = helper.fromHexString(userId0HexString);
    expect(witnessUnpack.userIds[0]).to.be.eql(userId0Data);
    expect(witnessUnpack.sigIndices[1]).to.be.eq(1);
    const userId1HexString = 'd7b571c2e4e2e2c18b73ae78e522b542c7964d8a29728cca906099089b76e785';
    const userId1Data = helper.fromHexString(userId1HexString);
    expect(witnessUnpack.userIds[1]).to.be.eql(userId1Data);
  });

});
