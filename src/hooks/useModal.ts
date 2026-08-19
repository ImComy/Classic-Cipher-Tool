import { useAppDispatch, useAppSelector } from '../store'
import { openModal, closeModal } from '../store/slices/uiSlice'

export function useModal() {
  const dispatch = useAppDispatch()
  const activeModal = useAppSelector(state => state.ui.activeModal)

  const open = (modalName: string) => {
    dispatch(openModal(modalName))
  }

  const close = () => {
    dispatch(closeModal())
  }

  const isOpen = (modalName: string) => activeModal === modalName

  return { activeModal, open, close, isOpen }
}
