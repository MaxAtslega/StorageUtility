export default class IndexDbUtility {
  /**
   * @param {Object} config
   */
  constructor (config) {
    this._settings = config
  }

  /**
   * Write a value to indexDB.
   * @param {String} storeName
   * @param {*} data
   * @param {Object} [options]
   * @param {String} [options.databaseName]
   * @param {Date | Number} [options.expires]
   * @param {Array} [options.indexes] Only relevant for creating the database
   * @param {Boolean} [options.update]
   * @param {Boolean} [options.closeDatabase]
   */
  write (storeName, data = {}, options) {
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
    if (options.databaseName && typeof options.databaseName !== 'string') {
      throw new Error('Option.databaseName must be a string')
    }
    if (!options.databaseName) {
      options.databaseName = this._settings.INDEXDB_DATABASE
    }
    if (options.closeDatabase && typeof options.closeDatabase !== 'boolean') {
      throw new Error('Option.closeDatabase must be a boolean')
    }
    if (typeof options.closeDatabase !== 'boolean') {
      options.closeDatabase = this._settings.INDEXDB_CLOSE_AFTER_REQUEST
    }
    if (options.update && (!('id' in data) || typeof data.id !== 'number')) {
      throw new Error('In order to update the data, you have to provide an id as number in your data object.')
    }
    if (options.indexes && (!Array.isArray(options.indexes) || typeof options.indexes[0]?.indexName !== 'string' ||
      typeof options.indexes[0]?.indexKey !== 'string' || typeof options.indexes[0]?.indexOptions?.unqiue !== 'boolean' ||
      typeof options.indexes[0]?.indexOptions?.multiEntry !== 'boolean')) {
      throw new Error("The Array 'indexes' in option does not meet the requirements. It should follows this scheme {indexKey: string, " +
        'indexName: string, indexOptions: {unqiue: boolean, multiEntry: boolean}}')
    }
    if (data && typeof data !== 'object') {
      throw new Error('data must be an object')
    }
    if ('expires' in data) {
      throw new Error('You are not allowed to add "expires" in the data object')
    }
    if ('createdAt' in data) {
      throw new Error('You are not allowed to add "createdAt" in the data object')
    }
    if (!options.update && 'id' in data) {
      throw new Error('You are not allowed to add "id" in the data object if you are not updating the data')
    }

    if ('updatedAt' in data) {
      throw new Error('You are not allowed to add "updatedAt" in the data object')
    }

    return new Promise((resolve, reject) => {
      DatabaseUtility.createStore(options.databaseName, storeName, options.indexes).then(_ => {
        DatabaseUtility.getStore(options.databaseName, storeName).then(store => {
          if (options.update) {
            // Fetch data from store
            const idQuery = store.get(data.id)

            idQuery.onerror = function () {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(options.databaseName)
              }
              reject(new Error('Unable to update data in store'))
            }

            idQuery.onsuccess = function () {
              if (idQuery.result) {
                const req = store.put({ ...data, expires: idQuery.result.expires, createdAt: idQuery.result.createdAt, updatedAt: new Date().getTime() })

                req.onsuccess = event => {
                  if (options.closeDatabase) {
                    DatabaseUtility.closeDB(options.databaseName)
                  }
                  resolve(true)
                }
                req.onerror = () => {
                  if (options.closeDatabase) {
                    DatabaseUtility.closeDB(options.databaseName)
                  }
                  reject(new Error('Unable to update data in store'))
                }
              } else {
                reject(new Error(`Error while updating data in ${options.databaseName}. Id ${data.id} not found.`))
              }
            }
          } else {
            const req = store.add({ ...data, expires: new Date().getTime(), createdAt: new Date().getTime(), updatedAt: new Date().getTime() })

            req.onsuccess = event => {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(options.databaseName)
              }
              resolve(true)
            }
            req.onerror = () => {
              if (options.closeDatabase) {
                DatabaseUtility.closeDB(options.databaseName)
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
