import { Loader2 } from 'lucide-react'

export default function ApplicationsLoading() {
  return (
    <div className="container py-8">
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  )
}
