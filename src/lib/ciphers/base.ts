import type { CipherResult, Step, Cipher } from '../types'

export abstract class BaseCipher implements Cipher {
  abstract id: string
  abstract name: string

  abstract encrypt(text: string, key: any): CipherResult
  abstract decrypt(text: string, key: any): CipherResult

  generateSteps(_text: string, _key: any, _decrypt: boolean): Step[] {
    return []
  }
}
