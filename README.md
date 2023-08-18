# StorageUtility

StorageUtility is a simple API that enables easy interaction with various types of browser storage such as LocalStorage,
SessionStorage, Cookies, and IndexedDB.

### Understanding help
- [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [Cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Usage

### ScStorage Class

To utilize the ScStorage API, you must first create an instance of the ScStorage class. You can optionally provide a
configuration object during this creation. Here's how you do it:

```javascript
import ScStorage, {StorageType} from './src/index'

const scStorage = new ScStorage({STORAGE_TYPE: StorageType.SESSION_STORAGE})
```

#### Configuration

You can provide a configuration object to tweak the ScStorage instance to your needs. The available options with their
default values are shown below:

```javascript
const config = {
  STORAGE_TYPE: StorageType.LOCAL_STORAGE,
  LIFETIME: 86400000,
  WITH_META: false,

  INDEXEDDB_ENABLE: false, // Only relevant if you use the IndexedDB.
  INDEXEDDB_CLOSE_AFTER_REQUEST: true, // Only relevant if you use the IndexedDB.
  INDEXEDDB_DATABASE: 'default' // Only relevant if you use the IndexedDB.
}

const scStorage = new ScStorage(config)
```

Four different StorageTypes are
available:  `StorageType.LOCAL_STORAGE`, `StorageType.SESSION_STORAGE`, `StorageType.COOKIES`, `StorageType.INDEXEDDB`

**See more example in test/*.js**

### LocalStorage

`StorageType.LOCAL_STORAGE`

#### Read

```javascript
const scStorage = new ScStorage()
scStorage.read("key", options)
```

Options available:

| Option      | Default             | Type                   | Description                                         |
|-------------|---------------------|------------------------|-----------------------------------------------------|
| storageType | config.STORAGE_TYPE | StorageType (optional) | Defines the StorageType                             |
| withMeta    | config.WITH_META    | Boolean (optional)     | Determines if the returned data should be an object |

#### Write

```javascript
const data = {message: "Hello World"}
scStorage.write("key", data, options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |
| expires          | config.LIFETIME     | Date/Number (optional)                   | Sets the expiration time                                                     |

#### Delete

```javascript
scStorage.delete("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

#### Has

```javascript
scStorage.has("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

### SessionStorage

`StorageType.SESSION_STORAGE`

#### Read

```javascript
const scStorage = new ScStorage({STORAGE_TYPE: StorageType.SESSION_STORAGE})
scStorage.read("key", options)
```

Options available:

| Option      | Default             | Type                   | Description                                         |
|-------------|---------------------|------------------------|-----------------------------------------------------|
| storageType | config.STORAGE_TYPE | StorageType (optional) | Defines the StorageType                             |
| withMeta    | config.WITH_META    | Boolean (optional)     | Determines if the returned data should be an object |

#### Write

```javascript
const data = {message: "Hello World"}
scStorage.write("key", data, options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |
| expires          | config.LIFETIME     | Date/Number (optional)                   | Sets the expiration time                                                     |

#### Delete

```javascript
scStorage.delete("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

#### Has
```javascript
scStorage.has("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

### Cookie

`StorageType.COOKIES`

#### Read

```javascript
const scStorage = new ScStorage({STORAGE_TYPE: StorageType.COOKIES})
scStorage.read("key", options)
```

Options available:

| Option      | Default             | Type                   | Description                                         |
|-------------|---------------------|------------------------|-----------------------------------------------------|
| storageType | config.STORAGE_TYPE | StorageType (optional) | Defines the StorageType                             |
| withMeta    | config.WITH_META    | Boolean (optional)     | Determines if the returned data should be an object |

#### Write

```javascript
const data = {message: "Hello World"}
scStorage.write("key", data, options)
```

Options available:

| Option      | Default             | Type                                     | Description                                      |
|-------------|---------------------|------------------------------------------|--------------------------------------------------|
| storageType | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                          |
| expires     | config.LIFETIME     | Date/Number (optional)                   | Sets the expiration time                         |
| path        | -                   | String (optional)                        | Defines the path for the cookie.                 |
| maxAge      | -                   | Number (optional)                        | Sets the maximum age for the cookie.             |
| domain      | -                   | String (optional)                        | Specifies the domain for the cookie.             |
| secure      | -                   | Boolean (optional)                       | Indicates whether the cookie is secure.          |
| httpOnly    | -                   | Boolean (optional)                       | Defines if the cookie is HttpOnly.               |
| sameSite    | -                   | Boolean/'none'/'lax'/'strict' (optional) | Configures the SameSite attribute of the cookie. |
#### Delete

```javascript
scStorage.delete("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

#### Has

```javascript
scStorage.has("key", options)
```

Options available:

| Option           | Default             | Type                                     | Description                                                                  |
|------------------|---------------------|------------------------------------------|------------------------------------------------------------------------------|
| storageType      | config.STORAGE_TYPE | StorageType (optional)                   | Defines the StorageType                                                      |

### IndexedDB (promised)

`StorageType.INDEXEDDB`

#### Read

```javascript
const scStorage = new ScStorage({STORAGE_TYPE: StorageType.INDEXEDDB})
await scStorage.read("storeName", options)

// Read all items in the 'todos' store
await scStorage.read("todos", {database: "TodoDatabase"})

// Read item with the value 'Walking' in 'todo' index in the 'todos' store
await scStorage.read("todos", {index: "todo", nameValue: "Walking", database: "TodoDatabase"})

// Read item with id 5 in the 'todos' store
await scStorage.read("todos", {id: 5, database: "TodoDatabase"})
```

Options available:

| Option        | Default                              | Type                     | Description                                         |
|---------------|--------------------------------------|--------------------------|-----------------------------------------------------|
| storageType   | config.STORAGE_TYPE                  | StorageType (optional)   | Defines the StorageType                             |
| database      | config.INDEXEDDB_DATABASE            | String (optional)        | Defines the database name.                          |
| index         | -                                    | String (optional)        | Specifies the index.                                |
| nameValue     | -                                    | String/Number (optional) | Specifies the name value.                           |
| id            | -                                    | Number (optional)        | Specifies the id                                    |
| closeDatabase | config.INDEXEDDB_CLOSE_AFTER_REQUEST | Boolean (optional)       | Determines whether to close the database.           |
| withMeta      | config.WITH_META                     | Boolean (optional)       | Determines if the returned data should be an object |

#### Write

```javascript
const data = {todo: "Walking"}
await scStorage.write("todos", data, options)

// Write
const data = {todo: "Walking"}
scStorage.write("todos", data, {expires: new Date(new Date().getTime()+100000), database: "TodoDatabase"})

// Update
const data = {id: 5, todo: "Walking"} // Note: You have to add id in data
scStorage.write("todos", data, {expires: new Date(new Date().getTime()+100000), database: "TodoDatabase", update: true})
```

Note: If you run the **write** method and the database and store don't exist, they will be created automatically. You can also use the indexes option to add custom indexes.  However, please note that adding indexes is only applicable when creating a new store.

Indexes follow this scheme: `{indexKey: string, indexName: string, indexOptions: {unique: boolean, multiEntry: boolean}}`

Options available:

| Option        | Default                              | Type                   | Description                               |
|---------------|--------------------------------------|------------------------|-------------------------------------------|
| storageType   | config.STORAGE_TYPE                  | StorageType (optional) | Defines the StorageType                   |
| expires       | config.LIFETIME                      | Date/Number (optional) | Sets the expiration time                  |
| database      | config.INDEXEDDB_DATABASE            | String (optional)      | Defines the database name.                |
| indexes       | -                                    | Array (optional)       | Specifies the indexes for store creation. |
| update        | -                                    | Boolean (optional)     | Determines whether to update the store.   |
| closeDatabase | config.INDEXEDDB_CLOSE_AFTER_REQUEST | Boolean (optional)     | Determines whether to close the database. |

#### Delete

```javascript
await scStorage.delete("key", options)

// Delete data with id 5
await scStorage.delete(5, {storeName: "todos", database: "TodoDatabase"})

// Delete store
await scStorage.delete("todos", {database: "TodoDatabase", type: "store"})

// Delete database
await scStorage.delete("TodoDatabase", {type: "database"})
```

Options available:

| Option        | Default                              | Type                      | Description                              |
|---------------|--------------------------------------|---------------------------|------------------------------------------|
| storageType   | config.STORAGE_TYPE                  | StorageType (optional)    | Defines the StorageType                  |
| storeName     | -                                    | String (optional)         | Specifies the store name.                |
| type          | 'data'                               | 'data'/'database'/'store' | Defines the type.                        |
| database  | config.INDEXEDDB_DATABASE            | String (optional)         | Defines the database name.               |
| closeDatabase | config.INDEXEDDB_CLOSE_AFTER_REQUEST | Boolean (optional)        | Specifies whether to close the database. |
#### Has

```javascript
const scStorage = new ScStorage({STORAGE_TYPE: StorageType.INDEXEDDB})
await scStorage.has("storeName", options)

// Has items in the 'todos' store
await scStorage.has("todos", {database: "TodoDatabase"})

// Has items with the value 'Walking' in the 'todos' store
await scStorage.has("todos", {index: "todo", nameValue: "Walking", database: "TodoDatabase"})

// Has item with id 5 in the 'todos' store
await scStorage.has("todos", {nameValue: 5, database: "TodoDatabase"})
```

Options available:

| Option        | Default                              | Type                     | Description                               |
|---------------|--------------------------------------|--------------------------|-------------------------------------------|
| storageType   | config.STORAGE_TYPE                  | StorageType (optional)   | Defines the StorageType                   |
| database  | config.INDEXEDDB_DATABASE            | String (optional)        | Defines the database name.                |
| index         | -                                    | String (optional)        | Specifies the index.                      |
| nameValue     | -                                    | String/Number (optional) | Specifies the name value.                 |
| closeDatabase | config.INDEXEDDB_CLOSE_AFTER_REQUEST | Boolean (optional)       | Determines whether to close the database. |

