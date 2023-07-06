import { describe, expect, it } from 'vitest'
import ScStorage, { StorageType } from './../src/index.js'

describe('localStorage', () => {
  it('write ', async () => {
    const storageType = new ScStorage({ STORAGE_TYPE: StorageType.COOKIE })

    const response = await storageType.write('message', 'Hello World', {
      storageType: StorageType.LOCAL_STORAGE,
      expires: new Date(32535212400000)
    })
    expect(response).eq(true)
  })
  it('get', async () => {
    const storageType = new ScStorage({ STORAGE_TYPE: StorageType.LOCAL_STORAGE, AS_OBJECT: true })

    const message = await storageType.read('message', { asObject: false })
    expect(message).eq('Hello World')
  })

  it('get: asObject', async () => {
    const storageType = new ScStorage({ AS_OBJECT: true })

    const message = await storageType.read('message')
    expect(message?.data).eq('Hello World')
    expect(message?.expires).eq(32535212400000)
  })

  it('has', async () => {
    const storageType = new ScStorage()

    const response = await storageType.has('message')
    expect(response).eq(true)
  })

  it('delete', async () => {
    const storageType = new ScStorage()

    await storageType.delete('message')
    const response = await storageType.has('message')

    expect(response).eq(false)
  })
})
