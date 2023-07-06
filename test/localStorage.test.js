import { describe, expect, it } from 'vitest'
import ScStorage, { StorageType } from './../src/index.js'

describe('localStorage', () => {
  it('write ', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.COOKIE })

    const response = await scStorage.write('message', 'Hello World', {
      storageType: StorageType.LOCAL_STORAGE,
      expires: new Date(32535212400000)
    })
    expect(response).eq(true)
  })
  it('get', async () => {
    const scStorage = new ScStorage({ STORAGE_TYPE: StorageType.LOCAL_STORAGE, WITH_META: true })

    const message = await scStorage.read('message', { withMeta: false })
    expect(message).eq('Hello World')
  })

  it('get: asObject', async () => {
    const scStorage = new ScStorage({ WITH_META: true })

    const message = await scStorage.read('message')
    expect(message?.data).eq('Hello World')
    expect(message?.expires).eq(32535212400000)
  })

  it('has', async () => {
    const scStorage = new ScStorage()

    const response = await scStorage.has('message')
    expect(response).eq(true)
  })

  it('delete', async () => {
    const scStorage = new ScStorage()

    await scStorage.delete('message')
    const response = await scStorage.has('message')

    expect(response).eq(false)
  })
})
