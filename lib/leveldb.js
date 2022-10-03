import fs from 'fs'
import level from 'level'

class CacheLevel {
  constructor({ folder, clear = false, readonly = false }) {
    fs.mkdirSync(folder, { recursive: true })
    this.clear = clear
    this.readonly = readonly

    this.db = level(folder)
  }

  async init() {
    if (this.clear) {
      await this.db.clear()
    }
  }

  async set(k, v) {
    if (this.readonly) return Promise.resolve()

    let keys = []
    try {
      keys = JSON.parse(await this.db.get('cache'))
    } catch (err) {
    // pass
    }

    // array buffer interceptor to base64
    if (v != null && v.data != null && v.data instanceof Buffer) {
      v.type = 'base64'
      v.data = Buffer.from(v.data, 'binary').toString('base64')
    }

    keys.push(k)
    await this.db.put('cache', JSON.stringify(keys))

    return this.db.put(k, JSON.stringify(v))
  }

  async get(k) {
    const v = JSON.parse(await this.db.get(k))
    if (v.type != null && v.type === 'base64') {
      v.data = Buffer.from(v.data, 'base64')
      delete v.type
    }
    return v
  }
}

export default CacheLevel
