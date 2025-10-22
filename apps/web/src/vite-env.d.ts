/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_NODE: string
  readonly VITE_API_URL_FASTAPI1: string
  readonly VITE_API_URL_FASTAPI2: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
