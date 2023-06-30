/**
 * @enum {StorageType}
 */
const StorageType = {
  COOKIE: 'Cookie',
  LOCAL_STORAGE: 'LocalStorage',
  SESSION_STORAGE: 'SessionStorage',
  CACHE_STORAGE: 'CacheStorage'
}

// eslint-disable-next-line no-unused-vars
class ScStorage {
  storageType = StorageType.LOCAL_STORAGE

  /**
   * @param {StorageType=} [storageType]
   */
  constructor (storageType) {
    if (typeof storageType === 'undefined') { storageType = StorageType.LOCAL_STORAGE }

    this.storageType = storageType
  }

  /**
   * @param {String} key
   * @param {String} data
   * @param {StorageType=} [storageType]
   * @param {Object=} [options]
   */
  read (key, storageType) {
    if (storageType === StorageType.CacheStorage) { return key }
    return key
  }

  /**
   * @param {String} key
   * @param {String} key
   * @param {String} data
   * @param {StorageType=} [storageType]
   * @param {Object=} [options]
   * @param {Date=} [options.expires]
   * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
   * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
   * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
   * @param {(Boolean | 'none' | 'lax' | 'strict')=} [options.sameSite] Only relevant if storageType is 'Cookie'.
   * @param {Date=} [options.encode] Only relevant if storageType is 'Cookie'.
   */
  write (key, data, storageType, options) {
    if (typeof storageType === 'undefined') { storageType = this.storageType }
    if (typeof options === 'undefined') { options = {} }

    return true
  }

  /**
   * @param {String} key
   * @param {StorageType=} [storageType]
   */
  has (key, storageType) {
    return true
  }

  /**
   * @param {String} key
   * @param {StorageType=} [storageType]
   */
  delete (key, storageType) {
    return true
  }
}
