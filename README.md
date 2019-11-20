This reposigory is originally from https://github.com/t-hashimoto249/js-bbclib

Name
=====
BBc-1(Beyond Block-chain One) Library, written in Javascript. 

# Overview
The library is implemented bbclib functions on platform of BBc-1.
It provides make transaction function, sign and verify transaction function, serialize and deserialize function for some collection of data on BBc-1 platform. (They are BBcTransaction, BBcEvent, BBcAsset, BBcSignature, BBcRelation, BBcReference, BBcCrossRef, BBcPointer and BBcWitness).
It works on modern browsers(Firefox, IE, Edge, Chrome and Safari) and Node.js. 
The module is totally written in ES6+ and needed to get transpiled with babel for legacy environments.

※The design and detail of BBc-1 is following.<br>
BBc-1: https://github.com/beyond-blockchain/bbc1

  
# Installation
At your project directory, do either one of the following.

・From npm/yarn:
```$xslt
$ npm install --save js-bbclib
$ yarn add js-bbclib
```

・From GitHub:
```$xslt
$ git clone https://github.com/beyond-blockchain/bbc1.git
```

# Feature in js-bbclib 

Numeber is a one of primitive type in standard javascript by ECMA.
By the standard document, the Number type has exactly 18437736874454810627 (that is, 264-253+3) values, representing the double-precision 64bit format IEEE 754-2008 values as specified in the IEEE Standard for Binary Floating-Point Arithmetic, except that the 9007199254740990 (that is, 253-2) distinct “Not-a-Number” values of the IEEE Standard are represented in Javascript. The timestamp value in BBcTransaction is defined by 64bit number type in the standard document. In that case, it can not process for the Number type and is used bn class. It is one of popular class for big number in javascript. 
bn.js: https://www.npmjs.com/package/bn.js

 
# Usage
トランザクションの作成
例ではトランザクションに４つのBBcRelationおよび１つのBBcEvent、BBcWitnessを入れ込むことを想定する。
まずはじめにmakeTransaction関数を必要なパラメータ呼び、BBcTransactionクラスを生成する。
BBcRelationにはBBcAsset、BBcPointer、BBcAssetRaw、BBcAssetHashをいれる。
BBcRelation[0]にはBBcAssetをセットする。
BBcRelation[1]にはBBcPointerをセットする。
BBcRelation[2]にはBBcAssetRawをセットする。
BBcRelation[3]にはBBcAssetHashをセットする。
BBcEvent[0]にはBBcAssetをセットした後、mandatoryApproverをセットする。


```
import * as bbclib from 'js-bbclib.js'

const versoin = 2.0;
const IDsLength = {
  transactionId: 32,
  assetGroupId: 32,
  userId: 32,
  assetId: 32,
  nonce: 32
};
const numberOfEvent = 1;
const numberOfRelation = 4;
const transaction = await bbclib.makeTransaction(numberOfEvent, numberOfRelation, true, versoin, IDsLength); 
transaction.relations[0].setAssetGroupId(assetGroupId).createAsset(userId, assetBody, assetFile);　
transaction.relations[1].setAssetGroupId(assetGroupId).createPointer(transactionId, assetId);
transaction.relations[2].setAssetGroupId(assetGroupId).createAssetRaw(assetId, assetBody);
transaction.relations[3].setAssetGroupId(assetGroupId).createAssetHash([assetId]);
await transaction.events[0].setAssetGroupId(assetGroupId).createAsset(userId, assetBody, assetFile).then((event) => {event.addMandatoryApprover(userId);});
transaction.witness.addWitness(userId);
transaction.setTransactionId();

const transactionBin = await transaction.pack();

```

トランザクションのバイナリデータの読み込み
 ```
 import * as bbclib from 'js-bbclib.js'
 
 const transactionBin;
 const versoin = 2.0;
 const IDsLength = {
   transactionId: 32,
   assetGroupId: 32,
   userId: 32,
   assetId: 32,
   nonce: 32
 };
 
 const transaction = await bbclib.loadTrnasaction(transactionBin versoin, IDsLength); 
 
 ```

鍵の読み込みおよびトランザクションへのsign
トランザクション関数のsignメソッドを呼ぶことで実現
```
import * as bbclib from 'js-bbclib.js'

const keypair = bbclib.createKeypair(); 
keypair.setKeyPair('jwk', jwkPublickey, jwkPrivateKey)
keypair.setKeyPair('pem', pemPublickey, pemPrivateKey)
keypair.setKeyPair('der', derPublickey, darPrivateKey)
keypair.setKeyPair('oct', octPublickey, octPrivateKey, {namedCurve: 'P-256'})

const transaction = await bbclib.makeTransaction(1, 1, true, versoin, IDsLength); 

~
~
~

await transaction.sign(userId, keypair);

```




# License
Licensed under the MIT license, see LICENSE file.

## keyword
BBc-1, Block-Chain, 
