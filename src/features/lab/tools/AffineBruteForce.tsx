import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAffineKey } from '../../../store/slices/labSlice';
import { AffineCipher } from '../../../lib/ciphers/affine';
import { cleanText } from '../../../lib/utils/string';
import { Button } from '../../../components/ui/Button';

// All valid a values for affine cipher (gcd(a,26)=1)
const VALID_A = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];

// English letter frequencies (from Wikipedia)
const FREQ: Record<string, number> = {
  A: 0.08167, B: 0.01492, C: 0.02782, D: 0.04253, E: 0.12702,
  F: 0.02228, G: 0.02015, H: 0.06094, I: 0.06966, J: 0.00153,
  K: 0.00772, L: 0.04025, M: 0.02406, N: 0.06749, O: 0.07507,
  P: 0.01929, Q: 0.00095, R: 0.05987, S: 0.06327, T: 0.09056,
  U: 0.02758, V: 0.00978, W: 0.02360, X: 0.00150, Y: 0.01974,
  Z: 0.00074,
};

function scoreText(text: string): number {
  let score = 0;
  for (const ch of text) {
    const upper = ch.toUpperCase();
    if (FREQ[upper] !== undefined) {
      score += FREQ[upper];
    }
  }
  return score;
}

export const AffineBruteForce: React.FC = () => {
  const dispatch = useAppDispatch();
  const { ciphertext, affineKey } = useAppSelector((state) => state.lab);
  const activeRef = useRef<HTMLDivElement>(null);

  const [showAll, setShowAll] = useState(false);

  // Generate and score all candidates
  const allCandidates = useMemo(() => {
    const s = cleanText(ciphertext).substring(0, 60);
    if (!s) return [];

    const raw = [];
    for (const a of VALID_A) {
      for (let b = 0; b < 26; b++) {
        const decrypted = AffineCipher.decrypt(s, { a, b }).result;
        const score = scoreText(decrypted);
        raw.push({ a, b, text: decrypted, score });
      }
    }
    raw.sort((x, y) => y.score - x.score);
    return raw;
  }, [ciphertext]);

  // Display only top 10 unless "Show all" is active
  const displayed = useMemo(() => {
    if (showAll) return allCandidates;
    return allCandidates.slice(0, 10);
  }, [allCandidates, showAll]);

  useEffect(() => {
    if (affineKey && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [affineKey]);

  const handleClear = () => {
    dispatch(setAffineKey(null));
    dispatch(setAffineKey({ a: 1, b: 0 }));
  };

  const maxScore = allCandidates.length > 0 ? allCandidates[0].score : 1;

  if (!allCandidates.length) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-md border border-dashed border-gray-200">
        <i className="fas fa-search text-gray-300 text-xl block mb-1" />
        Enter ciphertext to see all affine possibilities.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[400px] min-h-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-50/80 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
          <span>{allCandidates.length} Keys</span>
          {affineKey && (
            <span className="text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
              a={affineKey.a}, b={affineKey.b}
            </span>
          )}
          <span className="text-gray-400 font-normal text-[9px] hidden sm:inline">
            sorted by likelihood
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="xs"
            onClick={() => setShowAll(!showAll)}
            className="text-[10px] px-2 py-0.5 h-auto text-gray-500 hover:text-gray-700"
          >
            {showAll ? 'Show Top 10' : 'Show All'}
          </Button>
          {affineKey && (
            <Button
              size="xs"
              onClick={handleClear}
              className="text-[10px] px-2 py-0.5 h-auto text-red-400 hover:text-red-600"
            >
              <i className="fas fa-times" />
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {displayed.map(({ a, b, text, score }, index) => {
          const isActive = affineKey && affineKey.a === a && affineKey.b === b;
          const isBest = index === 0 && !showAll;
          const scorePercent = maxScore > 0 ? (score / maxScore) * 100 : 0;

          return (
            <div
              key={`${a}-${b}`}
              ref={isActive ? activeRef : undefined}
              className={`
                group flex items-center gap-1.5 px-2 py-1 rounded border transition-all duration-150 cursor-pointer
                ${isActive
                  ? 'border-primary-400 bg-primary-50 shadow-sm ring-1 ring-primary-400'
                  : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                }
              `}
              onClick={() => dispatch(setAffineKey({ a, b }))}
            >
              {/* Key chip */}
              <span
                className={`
                  shrink-0 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded
                  ${isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                  }
                `}
              >
                a={a} b={b}
              </span>

              {/* Decrypted text */}
              <span className="flex-1 font-mono text-xs text-gray-700 truncate min-w-0">
                {text || ' '}
              </span>

              {/* Score bar + percentage (hidden on very small) */}
              <div className="hidden xs:flex items-center gap-1 shrink-0 w-16">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(scorePercent, 100)}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-gray-400 w-7 text-right">
                  {Math.round(scorePercent)}%
                </span>
              </div>

              {/* Best badge */}
              {isBest && (
                <span className="shrink-0 text-[8px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-200">
                  ★ Best
                </span>
              )}

              {/* Active check */}
              {isActive && (
                <i className="fas fa-check-circle text-primary-500 text-xs shrink-0" />
              )}
              {!isActive && (
                <i className="fas fa-chevron-right text-gray-300 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </div>
          );
        })}

        {/* "Show all" button at bottom if not showing all */}
        {!showAll && allCandidates.length > 10 && (
          <div
            className="text-center text-[10px] text-primary-500 cursor-pointer hover:underline py-1"
            onClick={() => setShowAll(true)}
          >
            + {allCandidates.length - 10} more…
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 px-2 py-1 border-t border-gray-100 bg-gray-50/50 text-[8px] text-gray-400 text-center">
        Click to apply • Sorted by English‑likeliness
      </div>
    </div>
  );
};