import fs from 'fs'
import path from 'path'

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

class CacheSQLite {
  constructor({ folder = process.cwd(), clear = false, readonly = false }) {
    fs.mkdirSync(folder, { recursive: true })
    this.clear = clear
    this.readonly = readonly

    this.db = open({
      filename: path.join(folder, 'db.sqlite'),
      driver: sqlite3.Database,
    })
  }

  async init() {
    this.db = await this.db
    await this.db.exec('CREATE TABLE IF NOT EXISTS cache (key VARCHAR(64) PRIMARY KEY, value TEXT)')

    if (this.clear) {
      await this.db.exec('DELETE FROM cache')
    }
  }

  async set(k, v) {
    if (this.readonly) return Promise.resolve()

    // array buffer interceptor to base64
    if (v != null && v.data != null && v.data instanceof Buffer) {
      v.type = 'base64'
      v.data = Buffer.from(v.data, 'binary').toString('base64')
    }

    return this.db.run('INSERT INTO cache (key, value) VALUES (?,?)', k, JSON.stringify(v))
  }

  async get(k) {
    const { value } = await this.db.get('SELECT value FROM cache WHERE key = ?', [k])

    const v = JSON.parse(value)
    if (v.type != null && v.type === 'base64') {
      v.data = Buffer.from(v.data, 'base64')
      delete v.type
    }
    return v
  }
}

export default CacheSQLite
