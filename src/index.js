// eslint-disable-next-line no-unused-vars
class ScStorage {
  _storageType = StorageType.LOCAL_STORAGE

  /**
   * @param {StorageType=} [storageType]
   */
  constructor (storageType) {
    if (typeof storageType === 'undefined') { storageType = StorageType.LOCAL_STORAGE }

    this._storageType = storageType
  }

  /**
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @param {Object=} [options]
   * @returns {Object}
   */
  read (key, storageType) {
    if (typeof window === 'undefined') { return null }
    if (typeof storageType === 'undefined') { storageType = this._storageType }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._readLocalStorage(key)
      case StorageType.SESSION_STORAGE:
        return this._readSessionStorage(key)
      case StorageType.COOKIE:
        return this._readCookie(key)
      default:
        return false
    }
  }

  /**
   * @param {String} key
   * @param {*} data
   * @param {Object=} [options]
   * @param {Date | Number} [options.expires]
   * @param {String=} [options.path] Only relevant if storageType is 'Cookie'.
   * @param {Number=} [options.maxAge] Only relevant if storageType is 'Cookie'.
   * @param {String=} [options.domain] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.secure] Only relevant if storageType is 'Cookie'.
   * @param {Boolean=} [options.httpOnly] Only relevant if storageType is 'Cookie'.
   * @param {(Boolean | 'none' | 'lax' | 'strict')=} [options.sameSite] Only relevant if storageType is 'Cookie'.
   * @param {Date=} [options.encode] Only relevant if storageType is 'Cookie'.
   * @param {StorageType=} [storageType]
   * @returns {boolean}
   */
  write (key, data, options, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._storageType }
    if (typeof options === 'undefined') { options = {} }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._writeLocalStorage(key, data, options.expires || null)
      case StorageType.SESSION_STORAGE:
        return this._writeSessionStorage(key, data, options.expires || null)
      case StorageType.COOKIE:
        return this._writeCookie(key, data, options)
      default:
        return false
    }
  }

  /**
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @returns {Boolean}
   */
  has (key, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._storageType }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._hasLocalStorage(key)
      case StorageType.SESSION_STORAGE:
        return this._hasSessionStorage(key)
      case StorageType.COOKIE:
        return this._hasCookie(key)
      default:
        return false
    }
  }

  /**
   * @param {String} key
   * @param {StorageType=} [storageType]
   * @returns {Boolean}
   */
  delete (key, storageType) {
    if (typeof window === 'undefined') { return false }
    if (typeof storageType === 'undefined') { storageType = this._storageType }
    key = encodeURIComponent(key).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape)

    switch (storageType) {
      case StorageType.LOCAL_STORAGE:
        return this._deleteLocalStorage(key)
      case StorageType.SESSION_STORAGE:
        return this._deleteSessionStorage(key)
      case StorageType.COOKIE:
        return this._deleteCookie(key)
      default:
        return false
    }
  }

  /**
   * @private
   * @param {String} key
   * @param {*} data
   * @param {Date | Number | Null} expires
   */
  _writeLocalStorage (key, data, expires) {
    if (expires && typeof expires === 'number') { expires = new Date(Date.now() + expires * 864e5) }

    window.localStorage.setItem(key,
      JSON.stringify({ data, expires: expires !== null ? expires.getTime() : null }))
    return true
  }

  /**
   * @private
   * @param {String} key
   * @param {*} data
   * @param {Date | Number | Null } expires
   */
  _writeSessionStorage (key, data, expires) {
    if (expires && typeof expires === 'number') { expires = new Date(Date.now() + expires * 864e5) }

    window.sessionStorage.setItem(key,
      JSON.stringify({ data, expires: expires !== null ? expires.getTime() : null }))
    return true
  }

  /**
   * @private
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
   * @param {Date=} [options.encode] Only relevant if storageType is 'Cookie'.
   */
  _writeCookie (key, data, options) {
    if (!('cookie' in document)) { return false }
    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires * 864e5)
    }
    if (options.expires) { options.expires = options.expires.toUTCString() }

    const stringifiedOptions = this._stringifyOptions(options)

    document.cookie = key + '=' + encodeURIComponent(data)
      .replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent) + stringifiedOptions
    return true
  }

  /**
   * @private
   * @param {Object} options
   */
  _stringifyOptions (options) {
    let stringifiedOptions = ''
    for (const attributeName in options) {
      if (!options[attributeName]) { continue }
      stringifiedOptions += '; ' + attributeName

      if (options[attributeName] === true) { continue }

      // Considers RFC 6265 section 5.2
      stringifiedOptions += '=' + options[attributeName].split(';')[0]
    }
    return stringifiedOptions
  }

  /**
   * @private
   * @param {String} key
   */
  _readLocalStorage (key) {
    const item = window.localStorage.getItem(key)
    if (!item) { return null }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      obj = { data: item }
    }

    if (!('expires' in obj) || !obj.expires) { return obj }

    if (new Date().getTime() > obj.expires) {
      this.delete(key, StorageType.LOCAL_STORAGE)
      return null
    }

    return obj
  }

  /**
   * @private
   * @param {String} key
   */
  _readSessionStorage (key) {
    const item = window.sessionStorage.getItem(key)
    if (!item) { return null }

    let obj = null
    try {
      obj = JSON.parse(item)
    } catch (e) {
      obj = { data: item }
    }

    if (!('expires' in obj) || !obj.expires) { return obj }

    if (new Date().getTime() > obj.expires) {
      this.delete(key, StorageType.SESSION_STORAGE)
      return null
    }

    return obj
  }

  /**
   * @private
   * @param {String} key
   */
  _readCookie (key) {
    if (!('cookie' in document)) { return null }
    const cookie = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')?.pop() || null
    return { data: (cookie ? decodeURIComponent(cookie) : null) }
  }

  /**
   * @private
   * @param {String} key
   */
  _hasCookie (key) {
    return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(key).replace(/[-.+*]/g, '\\$&') + '\\s*\\=')).test(document.cookie)
  }

  /**
   * @private
   * @param {String} key
   */
  _hasLocalStorage (key) {
    return this._readLocalStorage(key) !== null
  }

  /**
   * @private
   * @param {String} key
   */
  _hasSessionStorage (key) {
    return this._readSessionStorage(key) !== null
  }

  _deleteCookie (key) {
    return this._writeCookie(key, '', { expires: -1 })
  }

  /**
   * @private
   * @param {String} key
   */
  _deleteLocalStorage (key) {
    window.localStorage.removeItem(key)
    return true
  }

  /**
   * @private
   * @param {String} key
   */
  _deleteSessionStorage (key) {
    window.sessionStorage.removeItem(key)
    return true
  }
}

/**
 * @enum {StorageType}
 */
const StorageType = {
  COOKIE: 'Cookie',
  LOCAL_STORAGE: 'LocalStorage',
  SESSION_STORAGE: 'SessionStorage'
}