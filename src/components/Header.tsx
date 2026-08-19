import React from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setWorkspace, setSessionSidebarOpen } from '../store/slices/uiSlice'

export const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const { activeWorkspace, sessionSidebarOpen } = useAppSelector(state => state.ui)

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-inner">
          <i className="fas fa-key text-white text-xl"></i>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
            CryptoTool
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Classic Cipher Suite</p>
        </div>
      </div>

      {/* Workspace Switcher (Center) */}
      <div className="flex bg-gray-100/80 backdrop-blur p-1 rounded-lg">
        <button
          onClick={() => dispatch(setWorkspace('desk'))}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${activeWorkspace === 'desk'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <i className="fas fa-desktop mr-2"></i> Cipher Desk
        </button>
        <button
          onClick={() => dispatch(setWorkspace('lab'))}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${activeWorkspace === 'lab'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <i className="fas fa-flask mr-2"></i> Crypto Lab
        </button>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <button
          onClick={() => dispatch(setSessionSidebarOpen(!sessionSidebarOpen))}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          aria-label="Toggle sessions menu"
        >
          <i className={`fas ${sessionSidebarOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
        </button>
      </div>
    </header>
  )
}