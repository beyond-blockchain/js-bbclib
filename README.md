This reposigory is originally from https://github.com/t-hashimoto249/js-bbclib

Name
=====
BBc-1(Beyond Block-chain One) Library, written in Javascript. 

# Overview
The library is implemented bbclib functions on platform of BBc-1.
It provides make transaction function, load binary transaction function, load json transaction function and create key pair function.
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
$ git clone https://github.com/beyond-blockchain/js-bbclib.git
```

# Feature in js-bbclib 

Numeber is a one of primitive type in standard javascript by ECMA.
By the standard document, the Number type has exactly 18437736874454810627 (that is, 264-253+3) values. 
The timestamp value in BBcTransaction is defined by 64bit number type. In that case, it can not process for the Number type. Therefore it is used bn class that is one of popular for big number in javascript. 
bn.js: https://www.npmjs.com/package/bn.js
 
# Usage

## make transaction sequence
The example transaction has one event, four relations, witness and a signature. 
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
  |     |-assetHash 
  |     |  |-assetIds 
  |     |     |-assetIds[0]
  |     |        |-assetId
  |     |        
  |     |-assetGroupId
  |           
  |-witness        
  |  |-userIds        
  |  |  |-userIds[0]        
  |  |     |-userId  
  |  |         
  |  |        
  |  |-sigIndices
  |     |-sigIndices[0]      
  |        |-indice
  |    
  |-signatures    
  |  |-signatures[0]   
  |     |-keyType  
  |     |-signature
  |     |-keyPair
  |     
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
await transaction.sign(userId, keypair);
await transaction.digest();

```

## load binary transaction 
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
 
 const BinTransaction = await transaction.pack();
 const transaction = await bbclib.loadBinaryTransaction(BinTransaction); 
 console.log(transaction.dump())
 
```


## load json transaction
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
 const transaction = await bbclib.loadJSONTransaction(JSONtransaction); 
 
 transactionJSON = 
 {
 	"idsLength": {
 		"transactionId": 32,
 		"assetGroupId": 32,
 		"userId": 32,
 		"assetId": 32,
 		"nonce": 32
 	},
 	"version": 2,
 	"timestamp": "15da98666865d540",
 	"events": [
 		{
 			"idsLength": {
 				"transactionId": 32,
 				"assetGroupId": 32,
 				"userId": 32,
 				"assetId": 32,
 				"nonce": 32
 			},
 			"version": 2,
 			"assetGroupId": "3448171b0d4e74c550fa06d26de7a8115c603494c7fb881a93fb02fc31f872a3",
 			"referenceIndices": [],
 			"mandatoryApprovers": [
 				"0d0dc297ccbc9bcf1992a8b79571378ddb1601c5a191ed82a945996b649764d7",
 				"0d0dc297ccbc9bcf1992a8b79571378ddb1601c5a191ed82a945996b649764d7"
 			],
 			"optionApproverNumNumerator": 0,
 			"optionApproverNumDenominator": 0,
 			"optionApprovers": [],
 			"asset": {
 				"idsLength": {
 					"transactionId": 32,
 					"assetGroupId": 32,
 					"userId": 32,
 					"assetId": 32,
 					"nonce": 32
 				},
 				"version": 2,
 				"userId": "0d0dc297ccbc9bcf1992a8b79571378ddb1601c5a191ed82a945996b649764d7",
 				"assetId": "6731e816bd9d5f3e86320a1e50a28940d549ba7659b864eab483ea0a618c6c08",
 				"nonce": "0000000000000000000000000000000000000000000000000000000000000000",
 				"assetFile": "",
 				"assetFileDigest": "886206aed2ece342f8529e8d26703a63f27e09b52dfd20e12f67b32e60ac7fa9",
 				"assetFileSize": 32,
 				"assetBodyType": 0,
 				"assetBodySize": 32,
 				"assetBody": "bcc1bd6608e84edd647a526e7294980a56d2915c3186957094d47481a4b6c578"
 			}
 		}
 	],
 	"references": [],
 	"relations": [
 		{
 			"idsLength": {
 				"transactionId": 32,
 				"assetGroupId": 32,
 				"userId": 32,
 				"assetId": 32,
 				"nonce": 32
 			},
 			"version": 2,
 			"assetGroupId": "3448171b0d4e74c550fa06d26de7a8115c603494c7fb881a93fb02fc31f872a3",
 			"pointers": [],
 			"asset": {
 				"idsLength": {
 					"transactionId": 32,
 					"assetGroupId": 32,
 					"userId": 32,
 					"assetId": 32,
 					"nonce": 32
 				},
 				"version": 2,
 				"userId": "0d0dc297ccbc9bcf1992a8b79571378ddb1601c5a191ed82a945996b649764d7",
 				"assetId": "6731e816bd9d5f3e86320a1e50a28940d549ba7659b864eab483ea0a618c6c08",
 				"nonce": "0000000000000000000000000000000000000000000000000000000000000000",
 				"assetFile": "",
 				"assetFileDigest": "886206aed2ece342f8529e8d26703a63f27e09b52dfd20e12f67b32e60ac7fa9",
 				"assetFileSize": 32,
 				"assetBodyType": 0,
 				"assetBodySize": 32,
 				"assetBody": "bcc1bd6608e84edd647a526e7294980a56d2915c3186957094d47481a4b6c578"
 			}
 		},
 		{
 			"idsLength": {
 				"transactionId": 32,
 				"assetGroupId": 32,
 				"userId": 32,
 				"assetId": 32,
 				"nonce": 32
 			},
 			"version": 2,
 			"assetGroupId": "3448171b0d4e74c550fa06d26de7a8115c603494c7fb881a93fb02fc31f872a3",
 			"pointers": [
 				{
 					"idsLength": {
 						"transactionId": 32,
 						"assetGroupId": 32,
 						"userId": 32,
 						"assetId": 32,
 						"nonce": 32
 					},
 					"version": 2,
 					"transactionId": "afeba37557d6bbf5c0ee6bc0a6f8e94c86ff37886946a8fec697b063f93873a6",
 					"assetId": "d1eef5f00020ada399cad01b8007c5284ad84c67c9b72abdd412e76bf9151c1d"
 				}
 			]
 		},
 		{
 			"idsLength": {
 				"transactionId": 32,
 				"assetGroupId": 32,
 				"userId": 32,
 				"assetId": 32,
 				"nonce": 32
 			},
 			"version": 2,
 			"assetGroupId": "3448171b0d4e74c550fa06d26de7a8115c603494c7fb881a93fb02fc31f872a3",
 			"pointers": [],
 			"assetRaw": {
 				"idsLength": {
 					"transactionId": 32,
 					"assetGroupId": 32,
 					"userId": 32,
 					"assetId": 32,
 					"nonce": 32
 				},
 				"version": 2,
 				"assetId": "d1eef5f00020ada399cad01b8007c5284ad84c67c9b72abdd412e76bf9151c1d",
 				"assetBody": "bcc1bd6608e84edd647a526e7294980a56d2915c3186957094d47481a4b6c578",
 				"assetBodySize": 32
 			}
 		},
 		{
 			"idsLength": {
 				"transactionId": 32,
 				"assetGroupId": 32,
 				"userId": 32,
 				"assetId": 32,
 				"nonce": 32
 			},
 			"version": 2,
 			"assetGroupId": "3448171b0d4e74c550fa06d26de7a8115c603494c7fb881a93fb02fc31f872a3",
 			"pointers": [],
 			"assetHash": {
 				"idsLength": {
 					"transactionId": 32,
 					"assetGroupId": 32,
 					"userId": 32,
 					"assetId": 32,
 					"nonce": 32
 				},
 				"version": 2,
 				"assetIds": [
 					"d1eef5f00020ada399cad01b8007c5284ad84c67c9b72abdd412e76bf9151c1d"
 				]
 			}
 		}
 	],
 	"witness": {
 		"idsLength": {
 			"transactionId": 32,
 			"assetGroupId": 32,
 			"userId": 32,
 			"assetId": 32,
 			"nonce": 32
 		},
 		"version": 2,
 		"userIds": [
 			"0d0dc297ccbc9bcf1992a8b79571378ddb1601c5a191ed82a945996b649764d7"
 		],
 		"sigIndices": [
 			0
 		]
 	},
 	"crossRef": null,
 	"signatures": [
 		{
 			"keyType": 2,
 			"signature": "e0cac3e0ba8f5a942129116a54c593157d0ebac9cd129da8e58094dd6025e56cfee060fbcab6e3fd611ba111491bc83a124befead0fb043705ab102a00722f05",
 			"keypair": {
 				"keyType": 2,
 				"publicKey": {
 					"kty": "EC",
 					"crv": "P-256",
 					"x": "8BVYllpkpfKwCuY1E6xchUVjuUvvoywcOobasONzod0",
 					"y": "ta3-3l9NzVQk9Va8zQF1GgEOMp5s9D_4978a6onqt5k"
 				}
 			}
 		}
 	],
 	"useridSigidxMapping": {
 		"13,13,194,151,204,188,155,207,25,146,168,183,149,113,55,141,219,22,1,197,161,145,237,130,169,69,153,107,100,151,100,215": 0
 	}
 }

```

## create key
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


make transaction load
Application Interface for js-bbclib 
js-bbclibのAPIはmakeTransaction、loadTransaction、createKeyの３つである。それぞれの役割は、トランザクションの作成、トランザクションの読込、署名に利用する鍵の生成・読込である。
トランザクションの中身（eventやasset等）を設定する際には、makeTransactionの戻り値であるBBcTransactionのメソットを利用する。（set、addおよびcreateメソット等）
BBcTransactionのset、addおよびcreateメソットの一部の戻り値はPromise型となるので、利用する際にはawaitを利用する等注意が必要となる。

Make transaction

The API provides make BBcTransaction 

以下の例で作成するトランザクションはメンバー変数として１つのBBcEvent、４つのBBcRelation、BBcWitnessおよび２つのBBcSignature（署名）を持つことを想定する。
BBcEventにはassetGroupIdとBBcAssetを設定する。
BBcRelationにはassetGroupIdを設定し、BBcAsset、BBcPointer、BBcAssetRaw、BBcAssetHashをそれぞれ設定する。
BBcWitnessには２つの署名の格納するユーザ情報としてuserIdsおよびsigIndicesを設定する。
BBcSignatureにはユーザ情報および署名の内容、公開鍵の情報を設定する。



トランザクションのバイナリデータの読み込み

トランザクションのJSONデータの読み込み


鍵の読み込みおよびトランザクションへのsign





# License
Licensed under the MIT license, see LICENSE file.

## keyword
BBc-1, Block-Chain, 
