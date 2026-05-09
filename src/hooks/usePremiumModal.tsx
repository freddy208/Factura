'use client'

import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import PremiumModal from '@/components/ui/PremiumModal'

type ModalType = 'alert' | 'confirm' | 'success' | 'warning' | 'info' | 'danger'

export function usePremiumModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: ModalType
    confirmText?: string
    cancelText?: string
    loading?: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
  })

  const [resolvePromise, setResolvePromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const showModal = useCallback(
    (
      title: string,
      message: string,
      type: ModalType = 'alert',
      options?: {
        confirmText?: string
        cancelText?: string
        loading?: boolean
      }
    ) => {
      return new Promise<boolean>((resolve) => {
        setModalState({
          isOpen: true,
          title,
          message,
          type,
          confirmText: options?.confirmText,
          cancelText: options?.cancelText,
          loading: options?.loading,
        })
        setResolvePromise({ resolve })
      })
    },
    []
  )

  const closeModal = useCallback((confirmed: boolean = false) => {
    setModalState(prev => ({ ...prev, isOpen: false }))
    if (resolvePromise) {
      resolvePromise.resolve(confirmed)
      setResolvePromise(null)
    }
  }, [resolvePromise])

  const setLoading = useCallback((loading: boolean) => {
    setModalState(prev => ({ ...prev, loading }))
  }, [])

  const alert = useCallback(
    (title: string, message: string, type: ModalType = 'alert') => {
      return showModal(title, message, type, { confirmText: 'OK' })
    },
    [showModal]
  )

  const confirm = useCallback(
    (
      title: string,
      message: string,
      type: ModalType = 'confirm',
      options?: { confirmText?: string; cancelText?: string }
    ) => {
      return showModal(title, message, type, options)
    },
    [showModal]
  )

  const ModalComponent = () => {
    if (!modalState.isOpen) return null

    return createPortal(
      <PremiumModal
        isOpen={modalState.isOpen}
        onClose={() => closeModal(false)}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        loading={modalState.loading}
        onConfirm={() => closeModal(true)}
      />,
      document.body
    )
  }

  return {
    alert,
    confirm,
    setLoading,
    ModalComponent,
  }
}
