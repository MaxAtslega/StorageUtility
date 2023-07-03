/**
 * @enum {StorageType}
 */
export const StorageType = {
  COOKIE: 'Cookie',
  LOCAL_STORAGE: 'LocalStorage',
  SESSION_STORAGE: 'SessionStorage'
}

/**
 * Define the default configuration for the ScStorage class
 */
const DEFAULT = {
  STORAGE_TYPE: StorageType.LOCAL_STORAGE,
  LIFETIME: 1
}

export default class ScStorage {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = Object.assign({}, DEFAULT, config)

    this._localStorageUtility = new LocalStorageUtility(this._settings)
    this._sessionStorageUtility = new SessionStorageUtility(this._settings)
    this._cookieUtility = new CookieUtility(this._settings)
  }

  /**
   * Method to read data from a specified type of web storage.
   *
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @param {Object=} [options]
   * @returns {Object}
   */
  read (key, storageType) {
    if (typeof window === 'undefined') { return null }
    if (typeof storageType === 'undefined') { storageType = this._settings.STORAGE_TYPE }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.read(key)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.read(key)
      case StorageType.COOKIE:
        return this._cookieUtility.read(key)
      default:
        return false
    }
  }

  /**
   * Method to write data into a specified type of web storage.
   *
   * @param {String} key
   * @param {*} data
   * @param {Object=} [options]
   * @param {Date | Number} [options.expires]
   * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
   * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
   * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
   * @param {Boolean | 'none' | 'lax' | 'strict'} [options.sameSite] Only relevant if storageType is 'Cookie'.
   * @param {StorageType=} [storageType]
   * @returns {boolean}
   */
  write (key, data, options, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._settings.STORAGE_TYPE }
    if (typeof options === 'undefined') { options = {} }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.write(key, data, options.expires || null)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.write(key, data, options.expires || null)
      case StorageType.COOKIE:
        return this._cookieUtility.write(key, data, options)
      default:
        return false
    }
  }

  /**
   * Method to check if a key exists in a specified type of web storage.
   *
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @returns {Boolean}
   */
  has (key, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._settings.STORAGE_TYPE }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.has(key)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.has(key)
      case StorageType.COOKIE:
        return this._cookieUtility.has(key)
      default:
        return false
    }
  }

  /**
   * Method to delete a key from a specified type of web storage.
   *
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @returns {Boolean}
   */
  delete (key, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._settings.STORAGE_TYPE }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._localStorageUtility.delete(key)
      case StorageType.SESSION_STORAGE:
        return this._sessionStorageUtility.delete(key)
      case StorageType.COOKIE:
        return this._cookieUtility.delete(key)
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
    this._settings = Object.assign({}, DEFAULT, config)
  }

  /**
   * Write a value to local storage.
   * @param {String} key
   * @param {*} data
   * @param {Date | Number | Null} expires
   * @returns {Boolean}
   */
  write (key, data, expires) {
    if (expires && typeof expires === 'number') { expires = new Date(Date.now() + expires) }

    window.localStorage.setItem(key,
      JSON.stringify({
        data,
        expires: expires !== null
          ? expires.getTime()
          : new Date(Date.now() + this._settings.LIFETIME)
      }))
    return true
  }

  /**
   * Read a value from local storage.
   * @param {String} key
   */
  read (key) {
    const item = window.localStorage.getItem(key)
    if (!item) { return { data: null } }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      obj = { data: item }
    }

    if (!('expires' in obj) || !obj.expires) { return obj }

    if (new Date().getTime() > obj.expires) {
      this.delete(key)
      return { data: null }
    }

    return obj
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
    this._settings = Object.assign({}, DEFAULT, config)
  }

  /**
   * Write a value to session storage.
   * @param {String} key
   * @param {*} data
   * @param {Date | Number | Null } expires
   * @returns {Boolean}
   */
  write (key, data, expires) {
    if (expires && typeof expires === 'number') { expires = new Date(Date.now() + expires) }

    window.sessionStorage.setItem(key,
      JSON.stringify({
        data,
        expires: expires !== null
          ? expires.getTime()
          : new Date(Date.now() + this._settings.LIFETIME)
      }))
    return true
  }

  /**
   * Read a value from session storage.
   * @param {String} key
   */
  read (key) {
    const item = window.sessionStorage.getItem(key)
    if (!item) { return { data: null } }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      obj = { data: item }
    }

    if (!('expires' in obj) || !obj.expires) { return obj }

    if (new Date().getTime() > obj.expires) {
      this.delete(key)
      return { data: null }
    }

    return obj
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
    this._settings = Object.assign({}, DEFAULT, config)
  }

  /**
   * Write a value to cookies.
   * @param {String} key
   * @param {*} data
   * @param {{expires: number}} options
   * @param {Date=} [options.expires]
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
    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires)
    }
    if (options.expires) {
      options.expires = options.expires.toUTCString()
    } else {
      options.expires = new Date(Date.now() + this._settings.LIFETIME)
    }

    const stringifiesOptions = this._stringifyOptions(options)

    document.cookie = key + '=' + encodeURIComponent(data)
      .replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent) + stringifiesOptions
    return true
  }

  /**
   * @private
   * @param {Object} options
   * @returns {String}
   */
  _stringifyOptions (options) {
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
   * Read a value from cookies.
   * @param {String} key
   */
  read (key) {
    if (!('cookie' in document)) {
      return { data: null }
    }
    const cookie = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')?.pop() || null
    return { data: (cookie ? decodeURIComponent(cookie) : null) }
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
    return this.write(key, '', { expires: -1 })
  }
}
