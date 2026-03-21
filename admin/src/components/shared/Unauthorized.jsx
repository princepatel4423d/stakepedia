import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Shield className="h-16 w-16 text-destructive opacity-10" />
            <Shield className="h-16 w-16 text-destructive absolute top-0 left-0" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}

export default Unauthorized
