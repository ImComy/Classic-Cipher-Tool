import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  mod,
  detMatrix,
  gcd,
  adjugateMatrix,
  inverseMatrix,
  modInv,
} from '../../lib/utils/math';

// ── Scalable SVG bracket ──
const Bracket: React.FC<{ side: 'left' | 'right'; height: number }> = ({ side, height }) => {
  const strokeWidth = 2.5;
  const capLength = 8;
  const path =
    side === 'left'
      ? `M ${capLength} 2 L 2 2 L 2 ${height - 2} L ${capLength} ${height - 2}`
      : `M ${2} 2 L ${capLength} 2 L ${capLength} ${height - 2} L ${2} ${height - 2}`;
  return (
    <svg
      width={capLength + 4}
      height={height}
      viewBox={`0 0 ${capLength + 4} ${height}`}
      className="flex-shrink-0"
      style={{ display: 'block' }}
    >
      <path
        d={path}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ── Matrix renderer with proper brackets ──
const renderMatrixWithBrackets = (mat: number[][], label?: string) => {
  const n = mat.length;
  const cellSize = Math.min(48, Math.max(32, 64 / Math.sqrt(n)));
  // Approximate total height: each cell has aspect-ratio 1, plus gaps
  const totalHeight = n * (cellSize + 4) + 4;

  return (
    <div className="flex flex-col items-center w-full">
      {label && (
        <div className="text-xs font-medium text-gray-500 mb-2 tracking-wide">
          {label}
        </div>
      )}
      <div
        className="flex items-stretch justify-center w-full"
        style={{ maxWidth: `${Math.min(n * (cellSize + 6) + 32, 560)}px` }}
      >
        {/* Left bracket */}
        <Bracket side="left" height={totalHeight} />

        {/* Matrix grid */}
        <div
          className="grid flex-1"
          style={{
            gridTemplateColumns: `repeat(${n}, 1fr)`,
            gap: '4px',
            padding: '2px 0',
          }}
        >
          {mat.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="flex items-center justify-center font-mono font-medium text-gray-800 bg-white border border-gray-200 rounded-md shadow-sm"
                style={{
                  aspectRatio: '1 / 1',
                  minWidth: `${cellSize}px`,
                  minHeight: `${cellSize}px`,
                  fontSize: `${Math.max(12, Math.min(16, 22 / Math.sqrt(n)))}px`,
                }}
              >
                {mod(cell)}
              </div>
            ))
          )}
        </div>

        {/* Right bracket */}
        <Bracket side="right" height={totalHeight} />
      </div>
    </div>
  );
};

export const HillMatrixTool: React.FC = () => {
  const [size, setSize] = useState(3);
  const [matrix, setMatrix] = useState<number[][]>([
    [3, 2, 1],
    [1, 7, 2],
    [2, 3, 5],
  ]);
  const [result, setResult] = useState<{
    type: 'det' | 'adj' | 'inverse';
    content: string | React.ReactNode;
  } | null>(null);

  const handleSizeChange = (newSize: number) => {
    const s = Math.max(2, Math.min(10, newSize));
    setSize(s);
    const newMat: number[][] = Array.from({ length: s }, (_, r) =>
      Array.from({ length: s }, (_, c) => {
        return matrix[r] && matrix[r][c] !== undefined ? matrix[r][c] : r === c ? 1 : 0;
      })
    );
    setMatrix(newMat);
    setResult(null);
  };

  const handleCellChange = (r: number, c: number, valStr: string) => {
    const val = parseInt(valStr, 10);
    const newMat = matrix.map((row, rowIdx) =>
      row.map((cell, colIdx) =>
        rowIdx === r && colIdx === c ? (isNaN(val) ? 0 : mod(val)) : cell
      )
    );
    setMatrix(newMat);
    setResult(null);
  };

  const handleRandom = () => {
    let candidate: number[][] = [];
    let det = 0;
    let attempts = 0;
    do {
      candidate = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * 26))
      );
      det = detMatrix(candidate);
      attempts++;
    } while ((det === -1 || gcd(det, 26) !== 1) && attempts < 300);

    if (det !== -1 && gcd(det, 26) === 1) {
      setMatrix(candidate);
    } else {
      setMatrix(
        Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => (r === c ? 1 : 0))
        )
      );
    }
    setResult(null);
  };

  const det = detMatrix(matrix);
  const gcdVal = gcd(det, 26);
  const adj = adjugateMatrix(matrix);
  const inv = inverseMatrix(matrix);
  const invDet = modInv(det);
  const isInvertible = gcdVal === 1;

  // ── Result handlers ──
  const handleDet = () => {
    setResult({
      type: 'det',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="inline-block w-1 h-4 bg-indigo-500 rounded-full" />
            Determinant
          </div>
          <div className="flex items-baseline gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-500 font-mono">det(K) =</span>
            <span className="text-2xl font-bold text-indigo-600 font-mono tracking-tight">
              {det}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 border ${isInvertible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
          >
            <span className="font-medium">gcd(det(K), 26) = {gcdVal}</span>
            <span className="mx-1">—</span>
            {isInvertible ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-500">✅</span> Invertible
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="text-rose-500">❌</span> Not invertible
                </span>
              </>
            )}
          </div>
        </div>
      ),
    });
  };

  const handleAdj = () => {
    setResult({
      type: 'adj',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="inline-block w-1 h-4 bg-amber-500 rounded-full" />
            Adjugate Matrix
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {renderMatrixWithBrackets(adj, 'Adj(K)')}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <span className="text-gray-400">ⓘ</span>
            Adj(K) is the transpose of the cofactor matrix.
          </div>
        </div>
      ),
    });
  };

  const handleInverse = () => {
    if (!isInvertible) {
      setResult({
        type: 'inverse',
        content: (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-start gap-3">
            <span className="text-rose-500 text-lg mt-0.5">⚠️</span>
            <div>
              <div className="font-medium">Matrix not invertible</div>
              <div className="text-rose-600/80 mt-0.5">
                gcd(det(K), 26) = {gcdVal} ≠ 1
              </div>
            </div>
          </div>
        ),
      });
      return;
    }

    setResult({
      type: 'inverse',
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="inline-block w-1 h-4 bg-emerald-500 rounded-full" />
            Inverse Matrix
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="text-xs text-gray-400 font-medium mb-1">det(K)</div>
              <div className="font-mono text-lg font-bold text-indigo-600">{det}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <div className="text-xs text-gray-400 font-medium mb-1">det(K)⁻¹</div>
              <div className="font-mono text-lg font-bold text-emerald-600">
                {invDet}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            {renderMatrixWithBrackets(inv!, 'K⁻¹')}
          </div>
        </div>
      ),
    });
  };

  // ── Main render ──
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-100/50 overflow-hidden transition-all duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-b border-gray-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
                Hill Matrix Utilities
              </h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                mod 26 — det(K), Adj(K), K⁻¹
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-gray-50/80 rounded-xl px-4 py-3 border border-gray-200/60">
            <div className="flex items-center gap-2.5">
              <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                Dimension
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={size}
                  onChange={(e) =>
                    handleSizeChange(parseInt(e.target.value, 10) || 2)
                  }
                  min={2}
                  max={10}
                  className="w-14 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all shadow-sm"
                />
                <span className="text-sm font-mono text-gray-400">× {size}</span>
              </div>
            </div>
            <div className="w-px h-6 bg-gray-300/60 hidden sm:block" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandom}
              className="flex items-center gap-1.5 text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Random
            </Button>
            <div className="flex-1" />
            <div className="text-[10px] text-gray-400 font-mono bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
              ℤ₂₆
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Matrix Input */}
            <div className="bg-gray-50/80 rounded-xl border border-gray-200/60 p-4 transition-all">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3">
                <span className="inline-block w-1 h-3.5 bg-indigo-500 rounded-full" />
                Matrix K
              </div>
              <div className="flex justify-center">
                <div
                  className="flex items-stretch justify-center w-full"
                  style={{
                    maxWidth: `${Math.min(size * 52 + 32, 480)}px`,
                  }}
                >
                  {/* Left bracket */}
                  <Bracket
                    side="left"
                    height={size * (48 + 4) + 4} // approximate height
                  />

                  {/* Input Grid */}
                  <div
                    className="grid flex-1"
                    style={{
                      gridTemplateColumns: `repeat(${size}, 1fr)`,
                      gap: '4px',
                      padding: '2px 0',
                    }}
                  >
                    {matrix.map((row, r) =>
                      row.map((cell, c) => (
                        <input
                          key={`${r}-${c}`}
                          type="number"
                          value={cell}
                          min={0}
                          max={25}
                          onChange={(e) =>
                            handleCellChange(r, c, e.target.value)
                          }
                          className="w-full aspect-square px-0.5 py-0 text-sm font-mono text-center border border-gray-300 rounded-md bg-white text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all shadow-sm hover:border-gray-400"
                          style={{
                            fontSize: `${Math.max(12, Math.min(16, 22 / Math.sqrt(size)))}px`,
                          }}
                        />
                      ))
                    )}
                  </div>

                  {/* Right bracket */}
                  <Bracket
                    side="right"
                    height={size * (48 + 4) + 4}
                  />
                </div>
              </div>
              <div className="text-[10px] text-gray-400 text-center mt-3 font-mono">
                Enter values 0–25
              </div>
            </div>

            {/* Results */}
            <div className="bg-gray-50/80 rounded-xl border border-gray-200/60 p-4 transition-all min-h-[200px] flex flex-col">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 tracking-wide uppercase mb-3">
                <span className="inline-block w-1 h-3.5 bg-purple-500 rounded-full" />
                Results
              </div>
              <div className="flex-1">
                {result ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {result.content}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <div className="text-4xl text-gray-300 mb-3">⌨️</div>
                    <div className="text-sm text-gray-400 font-medium">
                      Click a button to compute
                    </div>
                    <div className="text-xs text-gray-400/70 mt-1">
                      Det(K) · Adj(K) · K⁻¹
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDet}
              className="flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-6 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Det(K)
            </Button>
            <Button
              variant="amber"
              size="sm"
              onClick={handleAdj}
              className="flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Adj(K)
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={handleInverse}
              className="flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              K⁻¹
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};