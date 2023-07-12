import IndexedDbUtility from './IndexedDB.js'

/**
 * @enum {StorageType}
 */
export const StorageType = {
  COOKIE: 'Cookie',
  LOCAL_STORAGE: 'LocalStorage',
  SESSION_STORAGE: 'SessionStorage',
  INDEXEDDB: 'IndexedDB'
}

/**
 * Define the default configuration for the ScStorage class
 */
const DEFAULT = {
  STORAGE_TYPE: StorageType.LOCAL_STORAGE,
  LIFETIME: 86400000,
  WITH_META: false,

  INDEXEDDB_ENABLE: false,
  INDEXEDDB_CLOSE_AFTER_REQUEST: true,
  INDEXEDDB_DATABASE: 'default'

}

/**
 * Method to test the key whether it matches the key requirements or not
 */
function isKeyValid (key) {
  const regex = /^[a-zA-Z0-9._-]+$/
  return regex.test(key)
}

function matchKeyNotValid (key) {
  const regex = /[^a-zA-Z0-9._-]+/g
  return key.match(regex)
}

class InvalidKeyException extends Error {
  constructor (key) {
    super('The key "' + key + '" is invalid. Please remove the following characters: ' + matchKeyNotValid(key).join(','))
    this.name = this.constructor.name
  }
}

export default class ScStorage {
  /**
   * @param {Object} config
   * @param {StorageType} [config.STORAGE_TYPE]
   * @param {Number} [config.LIFETIME]
   * @param {Boolean} [config.WITH_META]
   *
   * @param {Boolean} [config.INDEXEDDB_ENABLE]
   * @param {Boolean} [config.INDEXEDDB_CLOSE_AFTER_REQUEST]
   * @param {String} [config.INDEXEDDB_DATABASE]
   */
  constructor (config = {}) {
    this._settings = Object.assign({}, DEFAULT, config)

    this._localStorageUtility = new LocalStorageUtility(this._settings)
    this._sessionStorageUtility = new SessionStorageUtility(this._settings)
    this._cookieUtility = new CookieUtility(this._settings)

    if (this._settings.INDEXEDDB_ENABLE || this._settings.STORAGE_TYPE === StorageType.INDEXEDDB) {
      this._indexedDbUtility = new IndexedDbUtility(this._settings)
    }
  }

  /**
   * Method to read data from a specified type of storage.
   *
   * @param {String} key
   * @param {Object} [options]
   * @param {StorageType} [options.storageType]
   *
   * @param {String} [options.database] Only relevant if storageType is 'IndexedDB'.
   * @param {String} [options.index] Only relevant if storageType is 'IndexedDB'.
   * @param {String | Number} [options.nameValue] Only relevant if storageType is 'IndexedDB'.
   * @param {Number} [options.id] Only relevant if storageType is 'IndexedDB'.
   * @param {Boolean} [options.closeDatabase] Only relevant if storageType is 'IndexedDB'.
   *
   * @param {Boolean} [options.withMeta] = false
   */
  read (key, options = {}) {
    if (typeof window === 'undefined') {
      return false
    }
    if (!isKeyValid(key)) {
      throw new InvalidKeyException(key)
    }
    if (!options.storageType) {
      options.storageType = this._settings.STORAGE_TYPE
    }

    switch (options.storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.read(key, options)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.read(key, options)
      case StorageType.COOKIE:
        return this._cookieUtility.read(key, options)
      case StorageType.INDEXEDDB:
        return this._indexedDbUtility.read(key, options).then((data) => {
          return data
        }).catch((error) => {
          throw error
        })
      default:
        return null
    }
  }

  /**
   * Method to write data into a specified type of storage.
   *
   * @param {String} key
   * @param {*} data
   * @param {Object=} [options]
   * @param {StorageType=} [options.storageType]
   * @param {Date | Number} [options.expires]
   * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
   * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
   * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
   * @param {Boolean | 'none' | 'lax' | 'strict'} [options.sameSite] Only relevant if storageType is 'Cookie'.
   *
   * @param {String} [options.database] Only relevant if storageType is 'IndexedDB'.
   * @param {Array} [options.indexes] Only relevant if storageType is 'IndexedDB' and for creating the store.
   * @param {Boolean} [options.update] Only relevant if storageType is 'IndexedDB'.
   * @param {Boolean} [options.closeDatabase] Only relevant if storageType is 'IndexedDB'.
   */
  write (key, data, options = {}) {
    if (typeof window === 'undefined') {
      return false
    }
    if (!isKeyValid(key)) {
      throw new InvalidKeyException(key)
    }
    if (!options.storageType) {
      options.storageType = this._settings.STORAGE_TYPE
    }

    switch (options.storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.write(key, data, options)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.write(key, data, options)
      case StorageType.COOKIE:
        return this._cookieUtility.write(key, data, options)
      case StorageType.INDEXEDDB:
        return this._indexedDbUtility.write(key, data, options)
      default:
        return false
    }
  }

  /**
   * Method to check if a key exists in a specified type of storage.
   *
   * @param {String} key
   * @param {Object=} [options]
   * @param {StorageType=} [options.storageType]
   *
   * @param {String} [options.database] Only relevant if storageType is 'IndexedDB'.
   * @param {String} [options.index] Only relevant if storageType is 'IndexedDB'.
   * @param {Number} [options.id] Only relevant if storageType is 'IndexedDB'.
   * @param {String | Number} [options.nameValue] Only relevant if storageType is 'IndexedDB'.
   * @param {Boolean} [options.closeDatabase] Only relevant if storageType is 'IndexedDB'.
   */
  has (key, options = {}) {
    if (typeof window === 'undefined') {
      return false
    }
    if (!isKeyValid(key)) {
      throw new InvalidKeyException(key)
    }
    if (!options.storageType) {
      options.storageType = this._settings.STORAGE_TYPE
    }

    switch (options.storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.has(key)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.has(key)
      case StorageType.COOKIE:
        return this._cookieUtility.has(key)
      case StorageType.INDEXEDDB:
        return this._indexedDbUtility.has(key, options)
      default:
        return false
    }
  }

  /**
   * Method to delete a key from a specified type of storage.
   *
   * @param {String|Number} key
   * @param {Object=} [options]
   * @param {StorageType=} [options.storageType]
   *
   * @param {String} [options.storeName] Only relevant if storageType is 'IndexedDB'.
   * @param {'data'|'database'|'store'} [options.type] = 'data' Only relevant if storageType is 'IndexedDB'.
   * @param {String} [options.database] Only relevant if storageType is 'IndexedDB'.
   * @param {Boolean} [options.closeDatabase] Only relevant if storageType is 'IndexedDB'.
   */
  delete (key, options = {}) {
    if (typeof window === 'undefined') {
      return false
    }
    if (!isKeyValid(key)) {
      throw new InvalidKeyException()
    }
    if (!options.storageType) {
      options.storageType = this._settings.STORAGE_TYPE
    }
    switch (options.storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.delete(key)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.delete(key)
      case StorageType.COOKIE:
        return this._cookieUtility.delete(key)
      case StorageType.INDEXEDDB:
        return this._indexedDbUtility
      default:
        return false
    }
  }
}

class LocalStorageUtility {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = config
  }

  /**
   * Write a value to local storage.
   * @param {String} key
   * @param {*} data
   * @param {Object=} [options]
   * @param {Date | Number | null} options.expires
   * @returns {Boolean}
   */
  write (key, data, options) {
    if (!options.expires) {
      options.expires = new Date(Date.now() + this._settings.LIFETIME)
    }
    if (!(options.expires instanceof Date) && typeof options.expires !== 'number') {
      throw new Error('Expires can only be a number or a date object')
    }
    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires)
    }

    let createdAt = new Date().getTime()
    const item = this.read(key, { withMeta: true })
    if (item && 'createdAt' in item) {
      createdAt = item.createdAt
    }

    window.localStorage.setItem(key,
      JSON.stringify({
        data, expires: options.expires.getTime(), createdAt, updatedAt: new Date().getTime()
      }))

    return true
  }

  /**
   * Read a value from local storage.
   * @param {String} key
   * @param {Object=} [options]
   * @param { Boolean= } [options.withMeta] = false
   */
  read (key, options = { withMeta: this._settings.WITH_META }) {
    if (options.withMeta && typeof options.withMeta !== 'boolean') {
      throw new Error('options.withMeta must be a boolean')
    }
    if (typeof options.withMeta !== 'boolean') {
      options.withMeta = this._settings.WITH_META
    }

    const item = window.localStorage.getItem(key)
    if (!item) {
      return options.withMeta ? { data: null } : null
    }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in local storage. Please delete it.")
      return options.withMeta ? { data: item } : item
    }

    if (!('expires' in obj) || !('data' in obj)) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in local storage. Please delete it.")
      return options.withMeta ? { data: obj } : obj
    }

    if (new Date().getTime() > obj.expires) {
      this.delete(key)
      return options.withMeta ? { data: null } : null
    }

    return options.withMeta ? obj : obj.data
  }

  /**
   * Check if a key exists in local storage.
   * @param {String} key
   * @returns {boolean}
   */
  has (key) {
    return this.read(key) !== null
  }

  /**
   * Delete a value from local storage.
   * @param {String} key
   * @returns {boolean}
   */
  delete (key) {
    window.localStorage.removeItem(key)

    return true
  }
}

class SessionStorageUtility {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = config
  }

  /**
   * Write a value to session storage.
   * @param {String} key
   * @param {*} data
   * @param {Object=} [options]
   * @param {Date | Number | null} options.expires
   * @returns {Boolean}
   */
  write (key, data, options) {
    if (!options.expires) {
      options.expires = new Date(Date.now() + this._settings.LIFETIME)
    }
    if (!(options.expires instanceof Date) && typeof options.expires !== 'number') {
      throw new Error('Expires can only be a number or a date object')
    }
    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires)
    }

    let createdAt = new Date().getTime()
    const item = this.read(key, { withMeta: true })
    if (item && 'createdAt' in item) {
      createdAt = item.createdAt
    }

    window.sessionStorage.setItem(key,
      JSON.stringify({
        data, expires: options.expires.getTime(), createdAt, updatedAt: new Date().getTime()
      }))

    return true
  }

  /**
   * Read a value from session storage.
   * @param {String} key
   * @param {Object=} [options]
   * @param { Boolean= } [options.withMeta] = false
   */
  read (key, options = { withMeta: this._settings.WITH_META }) {
    if (options.withMeta && typeof options.withMeta !== 'boolean') {
      throw new Error('options.withMeta must be a boolean')
    }
    if (typeof options.withMeta !== 'boolean') {
      options.withMeta = this._settings.WITH_META
    }

    const item = window.sessionStorage.getItem(key)
    if (!item) {
      return options.withMeta ? { data: null } : null
    }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in session storage. Please delete it.")
      return options.withMeta ? { data: item } : item
    }

    if (!('expires' in obj) || !('data' in obj)) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in session storage. Please delete it.")
      return options.withMeta ? { data: obj } : obj
    }

    if (new Date().getTime() > obj.expires) {
      this.delete(key)
      return options.withMeta ? { data: null } : null
    }

    return options.withMeta ? obj : obj.data
  }

  /**
   * Check if a key exists in session storage.
   * @param {String} key
   * @returns {boolean}
   */
  has (key) {
    return this.read(key) !== null
  }

  /**
   * Delete a value from session storage.
   * @param {String} key
   * @returns {boolean}
   */
  delete (key) {
    window.sessionStorage.removeItem(key)
    return true
  }
}

class CookieUtility {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = config
  }

  /**
   * Write a value to cookies.
   * @param {String} key
   * @param {*} data
   * @param {{Object}} options
   * @param {Date|Number|String=} [options.expires]
   * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
   * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
   * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
   * @param {(Boolean | 'none' | 'lax' | 'strict')=} [options.sameSite] Only relevant if storageType is 'Cookie'.
   * @returns {Boolean}
   */
  write (key, data, options) {
    if (!('cookie' in document)) {
      return false
    }

    validateOptions(options)

    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires)
    }
    if (options.expires && options.expires instanceof Date) {
      options.expires = options.expires.toUTCString()
    } else {
      options.expires = new Date(Date.now() + this._settings.LIFETIME).toUTCString()
    }
    options.storageType = null

    const stringifiesOptions = stringifyOptions(options)

    let createdAt = new Date().getTime()
    const item = this.read(key, { withMeta: true })
    if (item && 'createdAt' in item) {
      createdAt = item.createdAt
    }

    data = JSON.stringify({
      data, expires: new Date(options.expires).getTime(), createdAt, updatedAt: new Date().getTime()
    })

    document.cookie = key + '=' + encodeURIComponent(data)
      .replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent) + stringifiesOptions
    return true
  }

  /**
   * Read a value from cookies.
   * @param {String} key
   * @param {Object=} [options]
   * @param { Boolean= } [options.withMeta] = false
   */
  read (key, options = { withMeta: this._settings.WITH_META }) {
    if (!('cookie' in document)) {
      return { data: null }
    }
    if (options.withMeta && typeof options.withMeta !== 'boolean') {
      throw new Error('options.withMeta must be a boolean')
    }
    if (typeof options.withMeta !== 'boolean') {
      options.withMeta = this._settings.WITH_META
    }
    let item = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')?.pop() || null
    if (!item) {
      return options.withMeta ? { data: null } : null
    }

    item = decodeURIComponent(item)

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in cookies. Please delete it.")
      return options.withMeta ? { data: item } : item
    }

    if (!('expires' in obj) || !('data' in obj)) {
      console.info("ScStorage read an invalid item from the key '" + key + "' in cookies. Please delete it.")
      return options.withMeta ? { data: obj } : obj
    }

    if (new Date().getTime() > obj.expires) {
      this.delete(key)
      return options.withMeta ? { data: null } : null
    }

    return options.withMeta ? obj : obj.data
  }

  /**
   * Check if a key exists in cookies.
   * @param {String} key
   * @returns {boolean}
   */
  has (key) {
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(key).replace(/[-.+*]/g, '\\$&') + '\\s*\\=')).test(document.cookie)
  }

  /**
   * Delete a value from cookies.
   * @param {String} key
   * @returns {boolean}
   */
  delete (key) {
    if (!('cookie' in document)) {
      return false
    }
    document.cookie = key + '=' + '; Max-Age=-99999999;'
    return true
  }
}

/**
 * @private
 * @param {Object} options
 * @returns {String}
 */
function stringifyOptions (options) {
  let stringifiedOptions = ''
  for (const attributeName in options) {
    if (!options[attributeName]) {
      continue
    }
    stringifiedOptions += '; ' + attributeName

    if (options[attributeName] === true) {
      continue
    }

    // Considers RFC 6265 section 5.2
    stringifiedOptions += '=' + options[attributeName].split(';')[0]
  }
  return stringifiedOptions
}

/**
 * @private
 * @param {{Object}} options
 * @param {Date|Number|String=} [options.expires]
 * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
 * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
 * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
 * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
 * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
 * @param {(Boolean | 'none' | 'lax' | 'strict')=} [options.sameSite] Only relevant if storageType is 'Cookie'.
 */
function validateOptions (options) {
  if (options.path && typeof options.path !== 'string') throw new Error('Option.path must be a string')
  if (options.maxAge && typeof options.maxAge !== 'number') throw new Error('Option.maxAge must be a number')
  if (options.domain && typeof options.domain !== 'number') throw new Error('Option.domain must be a number')
  if (options.secure && typeof options.secure !== 'boolean') throw new Error('Option.secure must be a boolean')
  if (options.httpOnly && typeof options.httpOnly !== 'boolean') throw new Error('Option.httpOnly must be a boolean')
  if (options.sameSite && (typeof options.sameSite !== 'boolean' && options.sameSite !== 'none' &&
    options.sameSite !== 'lax' && options.sameSite !== 'strict')) {
    throw new Error('Option.sameSite must be "none", "strict", "lax" or a boolean')
  }
}
