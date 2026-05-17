import cloudbase from '@cloudbase/js-sdk'
import type { Product, Video } from '@/data/mockData'

const ENV_ID = 'cloud1-d5geeof2fb8b30efe'

let app: ReturnType<typeof cloudbase.init> | null = null
let db: ReturnType<ReturnType<typeof cloudbase.init>['database']> | null = null

async function getDB() {
  if (db) return db
  console.log('[cloudDB] 初始化，env:', ENV_ID)
  app = cloudbase.init({ env: ENV_ID })
  // 必须调用 auth() 初始化上下文，否则 database() 内部 scope 为 null
  // 不调用 signIn，靠"未登录用户访问权限"直接读写
  try {
    const auth = app.auth({ persistence: 'none' })
    if (!auth.hasLoginState()) {
      await auth.anonymousAuthProvider().signIn()
      console.log('[cloudDB] 匿名登录成功')
    }
  } catch (e: any) {
    console.warn('[cloudDB] 匿名登录失败，尝试未登录模式:', e.message || e)
    // 重新 init，用 auth({ persistence: 'none' }) 初始化上下文即可
    app.auth({ persistence: 'none' })
  }
  db = app.database()
  return db
}

export async function getProducts(sceneId?: string): Promise<Product[]> {
  const database = await getDB()
  const query = sceneId ? { sceneId } : {}
  console.log('[cloudDB] 查询 products，条件:', JSON.stringify(query))
  const { data } = await database.collection('products').where(query).get()
  console.log('[cloudDB] 数据库返回:', data?.length ?? 0, '条')
  if (data && data.length > 0) {
    console.log('[cloudDB] 第一条:', JSON.stringify(data[0]))
  }
  return (data || []) as Product[]
}

export async function getProductById(id: string): Promise<Product | null> {
  const database = await getDB()
  console.log('[cloudDB] 按 id 查询:', id)
  const { data } = await database.collection('products').where({ id }).get()
  console.log('[cloudDB] 返回:', data?.length ?? 0, '条')
  return (data?.[0] as Product) ?? null
}

export async function getVideos(sceneId?: string): Promise<Video[]> {
  const database = await getDB()
  const query = sceneId ? { sceneId } : {}
  console.log('[cloudDB] 查询 videos，条件:', JSON.stringify(query))
  const { data } = await database.collection('videos').where(query).get()
  console.log('[cloudDB] videos 返回:', data?.length ?? 0, '条')
  return (data || []) as Video[]
}

export async function getVideoById(id: string): Promise<Video | null> {
  const database = await getDB()
  const { data } = await database.collection('videos').where({ id }).get()
  return (data?.[0] as Video) ?? null
}
