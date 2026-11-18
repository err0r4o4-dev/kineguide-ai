import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

type ConfirmOptions = {
  title: string
  text: string
  confirmText: string
  cancelText: string
  danger?: boolean
}

const sharedClasses = {
  popup: 'kg-swal-popup',
  title: 'kg-swal-title',
  htmlContainer: 'kg-swal-text',
  actions: 'kg-swal-actions'
}

export async function confirmNotification({
  title,
  text,
  confirmText,
  cancelText,
  danger = false
}: ConfirmOptions) {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? 'warning' : 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    focusCancel: true,
    reverseButtons: true,
    buttonsStyling: false,
    heightAuto: false,
    customClass: {
      ...sharedClasses,
      confirmButton: danger
        ? 'kg-swal-button kg-swal-button-danger'
        : 'kg-swal-button kg-swal-button-primary',
      cancelButton: 'kg-swal-button kg-swal-button-secondary'
    }
  })

  return result.isConfirmed
}

export function showSuccess(title: string) {
  return Swal.fire({
    title,
    icon: 'success',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.setAttribute('aria-live', 'polite')
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
      ...sharedClasses,
      popup: 'kg-swal-popup kg-swal-toast'
    }
  })
}

export function showError(title: string, confirmText: string, text?: string) {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: confirmText,
    buttonsStyling: false,
    heightAuto: false,
    customClass: {
      ...sharedClasses,
      confirmButton: 'kg-swal-button kg-swal-button-primary'
    }
  })
}
