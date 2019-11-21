This reposigory is originally from https://github.com/t-hashimoto249/js-bbclib

Name
=====
BBc-1(Beyond Block-chain One) Library, written in Javascript. 

# Overview
The library is implemented bbclib functions on platform of BBc-1.
It provides make transaction function, sign and verify transaction function, serialize and deserialize function for some collection of data on BBc-1 platform. (They are BBcTransaction, BBcEvent, BBcAsset, BBcSignature, BBcRelation, BBcReference, BBcCrossRef, BBcPointer and BBcWitness).
It works on modern browsers(Firefox, Edge, Chrome and Safari) and Node.js. 
The module is totally written in ES6+ and needed to get transpiled with babel for legacy environments.

※The design and detail of BBc-1 is following.

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
js-bbclibのAPIはmakeTransaction、loadTransaction、createKeyの３つである。それぞれの役割は、トランザクションの作成、トランザクションの読込、署名に利用する鍵の生成・読込である。
トランザクションの中身（eventやasset等）を設定する際には、makeTransactionの戻り値であるBBcTransactionのメソットを利用する。（set、addおよびcreateメソット等）
BBcTransactionのset、addおよびcreateメソットの一部の戻り値はPromise型となるので、利用する際にはawaitを利用する等注意が必要となる。

トランザクションの作成
以下の例で作成するトランザクションはメンバー変数として１つのBBcEvent、４つのBBcRelation、BBcWitnessおよび２つのBBcSignature（署名）を持つことを想定する。
BBcEventにはassetGroupIdとBBcAssetを設定する。
BBcRelationにはassetGroupIdを設定し、BBcAsset、BBcPointer、BBcAssetRaw、BBcAssetHashをそれぞれ設定する。
BBcWitnessには２つの署名の格納するユーザ情報としてuserIdsおよびsigIndicesを設定する。
BBcSignatureにはユーザ情報および署名の内容、公開鍵の情報を設定する。

```
transaction
  |-events
  |  |-events[0]
  |     |-asset
  |     |  |-userId
  |     |  |-assetBody
  |     |  |-assetFile
  |     |
  |     |-assetGroupId
  |     
  |-relations
  |  |-relations[0]
  |  |  |-asset
  |  |  |  |-userId
  |  |  |  |-assetBody
  |  |  |  |-assetFile
  |  |  |  
  |  |  |-assetGroupId 
  |  |    
  |  |-relations[1]
  |  |  |-pointers
  |  |  |  |-pointers[0]
  |  |  |     |-transactionId
  |  |  |  
  |  |  |-assetGroupId  
  |  |      
  |  |-relations[2]
  |  |  |-assetRaw  
  |  |  |  |-assetId
  |  |  |  |-assetBody
  |  |  |
  |  |  |-assetGroupId
  |  |     
  |  |-relations[3]
  |  |  |-assetHash 
  |  |  |  |-assetIds 
  |  |  |     |-assetIds[0]
  |  |  |        |-assetId
  |  |  |        
  |  |  |-assetGroupId
  |  |         
  |-witness        
  |  |-userIds        
  |  |  |-userIds[0]        
  |  |  |  |-userId  
  |  |  |      
  |  |  |-userIds[1]      
  |  |     |-userId   
  |  |        
  |  |-sigIndices
  |     |-sigIndices[0]      
  |     |  |-indice
  |     |  
  |     |-sigIndices[1]      
  |       |-indice
  |    
  |-signatures    
  |  |-signatures[0]   
  |  |  |-keyType  
  |  |  |-signature
  |  |  |-keyPair
  |  |   
  |  |-signatures[1]   
  |     |-keyType  
  |     |-signature
  |     |-keyPair
  |
  |-transactionId
```
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
transaction.relations[0].setAssetGroup(assetGroupId).createAsset(userId, assetBody, assetFile);　
transaction.relations[1].setAssetGroup(assetGroupId).createPointer(transactionId, assetId);
transaction.relations[2].setAssetGroup(assetGroupId).createAssetRaw(assetId, assetBody);
transaction.relations[3].setAssetGroup(assetGroupId).createAssetHash([assetId]);
transaction.events[0].setAssetGroup(assetGroupId).createAsset(userId, assetBody, assetFile).then((event) => event.addMandatoryApprover(userId)).then((event) => {console.log(event)});
transaction.addWitness(userId);
transaction.addWitness(userId);
await transaction.digest();

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
 
 const transactionBin = await transaction.pack();
 const transaction = await bbclib.loadTransactionBinary(transactionBin); 
 console.log(transaction.dump())
 
```

トランザクションのJSONデータの読み込み
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
 
 const transactionJSON = await transaction.dumpJSON();
 const transaction = await bbclib.loadTransactionJSON(transactionJSON); 
 console.log(transaction.dump())
 
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

transaction.witness.addWitness([userId])
await transaction.sign(userId, keypair);

```




# License
Licensed under the MIT license, see LICENSE file.

## keyword
BBc-1, Block-Chain, 
