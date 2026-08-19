import { useAppDispatch, useAppSelector } from '../store'
import { setOutputText, setKeyUsed } from '../store/slices/cipherSlice'
import { setStepsData, setModalOpen } from '../store/slices/stepsSlice'
import { setStatus, setLastRun } from '../store/slices/uiSlice'
import { getCipher } from '../lib/ciphers'
import { parseKeyWithNumbers } from '../lib/utils/string'

export function formatKeyString(cipherId: string, keyData: Record<string, any>): string {
  switch (cipherId) {
    case 'shift':
      return String(keyData?.k ?? 3)
    case 'substitution': {
      const raw = keyData?.map || 'QWERTYUIOPASDFGHJKLZXCVBNM'
      const parsed = parseKeyWithNumbers(raw)
      return parsed.replace(/[^A-Z]/g, '') || raw
    }
    case 'affine':
      return `${keyData?.a ?? 5}, ${keyData?.b ?? 3}`
    case 'vigenere': {
      const raw = keyData?.key || 'KEY'
      const parsed = parseKeyWithNumbers(raw)
      return parsed.replace(/[^A-Z]/g, '') || raw
    }
    case 'hill': {
      const matrix = keyData?.matrix || [
        [3, 2],
        [1, 4],
      ]
      return matrix.map((row: number[]) => row.join(',')).join(';')
    }
    case 'permutation':
      return keyData?.perm || '2,4,1,3'
    case 'autokey': {
      const raw = keyData?.key || 'SECRET'
      const parsed = parseKeyWithNumbers(raw)
      return parsed.replace(/[^A-Z]/g, '') || raw
    }
    default:
      return '—'
  }
}

export function useCipherRunner() {
  const dispatch = useAppDispatch()
  const { selectedCipher, operation, inputText, keyData } = useAppSelector(state => state.cipher)

  const runCipher = (options?: { openStepsModal?: boolean }) => {
    const cipher = getCipher(selectedCipher)
    const decrypt = operation === 'decrypt'

    try {
      const cipherResult = decrypt
        ? cipher.decrypt(inputText, keyData)
        : cipher.encrypt(inputText, keyData)

      const keyStr = formatKeyString(selectedCipher, keyData)

      if (cipherResult.result.startsWith('ERROR')) {
        dispatch(setOutputText(cipherResult.result))
        dispatch(setStatus('Error'))
      } else {
        dispatch(setOutputText(cipherResult.result || '(empty)'))
        dispatch(setStatus('Done'))
      }

      dispatch(
        setStepsData({
          steps: cipherResult.steps,
          cipherName: cipher.name,
          operationName: operation.charAt(0).toUpperCase() + operation.slice(1),
          finalResult: cipherResult.result,
        })
      )

      dispatch(setLastRun(new Date().toLocaleTimeString()))
      dispatch(setKeyUsed(keyStr))

      if (options?.openStepsModal) {
        dispatch(setModalOpen(true))
      }

      return cipherResult
    } catch (e: any) {
      const errMsg = 'ERROR: ' + (e?.message || 'Unknown error')
      dispatch(setOutputText(errMsg))
      dispatch(setStatus('Error'))
      dispatch(
        setStepsData({
          steps: [{ type: 'error', label: 'Exception', detail: e?.message || 'Unknown exception' }],
          cipherName: cipher.name,
          operationName: operation.charAt(0).toUpperCase() + operation.slice(1),
          finalResult: errMsg,
        })
      )
      if (options?.openStepsModal) {
        dispatch(setModalOpen(true))
      }
      return { result: errMsg, steps: [] }
    }
  }

  return { runCipher }
}