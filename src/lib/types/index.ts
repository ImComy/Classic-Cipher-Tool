export interface Session {
  id: string
  name: string
  cipher: string
  op: 'encrypt' | 'decrypt'
  text: string
  keyData: Record<string, any>
  timestamp: number
}

export interface Mapping {
  char: string
  newChar: string
  formula?: string
  idx?: number
  newIdx?: number
}

export type Step =
  | { type: 'info'; label: string; detail?: string }
  | { type: 'warn'; label: string; detail?: string }
  | { type: 'error'; label: string; detail?: string }
  | { type: 'result'; label: string; detail?: string }
  | { type: 'mappings'; label: string; mappings?: Mapping[]; detail?: string }
  | { type: 'table'; label: string; tableData?: any[]; extra?: string }
  | { type: 'html'; label: string; html?: string }
  | { type: 'hill-blocks'; label: string; blocks?: any[]; detail?: string }
  | { type: 'perm-blocks'; label: string; blocks?: any[]; detail?: string }
  | { type: 'calc-detail'; label: string; lines: string[] }


export interface CipherResult {
  result: string
  steps: Step[]
}

export interface Cipher {
  id: string
  name: string
  encrypt(text: string, key: any): CipherResult
  decrypt(text: string, key: any): CipherResult
}