import { describe, expect, it } from 'vitest'
import ScStorage, { StorageType } from './../src/index.js'

describe('sessionStorage', () => {
  it('write ', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.COOKIE })

    const response = await scStorage.write('message', 'Hello World', {
      storageType: StorageType.SESSION_STORAGE,
      expires: new Date(32535212400000)
    })
    expect(response).eq(true)
  })
  it('get', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.SESSION_STORAGE, AS_OBJECT: true })

    const message = await scStorage.read('message', { asObject: false })
    expect(message).eq('Hello World')
  })

  it('get: asObject', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.SESSION_STORAGE, AS_OBJECT: true })

    const message = await scStorage.read('message')
    expect(message?.data).eq('Hello World')
    expect(message?.expires).eq(32535212400000)
  })

  it('has', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.SESSION_STORAGE })

    const response = await scStorage.has('message')
    expect(response).eq(true)
  })

  it('delete', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.SESSION_STORAGE })

    await scStorage.delete('message')
    const response = await scStorage.has('message')

    expect(response).eq(false)
  })
})
