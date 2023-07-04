export default class IndexDbUtility {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = config
  }

  /**
   * Write a value to indexDB.
   * @param {String} dbName
   * @param {String} storeName
   * @param {*} data
   * @param {Object} [options]
   * @param {Date | Number} [options.expires]
   * @param {Array} [options.indexes] Only relevant for creating the database
   * @param {Boolean} [options.update]
   * @param {Boolean} [options.closeDatabase] = true
   */
  async write (dbName, storeName, data = [], options) {
    if (!('indexedDB' in window)) {
      throw new Error("This browser doesn't support IndexedDB.")
    }

    if (!options.expires) {
      options.expires = new Date(Date.now() + this._settings.LIFETIME)
    }
    if (!(options.expires instanceof Date) && typeof options.expires !== 'number') {
      throw new Error('Expires can only be a number or a date object')
    }
    if (options.expires && typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires)
    }
    if (options.update && typeof options.update !== 'boolean') {
      throw new Error('Option.update must be a boolean')
    }
    if (options.closeDatabase && typeof options.closeDatabase !== 'boolean') {
      throw new Error('Option.closeDatabase must be a boolean')
    }
    if (typeof options.closeDatabase !== 'boolean') {
      options.closeDatabase = true
    }
    if (options.update && (!('id' in data) || typeof data.id !== 'number')) {
      throw new Error('In order to update the data, you have to provide an id as number in your data object.')
    }
    if (options.indexes && (!Array.isArray(options.indexes) || typeof options.indexes[0]?.indexName !== 'string' ||
      typeof options.indexes[0]?.indexKey !== 'string' || typeof options.indexes[0]?.indexOptions?.unqiue !== 'boolean' ||
      typeof options.indexes[0]?.indexOptions?.multiEntry !== 'boolean')) {
      throw new Error("The Array 'Indexes' in option doesn't follow the requirements. {indexKey: string, " +
        'indexName: string, indexOptions: {unqiue: boolean, multiEntry: boolean}}')
    }
    if ('expires' in data) {
      throw new Error('You are not allowed to add "expires" in the data object')
    }
    if ('createdAt' in data) {
      throw new Error('You are not allowed to add "createdAt" in the data object')
    }
    if ('updatedAt' in data) {
      throw new Error('You are not allowed to add "updatedAt" in the data object')
    }

    return new Promise((resolve, reject) => {
      DatabaseUtility.createStore(dbName, storeName, options.indexes).then(_ => {
        DatabaseUtility.getStore(dbName, storeName).then(store => {
          if (options.update) {
            // Fetch data from store
            const idQuery = store.get(data.id)

            idQuery.onerror = function () {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(dbName)
              }
              reject(new Error('Unable to update data in store'))
            }

            idQuery.onsuccess = function () {
              const req = store.put({ ...data, expires: idQuery.result.expires, createdAt: idQuery.result.createdAt, updatedAt: new Date().getTime() })

              req.onsuccess = event => {
                if (options.closeDatabase) {
                  DatabaseUtility.closeDB(dbName)
                }
                resolve(true)
              }
              req.onerror = () => {
                if (options.closeDatabase) {
                  DatabaseUtility.closeDB(dbName)
                }
                reject(new Error('Unable to update data in store'))
              }
            }
          } else {
            const req = store.add({ ...data, expires: new Date().getTime(), createdAt: new Date().getTime(), updatedAt: new Date().getTime() })

            req.onsuccess = event => {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(dbName)
              }
              resolve(true)
            }
            req.onerror = () => {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(dbName)
              }
              reject(new Error('Unable to add data to store'))
            }
          }
        })
      })
    })
  }
}

class DatabaseUtility {
  static _databaseList = []

  /**
   * Method to open a database
   * @param {*} dbName
   * @param {Object} listener
   * @param {Number} version
   */
  static openDB (dbName, listener, version) {
    const { onupgradeneeded } = listener

    return new Promise((resolve, reject) => {
      this.getDB(dbName).then(db => {
        resolve(db)
      }).catch(_ => {
        const req = indexedDB.open(dbName, version)
        console.log('eew123')

        req.onsuccess = event => {
          this._databaseList[dbName] = event.target.result
          resolve(event.target.result)
        }

        req.onupgradeneeded = onupgradeneeded
        req.onerror = reject
      })
    })
  }

  /**
   * Method to close a database
   * @param {*} dbName
   */
  static closeDB (dbName) {
    const currentDatabase = this._databaseList[dbName]
    if (currentDatabase) {
      delete this._databaseList[dbName]
      currentDatabase.close()
      return Promise.resolve(true)
    } else {
      return Promise.resolve()
    }
  }

  /**
   * Method to delete a database
   * @param {String} dbName
   */
  static async deleteDB (dbName) {
    await this.closeDB(dbName)

    return new Promise((resolve, reject) => {
      const dbConnect = indexedDB.deleteDatabase(dbName)

      dbConnect.onsuccess = resolve
      dbConnect.onerror = reject
    })
  }

  /**
   * Method to get a database
   * @param {String} dbName
   */
  static getDB (dbName) {
    const curDB = this._databaseList[dbName]

    if (curDB) {
      return Promise.resolve(curDB)
    } else {
      return Promise.reject(new Error(`please open ${dbName} DB first`))
    }
  }

  /**
   * Method to get a store in database
   * @param {String} dbName
   * @param {String} storeName
   */
  static async getStore (dbName, storeName, indexes = []) {
    const currentDatabase = await this.getDB(dbName)

    return new Promise((resolve, reject) => {
      if (currentDatabase.objectStoreNames.contains(storeName)) {
        const transaction = currentDatabase.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)

        resolve(store)
      } else {
        reject(new Error(`The store '${storeName}' in '${dbName}' doesn't exist`))
      }
    })
  }

  /**
   * Method to create store in database
   * @param {String} dbName
   * @param {String} storeName
   * @param {Array} indexes
   * @param {Number} version
   */
  static async createStore (dbName, storeName, indexes = [], version = new Date().getTime()) {
    let store = null

    const keyOptions = {
      keyPath: 'id',
      autoIncrement: true
    }

    indexes = [
      {
        indexName: 'idIndex',
        indexKey: 'id',
        indexOptions: { unqiue: true, multiEntry: false }
      },
      ...indexes
    ]

    await this.openDB(
      dbName,
      {
        onupgradeneeded: event => {
          const db = event.target.result

          if (db.objectStoreNames.contains(storeName)) {
            return
          }

          store = db.createObjectStore(storeName, keyOptions)
          indexes.forEach(e => store.createIndex(e.indexName, e.indexKey, e.indexOptions))
        }
      },
      version
    )

    return store
  }
}
