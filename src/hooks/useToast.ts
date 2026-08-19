import { useAppDispatch } from '../store'
import { showToast, hideToast } from '../store/slices/uiSlice'

export function useToast() {
  const dispatch = useAppDispatch()

  const toast = (message: string) => {
    dispatch(showToast(message))
  }

  const dismiss = () => {
    dispatch(hideToast())
  }

  return { toast, dismiss }
}
