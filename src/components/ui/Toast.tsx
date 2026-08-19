import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { hideToast } from '../../store/slices/uiSlice'

export const Toast: React.FC = () => {
  const { toastMessage, toastVisible } = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        dispatch(hideToast())
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastVisible, dispatch])

  if (!toastVisible || !toastMessage) return null

  return (
    <div className="toast fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg z-[999] max-w-[90%] text-center opacity-100 pointer-events-auto transition duration-300">
      {toastMessage}
    </div>
  )
}