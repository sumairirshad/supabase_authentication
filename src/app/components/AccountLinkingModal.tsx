import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useAuth } from '@/app/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'

interface AccountLinkingModalProps {
  open: boolean
  onClose: () => void
  provider: string
  email: string
}

export function AccountLinkingModal({
  open,
  onClose,
  provider,
  email,
}: AccountLinkingModalProps) {
  const [isLinking, setIsLinking] = useState(false)
  const { linkAccount } = useAuth()

  const handleLinkAccount = async () => {
    setIsLinking(true)
    
    try {
      await linkAccount(provider as 'google' | 'facebook' | 'twitter')
      onClose()
    } catch (error) {
      console.error('Account linking error:', error)
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center">Account Already Exists</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              An account already exists with the email{' '}
              <strong>{email}</strong> using a different login method.
            </p>
            <p>
              Do you want to link your{' '}
              <span className="font-medium capitalize">{provider}</span> account to this email?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLinking}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleLinkAccount}
            className="flex-1"
            disabled={isLinking}
          >
            {isLinking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Linking...
              </>
            ) : (
              'Link Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
