import React, { useState, useMemo, useCallback, memo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  setCiphertext,
  resetLabState,
  setActiveLabTool,
  setToolsCollapsed,
  toggleToolCollapse,
} from '../../store/slices/labSlice';
import { setInputText } from '../../store/slices/cipherSlice';
import { setWorkspace, openModal } from '../../store/slices/uiSlice';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import { useLivePreview } from './useLivePreview';
import { SubstitutionSolver } from './tools/SubstitutionSolver';
import { CaesarLabTool } from './tools/CaesarLabTool';
import { AffineLabTool } from './tools/AffineLabTool';
import { cleanText } from '../../lib/utils/string';

// ===== Tool definition =====
const TOOLS = [
  { id: 'substitution', name: 'Substitution Solver', component: SubstitutionSolver, icon: 'fa-font' },
  { id: 'caesar', name: 'Caesar Brute Force', component: CaesarLabTool, icon: 'fa-list-ol' },
  { id: 'affine', name: 'Affine Cracker', component: AffineLabTool, icon: 'fa-sliders' },
] as const;

type ToolId = typeof TOOLS[number]['id'];

// ===== Sub-component: ToolItem (memoized) =====
interface ToolItemProps {
  tool: typeof TOOLS[number];
  isActive: boolean;
  isCollapsed: boolean;
  onToggle: (id: ToolId) => void;
}

const ToolItem = memo(({ tool, isActive, isCollapsed, onToggle }: ToolItemProps) => {
  const handleClick = useCallback(() => {
    onToggle(tool.id);
  }, [onToggle, tool.id]);

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200 overflow-hidden shadow-sm
        ${isActive
          ? 'border-primary-400 ring-2 ring-primary-400/20 bg-primary-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
    >
      <button
        className={`
          w-full flex items-center justify-between px-4 py-3 text-left transition-colors
          ${isActive ? 'bg-primary-50/80' : 'hover:bg-gray-50'}
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        `}
        onClick={handleClick}
        aria-expanded={isActive && !isCollapsed}
        aria-controls={`tool-panel-${tool.id}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
              w-7 h-7 flex items-center justify-center rounded-lg
              ${isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'}
            `}
            aria-hidden="true"
          >
            <i className={`fas ${tool.icon} text-xs`} />
          </div>
          <span className={`font-medium text-sm ${isActive ? 'text-primary-900' : 'text-gray-700'}`}>
            {tool.name}
          </span>
        </div>
        <i
          className={`
            fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200
            ${!isCollapsed && isActive ? 'rotate-180' : ''}
          `}
          aria-hidden="true"
        />
      </button>

      <div
        id={`tool-panel-${tool.id}`}
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isActive && !isCollapsed ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="border-t border-gray-100 bg-gray-50/30">
          <tool.component />
        </div>
      </div>
    </div>
  );
});

ToolItem.displayName = 'ToolItem';

// ===== Main Component =====
export const LabWorkspace: React.FC = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Redux state
  const {
    ciphertext,
    livePreview,
    toolsCollapsed,
    collapsedTools,
    activeLabTool,
  } = useAppSelector((state) => state.lab);
  const { outputText } = useAppSelector((state) => state.cipher);

  // Local state
  const [highlightChanges, setHighlightChanges] = useState(true);

  // Live preview effect (auto‑runs)
  useLivePreview();

  // Memoized cleaned ciphertext (for highlighting comparison)
  const cleanedCiphertext = useMemo(() => cleanText(ciphertext), [ciphertext]);

  // ===== Event Handlers (memoized) =====
  const handlePasteFromDesk = useCallback(() => {
    if (outputText && !outputText.startsWith('ERROR')) {
      dispatch(setCiphertext(outputText));
      toast('Copied from Desk output.');
    } else {
      toast('No valid output in Cipher Desk to copy.');
    }
  }, [dispatch, outputText, toast]);

  const handleApplyToDesk = useCallback(() => {
    if (livePreview) {
      dispatch(setInputText(livePreview));
      dispatch(setWorkspace('desk'));
      toast('Applied to Cipher Desk input.');
    }
  }, [dispatch, livePreview, toast]);

  const handleToolToggle = useCallback((toolId: ToolId) => {
    // If tools are collapsed, expand them first
    if (toolsCollapsed) {
      dispatch(setToolsCollapsed(false));
    }
    // If a different tool is active, switch to it and expand it
    if (activeLabTool !== toolId) {
      dispatch(setActiveLabTool(toolId));
      // Ensure it's not collapsed
      if (collapsedTools.includes(toolId)) {
        dispatch(toggleToolCollapse(toolId));
      }
    } else {
      // Toggle collapse state of the active tool
      dispatch(toggleToolCollapse(toolId));
    }
  }, [dispatch, activeLabTool, collapsedTools, toolsCollapsed]);

  const toggleToolsPanel = useCallback(() => {
    dispatch(setToolsCollapsed(!toolsCollapsed));
  }, [dispatch, toolsCollapsed]);

  const handleReset = useCallback(() => {
    dispatch(resetLabState());
  }, [dispatch]);

  const toggleHighlight = useCallback(() => {
    setHighlightChanges((prev) => !prev);
  }, []);

  // ===== Render preview with highlight =====
  const renderPreview = useCallback(() => {
    if (!livePreview) {
      return <span className="text-indigo-300 italic">Preview will appear here…</span>;
    }

    if (!highlightChanges) {
      return <span>{livePreview}</span>;
    }

    const previewChars = livePreview.split('');
    const sourceChars = cleanedCiphertext.split('');

    // Fallback if lengths differ
    if (previewChars.length !== sourceChars.length) {
      return <span>{livePreview}</span>;
    }

    return previewChars.map((char, i) => {
      const sourceChar = sourceChars[i] || ' ';
      const isDifferent = char !== sourceChar;
      const isLetter = /[a-zA-Z]/.test(char);

      if (isDifferent && isLetter) {
        return (
          <span
            key={i}
            className="bg-yellow-200/70 dark:bg-yellow-300/30 rounded px-0.5 py-0.5"
            title={`Changed from "${sourceChar}"`}
          >
            {char}
          </span>
        );
      }
      return <span key={i}>{char}</span>;
    });
  }, [livePreview, highlightChanges, cleanedCiphertext]);

  // ===== JSX =====
  return (
    <div className="flex flex-col lg:flex-row gap-4 flex-1 h-full max-w-7xl mx-auto w-full px-3 sm:px-4 py-4">
      {/* ===== LEFT COLUMN (main content) ===== */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* --- Ciphertext Source --- */}
        <section
          className="lab-panel flex flex-col min-h-[160px] sm:min-h-[180px] lg:min-h-[220px] bg-white rounded-xl shadow-sm border border-gray-200"
          aria-label="Ciphertext input"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100 shrink-0">
            <div className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-lock text-slate-400" aria-hidden="true" />
              <span className="text-sm">Ciphertext Source</span>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handlePasteFromDesk}
              className="focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <i className="fas fa-paste mr-1" aria-hidden="true" /> Paste from Desk
            </Button>
          </div>
          <textarea
            value={ciphertext}
            onChange={(e) => dispatch(setCiphertext(e.target.value))}
            placeholder="Paste or type unknown ciphertext here…"
            className="w-full flex-1 p-4 bg-transparent border-none outline-none resize-none font-mono text-sm text-gray-800 placeholder:text-gray-300 focus:ring-0"
            aria-label="Ciphertext input"
            spellCheck={false}
          />
        </section>

        {/* --- Mobile Tools (visible only on small screens) --- */}
        <div className="lg:hidden flex flex-col w-full">
          <button
            onClick={toggleToolsPanel}
            className="flex items-center justify-between w-full px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-t-xl border border-primary-200 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            aria-expanded={!toolsCollapsed}
            aria-controls="mobile-tools-panel"
          >
            <div className="font-semibold text-primary-800 flex items-center gap-2">
              <i className="fas fa-toolbox text-primary-500" aria-hidden="true" />
              <span>Analysis Tools</span>
              <span className="text-xs font-normal text-primary-400 ml-2">
                {toolsCollapsed ? 'closed' : 'open'}
              </span>
            </div>
            <i
              className={`fas fa-chevron-${toolsCollapsed ? 'down' : 'up'} text-xs text-primary-400 transition-transform`}
              aria-hidden="true"
            />
          </button>

          {!toolsCollapsed && (
            <div
              id="mobile-tools-panel"
              className="border border-t-0 border-primary-200 rounded-b-xl bg-white/90 p-3 space-y-2 max-h-[400px] overflow-y-auto"
            >
              {TOOLS.map((tool) => {
                const isActive = activeLabTool === tool.id;
                const isCollapsed = collapsedTools.includes(tool.id);
                return (
                  <ToolItem
                    key={tool.id}
                    tool={tool}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                    onToggle={handleToolToggle}
                  />
                );
              })}

              {/* Mobile Investigation Tools */}
              <div className="pt-3 mt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                  Investigation Tools
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('analysisModal'))}
                    className="flex-1 min-w-[80px] justify-center border-blue-200 text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <i className="fas fa-chart-bar mr-1.5" aria-hidden="true" /> Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('dictionaryModal'))}
                    className="flex-1 min-w-[80px] justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <i className="fas fa-book mr-1.5" aria-hidden="true" /> Dictionary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('toolsModal'))}
                    className="flex-1 min-w-[80px] justify-center border-purple-200 text-purple-700 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500"
                  >
                    <i className="fas fa-tools mr-1.5" aria-hidden="true" /> Tools
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Live Preview --- */}
        <section
          className="lab-panel flex flex-col min-h-[160px] sm:min-h-[180px] lg:min-h-[220px] bg-white rounded-xl shadow-sm border border-indigo-200"
          aria-label="Trial decryption preview"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-indigo-100 shrink-0 bg-indigo-50/30">
            <div className="font-semibold text-indigo-900 flex items-center gap-2">
              <i className="fas fa-eye text-indigo-400" aria-hidden="true" />
              <span className="text-sm">Trial Decryption</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant={highlightChanges ? 'primary' : 'outline'}
                size="xs"
                onClick={toggleHighlight}
                className={`transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  highlightChanges
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <i
                  className={`fas fa-highlighter mr-1 ${highlightChanges ? 'text-indigo-500' : ''}`}
                  aria-hidden="true"
                />
                {highlightChanges ? 'Hide' : 'Show'} Changes
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={handleReset}
                className="focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <i className="fas fa-rotate-left mr-1" aria-hidden="true" /> Reset
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={handleApplyToDesk}
                className="focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <i className="fas fa-share mr-1" aria-hidden="true" /> Send to Desk
              </Button>
            </div>
          </div>
          <div
            className="flex-1 p-4 bg-indigo-50/10 overflow-y-auto font-mono text-sm text-indigo-950 whitespace-pre-wrap break-all"
            aria-live="polite"
          >
            {renderPreview()}
          </div>
        </section>
      </div>

      {/* ===== RIGHT SIDEBAR (desktop tools) ===== */}
      <aside
        className="hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0 self-start"
        aria-label="Analysis tools sidebar"
      >
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 bg-primary-50/50">
            <div className="font-bold text-primary-800 flex items-center gap-2">
              <i className="fas fa-toolbox text-primary-500" aria-hidden="true" />
              <span>Analysis Tools</span>
            </div>
            <span className="text-xs text-primary-400 font-medium">
              {TOOLS.filter((t) => !collapsedTools.includes(t.id) && activeLabTool === t.id).length > 0
                ? 'Active'
                : 'Ready'}
            </span>
          </div>

          <div className="p-3 space-y-2 bg-gray-50/30">
            {TOOLS.map((tool) => {
              const isActive = activeLabTool === tool.id;
              const isCollapsed = collapsedTools.includes(tool.id);
              return (
                <ToolItem
                  key={tool.id}
                  tool={tool}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onToggle={handleToolToggle}
                />
              );
            })}
          </div>

          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/80">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2.5">
              Investigation Tools
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('analysisModal'))}
                className="justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <i className="fas fa-chart-bar mr-1.5" aria-hidden="true" /> Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('dictionaryModal'))}
                className="justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <i className="fas fa-book mr-1.5" aria-hidden="true" /> Dict
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('toolsModal'))}
                className="justify-center border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <i className="fas fa-tools mr-1.5" aria-hidden="true" /> Tools
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};