import ScStorage, { StorageType } from './../src/index.js'

const options = { STORAGE_TYPE: StorageType.INDEXEDDB }
const scStorage = new ScStorage(options)

scStorage.write('todos', { todo: 'Gassie gehen' }, { expires: new Date(new Date().getTime() + 10000), databaseName: 'TodoDatabase' })
const data = await scStorage.read('todos', { id: 76, asObject: true, databaseName: 'TodoDatabase' })
console.log(data)
