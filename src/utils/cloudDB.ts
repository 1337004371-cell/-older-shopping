import cloudbase from '@cloudbase/js-sdk'
import type { Product, Video } from '@/data/mockData'
import fallbackProducts from '@/data/fallbackProducts.json'
import fallbackVideos from '@/data/fallbackVideos.json'

const ENV_ID = 'cloud1-d5geeof2fb8b30efe'

let app: ReturnType<typeof cloudbase.init> | null = null
let db: ReturnType<ReturnType<typeof cloudbase.init>['database']> | null = null
let cloudAvailable = true

async function getDB() {
  if (!cloudAvailable) throw new Error('cloud unavailable')
  if (db) return db
  console.log('[cloudDB] 初始化，env:', ENV_ID)
  app = cloudbase.init({ env: ENV_ID })
  try {
    const auth = app.auth({ persistence: 'none' })
    if (!auth.hasLoginState()) {
      await auth.anonymousAuthProvider().signIn()
      console.log('[cloudDB] 匿名登录成功')
    }
  } catch (e: any) {
    console.warn('[cloudDB] 匿名登录失败:', e.message || e)
    cloudAvailable = false
    throw e
  }
  db = app.database()
  return db
}

export async function getProducts(sceneId?: string): Promise<Product[]> {
  try {
    const database = await getDB()
    const query = sceneId ? { sceneId } : {}
    const { data } = await database.collection('products').where(query).get()
    if (data && data.length > 0) return data as Product[]
  } catch (e: any) {
    console.warn('[cloudDB] getProducts 失败，使用本地兜底:', e.message || e)
    cloudAvailable = false
  }
  const list = (fallbackProducts as Product[]).filter(p => !sceneId || p.sceneId === sceneId)
  return list
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const database = await getDB()
    const { data } = await database.collection('products').where({ id }).get()
    if (data && data.length > 0) return data[0] as Product
  } catch (e: any) {
    console.warn('[cloudDB] getProductById 失败，使用本地兜底:', e.message || e)
    cloudAvailable = false
  }
  return (fallbackProducts as Product[]).find(p => p.id === id) ?? null
}

export async function getVideos(sceneId?: string): Promise<Video[]> {
  try {
    const database = await getDB()
    const query = sceneId ? { sceneId } : {}
    const { data } = await database.collection('videos').where(query).get()
    if (data && data.length > 0) return data as Video[]
  } catch (e: any) {
    console.warn('[cloudDB] getVideos 失败，使用本地兜底:', e.message || e)
    cloudAvailable = false
  }
  return (fallbackVideos as Video[]).filter(v => !sceneId || v.sceneId === sceneId)
}

export async function getVideoById(id: string): Promise<Video | null> {
  try {
    const database = await getDB()
    const { data } = await database.collection('videos').where({ id }).get()
    if (data && data.length > 0) return data[0] as Video
  } catch (e: any) {
    console.warn('[cloudDB] getVideoById 失败，使用本地兜底:', e.message || e)
    cloudAvailable = false
  }
  return (fallbackVideos as Video[]).find(v => v.id === id) ?? null
}
