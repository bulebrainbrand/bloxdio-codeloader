# bloxdio-codeloader
## 概要
サーバー起動時に自動的にコードブロックを発動させたり、コードブロックでコールバック関数のコードを追加できるようにすることで、ワールドコードの文字数制限の突破、オブジェクト指向プログラミングの難易度の低下,共同開発の支援、エラー修正の容易化などが可能
## 使い方
ワールドコードを開き、最初にある10数行のものを消して[worldcode.js](worldcode.js)を貼り付けます。
## 何が使えるのか？
### callback関係

コールバックで発動するコードを追加する際にはこれを使います

```js
/**
* @param {String} callbackname
* @param {String} key
* @param {Function} code
* @param {Array(3 number item)} pos 
*/
addCallbackCode(name,key,code,pos)
```
例:
```js
addCallbackCode("tick","test",() => api.log(1),[0,0,0])
```

