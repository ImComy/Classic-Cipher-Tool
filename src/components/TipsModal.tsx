import React from 'react'
import { Modal } from './ui/Modal'
import { ALPHABET } from '../lib/utils/string'

interface TipsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-lightbulb text-primary-500"></i> Tips &amp; Reference
        </>
      }
      maxWidth="max-w-3xl"
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <i className="fas fa-sort-alpha-up text-primary-400"></i> Alphabet Index
        </h3>
        <div className="tip-card">
          <div className="tip-body" style={{ paddingLeft: 0 }}>
            <div className="flex flex-wrap gap-1 text-sm">
              {ALPHABET.split('').map((letter, idx) => (
                <span key={letter} className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">
                  {letter} <code className="text-gray-500 ml-0.5">{idx}</code>
                </span>
              ))}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              A=0, B=1, …, Z=25 (mod 26 arithmetic). Numbers in keys → letters.
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
          <i className="fas fa-code text-primary-400"></i> Cipher Reference
        </h3>

        <div className="tip-card">
          <div className="tip-title">
            Shift (Caesar) <code>E(x) = (x + k) mod 26</code>
          </div>
          <div className="tip-body">
            Shift each letter by a fixed number <strong>k</strong>. Decryption:{' '}
            <code>D(y) = (y - k) mod 26</code>.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Substitution <code>mapping: A→…, B→…</code>
          </div>
          <div className="tip-body">
            Replace each letter with another according to a fixed permutation. Frequency analysis
            helps.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Affine <code>E(x) = (a·x + b) mod 26</code>
          </div>
          <div className="tip-body">
            Requires <strong>gcd(a, 26) = 1</strong>. Decryption:{' '}
            <code>D(y) = a⁻¹·(y - b) mod 26</code>.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Vigenère <code>Cᵢ = (Pᵢ + Kᵢ) mod 26</code>
          </div>
          <div className="tip-body">
            Uses a repeating keyword. Decryption: <code>Pᵢ = (Cᵢ - Kᵢ) mod 26</code>.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Hill <code>n×n matrix</code>
          </div>
          <div className="tip-body">
            Encrypts blocks using matrix multiplication. Requires invertible matrix mod 26.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Permutation (Transposition) <code>reorder positions</code>
          </div>
          <div className="tip-body">
            Rearranges characters according to a fixed permutation.
          </div>
        </div>

        <div className="tip-card">
          <div className="tip-title">
            Autokey <code>key extends with plaintext</code>
          </div>
          <div className="tip-body">
            Vigenère variant where the key is extended by the plaintext itself.
          </div>
        </div>
      </div>
    </Modal>
  )
}
