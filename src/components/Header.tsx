import React from 'react'
import { SessionManager } from './SessionManager'

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-2 font-bold text-base text-gray-900 mr-1">
        <i className="fas fa-lock text-primary-500"></i>
        CryptoTool
        <small className="font-normal text-[0.65rem] text-gray-400 uppercase tracking-wide">
          v4
        </small>
      </div>
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        <SessionManager />
      </div>
    </header>
  )
}