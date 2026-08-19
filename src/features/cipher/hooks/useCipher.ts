import { useAppDispatch, useAppSelector } from '../../../store'
import { setCipher, setOperation, setInputText, setKeyData } from '../../../store/slices/cipherSlice'
import { useCipherRunner } from '../../../hooks/useCipherRunner'

export function useCipher() {
  const dispatch = useAppDispatch()
  const cipherState = useAppSelector(state => state.cipher)
  const { runCipher } = useCipherRunner()

  const changeCipher = (cipher: string) => dispatch(setCipher(cipher))
  const changeOperation = (op: 'encrypt' | 'decrypt') => dispatch(setOperation(op))
  const changeInputText = (text: string) => dispatch(setInputText(text))
  const updateKeyData = (data: Record<string, any>) => dispatch(setKeyData(data))

  return {
    ...cipherState,
    changeCipher,
    changeOperation,
    changeInputText,
    updateKeyData,
    runCipher,
  }
}
