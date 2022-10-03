import axios from 'axios'
import path from 'path'
import cachios from 'cachios'

// cachios life hack
// { force: true } - for disable cache in axios request options

const CACHE_BACKEND = {
  SQLITE: 'sqlite',
  LEVELDB: 'leveldb',
}

const DEFAULT = {
  folder: path.join(process.cwd(), '.cache'),
  clear: false,
  readonly: false,
  backend: CACHE_BACKEND.SQLITE,
}

const init = async ({
  folder = DEFAULT.folder,
  clear = DEFAULT.clear,
  readonly = DEFAULT.readonly,
  backend = DEFAULT.backend,
} = DEFAULT) => {
  cachios.getCacheIdentifier = (config) => ({
    method: config.method,
    url: config.url,
    params: config.params,
    data: config.data,
  })

  const ax = cachios.create(axios)

  const { default: CacheLib } = await import(`./lib/${backend}.js`)

  const cache = new CacheLib({ folder, clear, readonly })
  await cache.init()

  ax.cache = cache

  return ax
}

export default init
