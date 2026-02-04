import { toast } from "sonner"


export const ErrorToast = (message) => {
    toast.error(message, { duration: 600000 })
}

export const SuccessToast = (message) => {
    toast.success(message)
}

export const InfoToast = (message) => {
    toast.info(message)
}