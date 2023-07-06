import { describe, expect, it } from 'vitest'
import ScStorage, { StorageType } from './../src/index.js'

describe('cookies', () => {
  it('write ', async () => {
    const storageType = new ScStorage({ STORAGE_TYPE: StorageType.INDEXEDDB })

    const response = await storageType.write('message', 'Hello World', {
      storageType: StorageType.COOKIE,
      expires: new Date(32535212400000)
    })
    expect(response).eq(true)
  })
  it('get', async () => {
    const storageType = new ScStorage({ STORAGE_TYPE: StorageType.COOKIE, AS_OBJECT: true })

    const message = await storageType.read('message', { asObject: false })
    expect(message).eq('Hello World')
  })

  it('get: asObject', async () => {
    const storageType = new ScStorage({ AS_OBJECT: true })

    const message = await storageType.read('message', { storageType: StorageType.COOKIE })
    expect(message?.data).eq('Hello World')
    expect(message?.expires).eq(32535212400000)
  })

  it('has', async () => {
    const storageType = new ScStorage()

    const response = await storageType.has('message', { storageType: StorageType.COOKIE })
    expect(response).eq(true)
  })

  it('delete', async () => {
    const storageType = new ScStorage()

    await storageType.delete('message', { storageType: StorageType.COOKIE })
    const response = await storageType.has('message', { storageType: StorageType.COOKIE })

    expect(response).eq(false)
  })
})
