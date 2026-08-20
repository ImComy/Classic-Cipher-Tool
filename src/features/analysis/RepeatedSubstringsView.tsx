import React, { useState, useMemo, useEffect } from 'react'

interface RepeatedSubstring {
  substring: string
  count: number
  positions: number[]
}

interface TreeNode {
  substring: string
  count: number
  positions: number[]
  color: string
  depth: number
  parent: TreeNode | null
  children: TreeNode[]
}

interface RepeatedSubstringsViewProps {
  text: string
}

const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#73C6B6',
  '#E59866', '#AF7AC5', '#5DADE2', '#58D68D', '#F4D03F'
]

export const RepeatedSubstringsView: React.FC<RepeatedSubstringsViewProps> = ({ text }) => {
  const cleanText = useMemo(() => text.replace(/[^a-zA-Z]/g, ''), [text])
  const lowerText = useMemo(() => cleanText.toLowerCase(), [cleanText])

  // 1. Unrestricted discovery of all repeating substrings in the input text
  const allDiscoveredPatterns = useMemo((): RepeatedSubstring[] => {
    if (lowerText.length < 2) return []

    const substrMap = new Map<string, number[]>()
    for (let len = 2; len < lowerText.length; len++) {
      for (let i = 0; i <= lowerText.length - len; i++) {
        const sub = lowerText.slice(i, i + len)
        if (!substrMap.has(sub)) {
          substrMap.set(sub, [])
        }
        substrMap.get(sub)!.push(i)
      }
    }

    const candidates: RepeatedSubstring[] = []
    for (const [sub, positions] of substrMap) {
      if (positions.length >= 2) {
        candidates.push({ substring: sub, count: positions.length, positions })
      }
    }

    candidates.sort((a, b) => b.substring.length - a.substring.length || b.count - a.count)
    return candidates
  }, [lowerText])

  // Automatically determine max pattern size and max frequency count from discovered patterns
  const maxPatternSize = useMemo(() => {
    if (allDiscoveredPatterns.length === 0) return 2
    return Math.max(...allDiscoveredPatterns.map(p => p.substring.length))
  }, [allDiscoveredPatterns])

  const maxMinCount = useMemo(() => {
    if (allDiscoveredPatterns.length === 0) return 2
    return Math.max(...allDiscoveredPatterns.map(p => p.count))
  }, [allDiscoveredPatterns])

  const [patternSize, setPatternSize] = useState<number>(2)
  const [minCount, setMinCount] = useState<number>(2)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)

  // Auto-default to the largest discovered pattern size whenever input text changes
  useEffect(() => {
    setPatternSize(maxPatternSize)
    setMinCount(2)
    setSelectedPattern(null)
  }, [cleanText, maxPatternSize, maxMinCount])

  // 2. Filter repeating substrings based on min count setting
  const filteredPatterns = useMemo(() => {
    return allDiscoveredPatterns.filter(p => p.count >= minCount)
  }, [allDiscoveredPatterns, minCount])

  // 3. Build containment tree
  const tree = useMemo((): TreeNode[] => {
    const nodes: TreeNode[] = filteredPatterns.map((item, idx) => ({
      ...item,
      color: colorPalette[idx % colorPalette.length],
      depth: 0,
      parent: null,
      children: [],
    }))

    for (const node of nodes) {
      let parent: TreeNode | null = null
      let minParentLen = Infinity
      for (const other of nodes) {
        if (other === node) continue
        if (other.substring.length > node.substring.length && other.substring.includes(node.substring)) {
          const isPositionalChild = node.positions.some(posB =>
            other.positions.some(posA => posA <= posB && (posB + node.substring.length) <= (posA + other.substring.length))
          )
          if (isPositionalChild && other.substring.length < minParentLen) {
            parent = other
            minParentLen = other.substring.length
          }
        }
      }
      if (parent) {
        node.parent = parent
        parent.children.push(node)
      }
    }

    const computeDepth = (node: TreeNode, depth: number) => {
      node.depth = depth
      for (const child of node.children) {
        computeDepth(child, depth + 1)
      }
    }
    const roots = nodes.filter(n => n.parent === null)
    roots.forEach(root => computeDepth(root, 0))

    return nodes
  }, [filteredPatterns])

  const selectedNode = useMemo(() => {
    if (!selectedPattern) return null
    return tree.find(n => n.substring === selectedPattern) || null
  }, [selectedPattern, tree])

  // Active patterns matching current pattern size
  const sameSizePatterns = useMemo(() => {
    return tree.filter(n => n.substring.length === patternSize)
  }, [tree, patternSize])

  // Currently displayed patterns on screen
  const activeDisplayedPatterns = useMemo(() => {
    if (selectedNode) return [selectedNode]
    return sameSizePatterns
  }, [selectedNode, sameSizePatterns])

  const handleSelectPattern = (substring: string) => {
    if (selectedPattern === substring) {
      setSelectedPattern(null)
    } else {
      setSelectedPattern(substring)
      setPatternSize(substring.length)
    }
  }

  // 4. Render highlighted text
  const highlightedText = useMemo(() => {
    if (!cleanText) return <span className="text-gray-400">No text provided.</span>

    const charStyles: ({ color: string; label: string } | null)[] = new Array(cleanText.length).fill(null)

    if (selectedNode) {
      for (const pos of selectedNode.positions) {
        for (let i = pos; i < pos + selectedNode.substring.length; i++) {
          charStyles[i] = { color: selectedNode.color, label: selectedNode.substring }
        }
      }
    } else if (sameSizePatterns.length > 0) {
      for (const patternNode of sameSizePatterns) {
        for (const pos of patternNode.positions) {
          for (let i = pos; i < pos + patternNode.substring.length; i++) {
            charStyles[i] = { color: patternNode.color, label: patternNode.substring }
          }
        }
      }
    }

    return (
      <div className="font-mono text-xs sm:text-sm leading-relaxed break-all max-w-full overflow-x-auto">
        {cleanText.split('').map((char, i) => {
          const styleInfo = charStyles[i]
          return (
            <span
              key={i}
              title={styleInfo ? `Pattern: ${styleInfo.label}` : undefined}
              className={`inline-block text-center px-0.5 rounded transition-all duration-150 ${
                styleInfo ? 'font-bold shadow-sm' : ''
              }`}
              style={
                styleInfo
                  ? { backgroundColor: styleInfo.color, color: '#ffffff' }
                  : { color: 'inherit' }
              }
            >
              {char}
            </span>
          )
        })}
      </div>
    )
  }, [cleanText, selectedNode, sameSizePatterns])

  // 5. Render tree preview
  const renderTree = (nodes: TreeNode[]) => {
    const roots = nodes.filter(n => n.parent === null)

    const renderNode = (node: TreeNode) => {
      const isSelected = selectedPattern === node.substring
      const isSameSize = node.substring.length === patternSize

      return (
        <div key={node.substring} className="flex flex-col">
          <div
            className={`flex items-center gap-2 py-1.5 px-2.5 rounded cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-100 text-blue-950 font-bold border-l-4 border-blue-600'
                : isSameSize
                ? 'bg-gray-100 text-gray-900 font-semibold'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
            onClick={() => handleSelectPattern(node.substring)}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: node.color }}
            />
            <span className="font-mono text-xs sm:text-sm tracking-wide">
              {node.substring}
            </span>
            <span className="text-gray-400 text-xs font-sans">
              (×{node.count})
            </span>
            <span className="text-gray-400 text-[10px] font-sans ml-auto">
              len: {node.substring.length}
            </span>
          </div>

          {node.children.length > 0 && (
            <div className="ml-3 pl-3 border-l-2 border-gray-200 flex flex-col gap-1 my-0.5">
              {[...node.children]
                .sort((a, b) => b.count - a.count)
                .map(child => renderNode(child))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-1">
        {roots.map(root => renderNode(root))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded border border-gray-200 p-3 sm:p-4 mt-2 shadow-sm max-w-full overflow-hidden">
      {/* Dynamic Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800">Repeated Substrings Analysis</h3>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-600">
          <label className="flex items-center gap-2">
            <span>Pattern Size:</span>
            <input
              type="range"
              min="2"
              max={maxPatternSize}
              value={patternSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10)
                setPatternSize(newSize)
                setSelectedPattern(null)
              }}
              className="w-20 sm:w-24 accent-blue-600"
            />
            <span className="font-mono font-bold text-blue-600 w-5 text-right">
              {patternSize}
            </span>
          </label>

          <label className="flex items-center gap-2">
            <span>Min Count:</span>
            <input
              type="range"
              min="2"
              max={maxMinCount}
              value={minCount}
              onChange={(e) => {
                setMinCount(parseInt(e.target.value, 10))
                setSelectedPattern(null)
              }}
              className="w-16 sm:w-20 accent-blue-600"
            />
            <span className="font-mono font-bold text-blue-600 w-5 text-right">
              {minCount}
            </span>
          </label>
        </div>
      </div>

      {/* Active Pattern Tags Top Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-medium text-gray-600">
            {selectedPattern
              ? 'Selected Pattern:'
              : `Active Patterns (Size ${patternSize}):`}
          </span>
          {selectedPattern && (
            <button
              onClick={() => setSelectedPattern(null)}
              className="text-blue-600 hover:underline font-medium"
            >
              Reset to General View
            </button>
          )}
        </div>

        {activeDisplayedPatterns.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeDisplayedPatterns.map((node) => {
              const isSelected = selectedPattern === node.substring
              return (
                <button
                  key={node.substring}
                  onClick={() => handleSelectPattern(node.substring)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all hover:scale-105 cursor-pointer text-white shadow-sm ${
                    isSelected
                      ? 'ring-2 ring-blue-600 ring-offset-1 font-bold'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: node.color }}
                  title={`Click to ${isSelected ? 'unselect' : 'isolate'} "${node.substring}"`}
                >
                  <span>{node.substring}</span>
                  <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px] font-sans">
                    ×{node.count}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">
            No patterns found at size {patternSize} with count ≥ {minCount}.
          </span>
        )}
      </div>

      {/* Text Preview Box */}
      <div className="mb-4">
        <div className="border border-gray-200 rounded p-3 sm:p-4 bg-gray-50 min-h-[60px] max-w-full overflow-x-auto">
          {highlightedText}
        </div>
      </div>

      {/* Containment Tree Preview */}
      <div className="border-t border-gray-200 pt-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Containment Tree ({tree.length} total patterns)
        </div>
        {tree.length > 0 ? (
          <div className="max-h-64 sm:max-h-72 overflow-y-auto pr-1">
            {renderTree(tree)}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            No repeated substrings found with count ≥ {minCount}.
          </p>
        )}
      </div>
    </div>
  )
}