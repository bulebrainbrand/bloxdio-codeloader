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
* @param {string} callbackname
* @param {string} key
* @param {function} code
* @param {array(3 number item)} pos
* @returns {void}
*/
addCallbackCode(name,key,code,pos)
```
例:
```js
addCallbackCode("tick","test",() => api.log(1),[0,0,0])
```
コールバックを宣言し、コードを追加できるようにするには、ワールドコードの上にあるuseCallbackに名前を追加します

```js
const useCallback = ["onPlayerJoin","onPlayerClick"]
```

```/status```で登録されているコールバックなどを見れます。
### codeblockのロード関連

読み込みするcodeblockを追加するには、LoadCodeDataManagerを使います
LoadCodeDataManagerはシングルトンデザインなため、newをつけて使用します
```js

/**
* @param {array(3 number item)} pos
* @returns {void}
*/
(new LoadCodeDataManager).add(pos)

/**
* @param {array(3 number item)} pos
* @returns {void}
*/
(new LoadCodeDataManager).delete(pos)

```
例えば、以下のコードが書かれたcodeblockの2マス下にあるcodeblockを自動で読み込むようにするには、以下のように書きます

```js
const [x,y,z] = thisPos
(new LoadCodeDataManager).add([x,y-2,z])
```

> [!IMPORTANT]
>LoadCodeDataManagerには非同期処理が用いられています
### exportData,importData
情報をグローバルスコープを汚染せずに受け渡すための機能です
```js
/**
* @param {string} key
* @returns {any}
*/
importData(key)

/**
* @param {string} key
* @param {any} upload data
* @returns {void}
*/
exportData(key,uploaddata)
```

### LoadCodeBlockManager
読み込んだcodeblockを識別し、前提となるコードの導入や複数機能の連携の切り替え、モックなどに使えます
LoadCodeBlockManagerはユーティリティのデザインなので、静的メソッドとしてアクセスしてください
また、読み込み順が保証されないので、後述のonAllCodeLoadedや、他の方法で遅延評価してください
```js
/**
* @param {string} name
* @returns {void}
*/
LoadCodeBlockManager.add(name)

/**
* @param {string} name
* @returns {boolean}
*/
LoadCodeBlockManager.has(name)
```
### onAllCodeLoaded
オリジナルのコールバックで、全てのcodeblockが読み込まれた時に呼び出されます<br>
扱いはその他の標準的なコールバックと同じように使えます<br>
引数は何も渡されません

### その他の機能
```/reload```でコードをリロードします。

[asyncchain](https://github.com/bulebrainbrand/bloxdio-asyncChain)を実装しています
