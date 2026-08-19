import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { setCipher, setOperation } from '../../store/slices/cipherSlice'
import { Button } from '../../components/ui/Button'
import { useCipherRunner } from '../../hooks/useCipherRunner'

export const CipherSelector: React.FC = () => {
  const dispatch = useAppDispatch()
  const { selectedCipher, operation } = useAppSelector(state => state.cipher)
  const { runCipher } = useCipherRunner()

  return (
    <div className="flex flex-wrap gap-3 items-end mb-3">
      <div className="flex-1 min-w-[120px]">
        <label
          htmlFor="cipherSelect"
          className="block text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wider mb-0.5"
        >
          Cipher
        </label>
        <select
          id="cipherSelect"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          value={selectedCipher}
          onChange={e => dispatch(setCipher(e.target.value))}
        >
          <option value="shift">Shift (Caesar)</option>
          <option value="substitution">Substitution</option>
          <option value="affine">Affine</option>
          <option value="vigenere">Vigenère</option>
          <option value="hill">Hill</option>
          <option value="permutation">Permutation</option>
          <option value="autokey">Autokey</option>
        </select>
      </div>

      <div className="flex-1 min-w-[120px]">
        <label
          htmlFor="opSelect"
          className="block text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wider mb-0.5"
        >
          Operation
        </label>
        <select
          id="opSelect"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          value={operation}
          onChange={e => dispatch(setOperation(e.target.value as 'encrypt' | 'decrypt'))}
        >
          <option value="encrypt">Encrypt</option>
          <option value="decrypt">Decrypt</option>
        </select>
      </div>

      <div className="flex-none flex gap-1.5">
        <label className="block text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wider mb-0.5 select-none">
          &nbsp;
        </label>
        <Button variant="primary" size="md" id="runBtn" onClick={() => runCipher()}>
          <i className="fas fa-play mr-2"></i> Run
        </Button>
        <Button
          variant="amber"
          size="md"
          id="stepsBtn"
          onClick={() => runCipher({ openStepsModal: true })}
        >
          <i className="fas fa-list-ul mr-2"></i> Steps
        </Button>
      </div>
    </div>
  )
}
