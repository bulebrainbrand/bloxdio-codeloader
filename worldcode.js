const useCallback = [
"onPlayerJump","onPlayerLeave","onAllCodeLoaded",
]

const loadCodeBlockDataPos = [40000,40000,40000]

const globalDataBase = {}

var importData = (name) => {
  return globalDataBase[name]
  }

var exportData = (name,data) => {
  globalDataBase[name] = data
  }

var LoadCodeBlockManager = class{
  static #loadCodeBlock = new Set()

  static add(key){
    LoadCodeBlockManager.#loadCodeBlock.add(key)
    }

  static has(key){
    return LoadCodeBlockManager.#loadCodeBlock.has(key)
    }

  static clear(){
    LoadCodeBlockManager.#loadCodeBlock.clear()
    }
  }

var Logger = class{

  static error(e,systemName,mes){
    let errorText = ""
    if(typeof e === "object"){
      errorText+=e.name
      errorText+=":"
      errorText+=e.message
      errorText+="\n"
      errorText+=e.stack
      }
    else{
      errorText = e
      }
    console.log(`🔴[error][${systemName}]${mes}  ${errorText}`)
    }
  }


const systemCallback = [
"tick","playerCommand",
]

let callbackManagers = {}

const CallbackManager = class{
  
  #name
  #codes

  constructor(name){
    this.#name = name
    this.#codes = []
    }

  addCode(func,key,pos){
    this.#codes.push({func,key,pos})
    }

  call(...arg){
    if(loaded)this.#run(arg)
    }
  
  #run(arg){
    for(const {func,key,pos} of this.#codes){
      try{
        const value = func(...arg)
        if(value != null)return value
      }catch(e){
        Logger.error(e,this.#name,`failed #run.pos : ${pos} key : ${key}`)
        }
      }
    }

  clear(){
    this.#codes = []
    }

  get(){
    return this.#codes
    }
  }

for(const name of useCallback){
  globalThis[name] = (...arg) => {
    return callbackManagers[name].call(...arg)
    }
  callbackManagers[name] = new CallbackManager(name)
  }

for(const name of systemCallback){
  callbackManagers[name] = new CallbackManager(name)
  }

var addCallbackCode = (name,key,code,pos) => {
  if(!Object.hasOwn(callbackManagers,name))throw new TypeError(`unexpected callback name:${name}`)
  callbackManagers[name].addCode(code,key,pos)
  }

var loaded = false

let loadedCount = 0

let loadStarted = false

let needLoadAmount = 0

AsyncChain = class{

  #chain
  constructor(func){
    this.#chain = []
    func((...arg) => this.#next("then",...arg),(...arg) => this.#next("catch",...arg))
    }

  then(func){
    this.#chain.push({func,type:"then"})
    return this
    }

  catch(func){
    this.#chain.push({func,type:"catch"})
    return this
    }

  #next(type,...value){
    setTimeout(() => {
      while(1){
        if(this.#chain.length === 0)break;
        if(this.#chain[0].type !== type){
          this.#chain.shift()
          continue;
          }
        const func = this.#chain[0].func
        this.#chain.shift()
        func((...arg) => this.#next("then",...arg),(...arg) => this.#next("catch",...arg),...value)
        break;
        }
      },1)
    }
  }

let timeoutQueue = []

var runningGene = []

var setTimeout = (func,time,...args) => {
  const funcRunTime = api.now() + time
  add: {
    for(let i = 0;i<timeoutQueue.length;i++){
      const {runTime} = timeoutQueue[i]
      if(funcRunTime <= runTime){
        timeoutQueue.splice(i,0,{runTime:funcRunTime,func,interval:null,args})
        break add;
        }
      }
    timeoutQueue.push({runTime:funcRunTime,func,interval:null,args:args})
    }
  }

var setInterval = (func,interval,...args) => {
  const funcRunTime = api.now() + interval
  add: {
    for(let i = 0;i<timeoutQueue.length;i++){
      const {runTime} = timeoutQueue[i]
      if(funcRunTime <= runTime){
        timeoutQueue.splice(i,0,{runTime:funcRunTime,func,interval:interval,args})
        break add;
        }
      }
    timeoutQueue.push({runTime:funcRunTime,func,interval:interval,args:args})
    }
  }

var waitLoadBlock = (pos) => (
  (resolve,reject) => {
  runningGene.push((function* (resolve,pos){
    while(!api.isBlockInLoadedChunk(...pos)){
      yield api.getBlock(pos)
      }
    resolve()
    })(resolve,pos))
    }
  )

var loadCodeBlock = (pos) => {
  new AsyncChain(waitLoadBlock(pos))
  .then((resolve,reject) => {
    thisPos = pos
    try{
      eval(api.getBlockData(...pos)?.persisted?.shared?.text)
      }
    catch(e){
      Logger.error(e,"eval codeblock code",`pos : ${pos}`)
      }
    loadedCount += 1
    if(needLoadAmount === loadedCount){
      loadedFunc()
      }
    })
  }

var LoadCodeDataManager = class{
  static #instance

  constructor(){
    if(LoadCodeDataManager.#instance)return LoadCodeDataManager.#instance;
    LoadCodeDataManager.#instance = this
    }

  add(pos){
    new AsyncChain(waitLoadBlock(loadCodeBlockDataPos))
    .then(() => {
      let data = api.getBlockData(...loadCodeBlockDataPos)?.persisted?.shared?.loadCodeBlock ?? []
      data = data.filter(pos2 => !pos2.every((num,i) => num === pos[i]))
      data.push(pos)
      api.setBlockData(...loadCodeBlockDataPos,{persisted:{shared:{loadCodeBlock:data}}})
      })
    }

  delete(pos){
    new AsyncChain(waitLoadBlock(loadCodeBlockDataPos))
    .then(() => {
      let data = api.getBlockData(...loadCodeBlockDataPos)?.persisted?.shared?.loadCodeBlock ?? []
      data = data.filter(pos2 => !pos2.every((num,i) => num === pos[i]))
      api.setBlockData(...loadCodeBlockDataPos,{persisted:{shared:{loadCodeBlock:data}}})
      })
    }
  }

const loadedFunc = () => {
  loaded = true
  if(useCallback.includes("onPlayerJoin")){
    for(const [id,i] of api.getPlayerIds().entries()){
      setTimeout(() => callbackManagers.onPlayerJoin.call(id),i*25+1)
      }
    }
  if(useCallback.includes("onAllCodeLoaded")){
    callbackManagers.onAllCodeLoaded.call()
    }
  }

tick = () => {
  const now = api.now()
  while(true){
    if(timeoutQueue.length === 0)break;
    if(timeoutQueue[0].runTime > now)break;
    const {runTime,func,interval,args} = timeoutQueue[0]
    timeoutQueue.shift()
    if(interval != null)setInterval(func,interval,...args);
    try{
      func(...args)
      }
    catch(e){
      Logger.error(e,"tick","async running")
      }
    }
  try{
    runningGene = runningGene.filter(func => !func.next().done)
    }
  catch(e){
    Logger.error(e,"tick","gene running")
    }
  if(!loadStarted){
    new AsyncChain(waitLoadBlock(loadCodeBlockDataPos))
    .then((resolve) => {
      try{
        const data = api.getBlockData(...loadCodeBlockDataPos)?.persisted?.shared?.loadCodeBlock ?? []
        needLoadAmount = data.length
        if(data.length === 0){
          loadedFunc()
          return;
          }
        for(const [i,pos] of data.entries()){
          setTimeout(() => {loadCodeBlock(pos)},i*100)
          }
        }
      catch(e){
        Logger.error(e,"tick","loading")
        }
      })
    loadStarted = true
    }
  return callbackManagers.tick.call()
  }

playerCommand = (id,com) => {
  const lowerCom = com.toLowerCase()
  if(api.getClientOption(id,"canEditCode")){
    if(lowerCom === "reload"){
      for(const manager of Object.values(callbackManagers)){
        manager.clear()
        }
      loaded = false
      loadStarted = false
      loadedCount = 0
      LoadCodeBlockManager.clear()
      timeoutQueue = []
      runningGene = []
      globalDataBase = {}
      return true
      }
    if(lowerCom === "status"){
      let text = []
      text.push(`loaded:${loaded}\nloadStarted:${loadStarted}\n`)
      for(const [name,manager] of Object.entries(callbackManagers)){
        const funcs = manager.get()
        text.push(`\n[ ${name} ]\n`)
        const funcsText = funcs.map(({key,pos}) => `┣[${key}]  [${pos}]`).join("\n")
        text.push(funcsText)
        }
      api.sendMessage(id,text)
      return true
      }
    }
  return callbackManagers.playerCommand.call(id,com)
  }



