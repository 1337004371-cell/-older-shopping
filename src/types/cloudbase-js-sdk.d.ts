declare module '@cloudbase/js-sdk' {
  interface CloudBaseApp {
    auth(options?: { persistence: string }): Auth
    database(): Database
  }

  interface Auth {
    hasLoginState(): boolean
    anonymousAuthProvider(): { signIn(): Promise<void> }
  }

  interface Database {
    collection(name: string): CollectionReference
  }

  interface CollectionReference {
    where(condition: Record<string, unknown>): Query
    add(data: Record<string, unknown>): Promise<{ id: string }>
  }

  interface Query {
    get(): Promise<{ data: unknown[] }>
  }

  function init(options: { env: string }): CloudBaseApp
  export default { init }
}
