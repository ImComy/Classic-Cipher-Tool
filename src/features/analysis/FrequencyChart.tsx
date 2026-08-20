import React from 'react'
import { type FrequencyAnalysisResult, ENGLISH_FREQ } from '../../lib/utils/frequency'
import { ALPHABET } from '../../lib/utils/string'
import { RepeatedSubstringsView } from './RepeatedSubstringsView'

interface FrequencyChartProps {
  analysis: FrequencyAnalysisResult
  text: string
}

export const FrequencyChart: React.FC<FrequencyChartProps> = ({ analysis, text }) => {
  const { counts, total, unique, mostCommon, ic, percentages, kasiski } = analysis

  const icPct = Math.min((ic / 0.1) * 100, 100)

  const maxPct = Math.max(
    ...ALPHABET.split('').map(c => percentages[c] || 0),
    5
  )
  const scale = 140 / Math.max(maxPct, 5)

  return (
    <div className="w-full">
      {/* Stats summary */}
      <div id="analysisStats" className="flex flex-wrap gap-1.5 md:gap-3 mt-2 text-sm">
        <span className="bg-gray-50 px-3 py-0.5 rounded-full border border-gray-200">
          Letters: <strong className="text-gray-800">{total}</strong>
        </span>
        <span className="bg-gray-50 px-3 py-0.5 rounded-full border border-gray-200">
          Unique: <strong className="text-gray-800">{unique}</strong>
        </span>
        <span className="bg-gray-50 px-3 py-0.5 rounded-full border border-gray-200">
          Most common: <strong className="text-gray-800">{mostCommon}</strong>
        </span>
      </div>

      {/* Index of Coincidence */}
      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Index of Coincidence (IC)</span>
          <span id="icValue" className="text-sm font-bold text-gray-900">
            {ic.toFixed(6)}
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2.5 mt-1 overflow-hidden">
          <div
            id="icBar"
            className="ic-bar-bg h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? icPct : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.65rem] text-gray-400 mt-0.5">
          <span>Random ~0.038</span>
          <span>English ~0.066</span>
        </div>
      </div>

      {/* Kasiski key-length analysis */}
      <div className="bg-white rounded border border-gray-200 p-3 mt-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Vigenere key length</h3>
            <p className="text-xs text-gray-400">
              Kasiski repetition and column IC scores for every length supported by this text.
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Recommended:{' '}
            <span id="recommendedKeyLength" className="text-primary-600">
              {kasiski.recommendedLength ? `${kasiski.recommendedLength} characters` : '—'}
            </span>
          </span>
        </div>
        {total > 0 ? (
          <>
            <div className="overflow-x-auto">
              <div className="key-length-chart mt-3" id="kasiskiChart">
                {kasiski.scores.map(candidate => {
                  const maxScore = Math.max(...kasiski.scores.map(item => item.score), 1)
                  const height = Math.max((candidate.score / maxScore) * 92, 4)
                  const recommended = candidate.length === kasiski.recommendedLength

                  return (
                    <div key={candidate.length} className="key-length-bar-wrap">
                      <div
                        className={`key-length-bar${recommended ? ' recommended' : ''}`}
                        style={{ height: `${height}px` }}
                        title={`Length ${candidate.length}: score ${candidate.score.toFixed(2)}, Kasiski ${candidate.kasiskiScore}, IC ${candidate.averageIC.toFixed(3)}`}
                      />
                      <span className={`key-length-label${recommended ? ' recommended' : ''}`}>
                        {candidate.length}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between text-[0.65rem] text-gray-400 mt-1">
              <span>Candidate length</span>
              <span>{kasiski.repeatedSequences} repeated sequence group{kasiski.repeatedSequences === 1 ? '' : 's'}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm mt-3">Enter letters to estimate a key length.</p>
        )}
      </div>

      {/* Frequency Bar Chart */}
      <div className="bg-white rounded border border-gray-200 p-3 mt-2 overflow-x-auto">
        {total > 0 ? (
          <>
            <div className="flex items-end justify-center h-[150px] gap-1 overflow-hidden min-w-max">
              {ALPHABET.split('').map(c => {
                const pct = percentages[c] || 0
                const eng = ENGLISH_FREQ[c] || 0
                const h1 = Math.max(pct * scale, 2)
                const h2 = Math.max(eng * scale, 2)

                return (
                  <div key={c} className="flex flex-col items-center justify-end flex-shrink-0">
                    <div className="flex items-end gap-0.5">
                      <div
                        className="w-2 sm:w-2.5 md:w-3 bg-primary-500 rounded-t-sm"
                        style={{ height: `${h1}px` }}
                        title={`${c}: ${counts[c] || 0} (${pct.toFixed(1)}%)`}
                      />
                      <div
                        className="w-2 sm:w-2.5 md:w-3 bg-accent-300 rounded-t-sm opacity-60"
                        style={{ height: `${h2}px` }}
                        title={`English average: ${eng}%`}
                      />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{c}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap gap-3 justify-center text-sm text-gray-600 mt-2">
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-primary-500 align-middle mr-1.5"></span>{' '}
                Your text
              </span>
              <span>
                <span className="inline-block w-3 h-3 rounded-sm bg-accent-300 align-middle mr-1.5 opacity-60"></span>{' '}
                English average
              </span>
            </div>
            <div className="text-gray-400 text-sm text-center mt-1" id="chartNote">
              Based on {total} characters. Blue = your text, orange = English average.
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-sm text-center py-6">
            Enter text in the main workspace and click Analyze.
          </div>
        )}
      </div>

      {/* Repeated Substrings - now using the new component */}
      <RepeatedSubstringsView text={text} />
    </div>
  )
}