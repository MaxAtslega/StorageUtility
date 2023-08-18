import StorageUtility, { StorageType } from './../src/index.js'

const options = { STORAGE_TYPE: StorageType.INDEXEDDB }
const storageUtility = new StorageUtility(options)

storageUtility.write('todos', { todo: 'Gassie gehen' }, { expires: new Date(new Date().getTime() + 10000), databaseName: 'TodoDatabase' })
const data = await storageUtility.read('todos', { id: 76, asObject: true, databaseName: 'TodoDatabase' })
console.log(data)
