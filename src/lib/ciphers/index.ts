import type { Cipher } from '../types'
import { ShiftCipher } from './shift'
import { SubstitutionCipher } from './substitution'
import { AffineCipher } from './affine'
import { VigenereCipher } from './vigenere'
import { HillCipher } from './hill'
import { PermutationCipher } from './permutation'
import { AutokeyCipher } from './autokey'

export {
  ShiftCipher,
  SubstitutionCipher,
  AffineCipher,
  VigenereCipher,
  HillCipher,
  PermutationCipher,
  AutokeyCipher,
}

export const ciphers: Record<string, Cipher> = {
  shift: ShiftCipher,
  substitution: SubstitutionCipher,
  affine: AffineCipher,
  vigenere: VigenereCipher,
  hill: HillCipher,
  permutation: PermutationCipher,
  autokey: AutokeyCipher,
}

export function getCipher(id: string): Cipher {
  return ciphers[id] || ShiftCipher
}
