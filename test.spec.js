import { test } from 'tap'
import axe from './axe.js'

test('axe test', async (t) => {
  const axios = await axe({ clear: true })

  const response = await axios.get('https://ya.ru')
  const { data: actualData } = response

  const cacheKey = axios.getCacheKey(response.config)
  const { data: cacheData } = await axios.cache.get(cacheKey)

  t.equal(actualData, cacheData)
})
