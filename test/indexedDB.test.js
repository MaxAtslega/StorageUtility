import { describe, expect, it } from 'vitest'
import ScStorage, { StorageType } from './../src/index.js'

describe('cookies', () => {
  it('write ', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.SESSION_STORAGE, INDEXEDDB_ENABLE: true })

    const response = await scStorage.write('todos', { message: 'Hello World' }, {
      storageType: StorageType.INDEXEDDB,
      expires: new Date(32535212400000),
      database: 'TodoDatabase'
    })
    expect(response).eq(true)

    const response2 = await scStorage.write('todos', { todo: 'Walking' }, {
      storageType: StorageType.INDEXEDDB,
      expires: new Date(32535212400000),
      indexes: [
        { indexKey: 'todo', indexName: 'todo', indexOptions: { unqiue: false, multiEntry: true } },
        { indexKey: 'friends', indexName: 'friends', indexOptions: { unqiue: false, multiEntry: true } }
      ]
    })
    expect(response2).eq(true)
  })
  it('update ', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB })

    const response = await scStorage.write('todos', { todo: 'Jumping', friends: ['Tom'], id: 1 }, {
      expires: new Date(32535212400002),
      update: true
    })
    expect(response).eq(true)
  })
  it('getById', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.read('todos', { asObject: false, id: 1, database: 'TodoDatabase' })
    expect(response.message).eq('Hello World')

    const response2 = await scStorage.read('todos', { asObject: false, id: 1 })
    expect(response2.todo).eq('Jumping')
    expect(response2.friends[0]).eq('Tom')
  })

  it('getAllItems', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.read('todos', { asObject: false })
    expect(response[0].todo).eq('Jumping')
    expect(response[0].friends[0]).eq('Tom')
  })

  it('getItemsByIndexAndValue', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.read('todos', { asObject: true, index: 'friends', nameValue: 'Tom' })
    expect(response.data.todo).eq('Jumping')
    expect(response.data.friends[0]).eq('Tom')
  })

  it('hasById', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.has('todos', { id: 1, database: 'TodoDatabase' })
    expect(response).eq(true)

    const response2 = await scStorage.has('todos', { id: 1 })
    expect(response2).eq(true)
  })

  it('hasItems', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.has('todos')
    expect(response).eq(true)
  })

  it('hasItemsByIndexAndValue', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB, AS_OBJECT: true })

    const response = await scStorage.has('todos', { index: 'friends', nameValue: 'Tom' })
    expect(response).eq(true)
  })

  it('delete', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB })

    // Delete data with id 1
    const response = await scStorage.delete(1, { storeName: 'todos' })
    expect(response).eq(true)

    const responseHas = await scStorage.has('todos', { id: 1 })
    expect(responseHas).eq(false)

    const response1 = await scStorage.delete(1, { storeName: 'todos', database: 'TodoDatabase' })
    expect(response1).eq(true)

    const responseHas1 = await scStorage.has('todos', { id: 1, database: 'TodoDatabase' })
    expect(responseHas1).eq(false)

    // Delete store
    const response2 = await scStorage.delete('todos', { type: 'store' })
    expect(response2).eq(true)

    const response3 = await scStorage.delete('todos', { type: 'store', database: 'TodoDatabase' })
    expect(response3).eq(true)

    // Delete database
    const response4 = await scStorage.delete('default', { type: 'database' })
    expect(response4).eq(true)

    const response5 = await scStorage.delete('TodoDatabase', { type: 'database' })
    expect(response5).eq(true)
  })
})
