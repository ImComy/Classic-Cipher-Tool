import React from 'react'
import { useAppSelector } from '../store'
import { ShiftKeyInput } from '../features/cipher/keyInputs/ShiftKeyInput'
import { SubstitutionKeyInput } from '../features/cipher/keyInputs/SubstitutionKeyInput'
import { AffineKeyInput } from '../features/cipher/keyInputs/AffineKeyInput'
import { VigenereKeyInput } from '../features/cipher/keyInputs/VigenereKeyInput'
import { HillKeyInput } from '../features/cipher/keyInputs/HillKeyInput'
import { PermutationKeyInput } from '../features/cipher/keyInputs/PermutationKeyInput'
import { AutokeyKeyInput } from '../features/cipher/keyInputs/AutokeyKeyInput'

export const KeyInputArea: React.FC = () => {
  const selectedCipher = useAppSelector(state => state.cipher.selectedCipher)

  const renderKeyInput = () => {
    switch (selectedCipher) {
      case 'shift':
        return <ShiftKeyInput />
      case 'substitution':
        return <SubstitutionKeyInput />
      case 'affine':
        return <AffineKeyInput />
      case 'vigenere':
        return <VigenereKeyInput />
      case 'hill':
        return <HillKeyInput />
      case 'permutation':
        return <PermutationKeyInput />
      case 'autokey':
        return <AutokeyKeyInput />
      default:
        return <div className="text-gray-400">Select a cipher</div>
    }
  }

  return (
    <div
      className="bg-gray-50 rounded px-3 md:px-5 py-3 border border-gray-200 mb-3 flex flex-wrap gap-3 items-start transition"
      id="keyInputArea"
    >
      {renderKeyInput()}
    </div>
  )
}
