import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setWorkspace, setSessionSidebarOpen } from '../store/slices/uiSlice';

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeWorkspace, sessionSidebarOpen } = useAppSelector((state) => state.ui);

  const handleWorkspaceChange = (workspace: 'desk' | 'lab') => () => {
    dispatch(setWorkspace(workspace));
  };

  const handleSidebarToggle = () => {
    dispatch(setSessionSidebarOpen(!sessionSidebarOpen));
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/80 backdrop-blur-md
        border-b border-gray-200/60
        px-2 xs:px-3 sm:px-4 lg:px-6 py-2
        flex items-center gap-2 sm:gap-3 flex-wrap
        shadow-sm
      "
    >
      {/* Logo / Brand – always full text */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-inner">
          <i className="fas fa-key text-white text-sm sm:text-xl" />
        </div>
        <div className="leading-tight">
          <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">
            CryptoTool
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            Classic Cipher Suite
          </p>
        </div>
      </div>

      {/* Workspace Switcher – text always visible, wraps when needed */}
      <nav
        className="
          flex bg-gray-100/70 backdrop-blur-sm p-1 rounded-lg
          gap-0.5 flex-wrap
        "
        aria-label="Workspace navigation"
      >
        <button
          onClick={handleWorkspaceChange('desk')}
          className={`
            flex items-center gap-1 sm:gap-2
            px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5
            rounded-md text-[11px] sm:text-sm font-semibold
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1
            cursor-pointer
            ${
              activeWorkspace === 'desk'
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }
          `}
          aria-current={activeWorkspace === 'desk' ? 'page' : undefined}
        >
          <i className="fas fa-desktop text-[10px] sm:text-sm" />
          <span>Cipher Desk</span> {/* Always visible */}
        </button>

        <button
          onClick={handleWorkspaceChange('lab')}
          className={`
            flex items-center gap-1 sm:gap-2
            px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5
            rounded-md text-[11px] sm:text-sm font-semibold
            transition-all duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1
            cursor-pointer
            ${
              activeWorkspace === 'lab'
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }
          `}
          aria-current={activeWorkspace === 'lab' ? 'page' : undefined}
        >
          <i className="fas fa-flask text-[10px] sm:text-sm" />
          <span>Crypto Lab</span> {/* Always visible */}
        </button>
      </nav>

      {/* Right Actions – always visible */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-shrink-0">
        <button
          onClick={handleSidebarToggle}
          className="
            w-8 h-8 sm:w-10 sm:h-10
            rounded-full
            flex items-center justify-center
            text-gray-600
            hover:bg-gray-100/80
            active:bg-gray-200/60
            transition-colors duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
            cursor-pointer
          "
          aria-label={sessionSidebarOpen ? 'Close sessions menu' : 'Open sessions menu'}
          aria-expanded={sessionSidebarOpen}
          aria-controls="session-sidebar"
        >
          <i className={`fas ${sessionSidebarOpen ? 'fa-times' : 'fa-bars'} text-base sm:text-lg`} />
        </button>
      </div>
    </header>
  );
};