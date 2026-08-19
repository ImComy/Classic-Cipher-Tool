import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { setLivePreview } from '../../store/slices/labSlice'
import { ShiftCipher } from '../../lib/ciphers/shift'
import { AffineCipher } from '../../lib/ciphers/affine'
import { VigenereCipher } from '../../lib/ciphers/vigenere'
import { cleanText } from '../../lib/utils/string'

export function useLivePreview() {
  const dispatch = useAppDispatch()
  const {
    ciphertext,
    activeLabTool,
    subMapping,
    affineA,
    affineB,
    caesarShift,
    vigenereKey,
  } = useAppSelector(state => state.lab)

  useEffect(() => {
    if (!ciphertext) {
      dispatch(setLivePreview(''))
      return
    }

    let result = ''
    const s = cleanText(ciphertext)

    switch (activeLabTool) {
      case 'substitution': {
        for (const char of s) {
          result += subMapping[char] || char
        }
        break
      }
      case 'caesar': {
        if (caesarShift !== null) {
          result = ShiftCipher.decrypt(s, { k: caesarShift }).result
        } else {
          result = s
        }
        break
      }
      case 'affine': {
        result = AffineCipher.decrypt(s, { a: affineA, b: affineB }).result
        break
      }
      case 'vigenere': {
        if (vigenereKey) {
          result = VigenereCipher.decrypt(s, { key: vigenereKey }).result
        } else {
          result = s
        }
        break
      }
      default: {
        result = s
        break
      }
    }

    dispatch(setLivePreview(result.startsWith('ERROR') ? s : result))
  }, [
    ciphertext,
    activeLabTool,
    subMapping,
    affineA,
    affineB,
    caesarShift,
    vigenereKey,
    dispatch,
  ])
}
