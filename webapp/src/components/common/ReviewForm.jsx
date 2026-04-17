import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { reviewsApi } from '@/api/reviews.api'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'

export default function ReviewForm({ targetType, targetId, queryKey }) {
  const qc   = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')

  const mutation = useMutation({
    mutationFn: reviewsApi.create,
    onSuccess: () => {
      toast.success('Review submitted — it will appear after moderation')
      setRating(0); setTitle(''); setContent('')
      qc.invalidateQueries({ queryKey })
    },
    onError: (err) => {
      const firstFieldError = err.response?.data?.errors?.[0]?.message
      toast.error(firstFieldError || err.response?.data?.message || 'Failed to submit review')
    },
  })

  if (!user) return (
    <div className="p-5 rounded-xl border bg-muted/30 text-center">
      <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
      <Link to="/login">
        <Button size="sm">Sign in</Button>
      </Link>
    </div>
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmedContent = content.trim()
    if (!rating)   return toast.error('Please select a rating')
    if (!trimmedContent) return toast.error('Please write a review')
    if (trimmedContent.length < 10) return toast.error('Review must be at least 10 characters')
    mutation.mutate({ targetType, targetId, rating, title, content })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl border bg-card">
      <h3 className="font-semibold">Write a review</h3>

      {/* Star picker */}
      <div className="space-y-1.5">
        <Label>Rating *</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(i + 1)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i + 1)}
            >
              <Star className={`h-6 w-6 transition-colors ${
                i < (hovered || rating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`} />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          maxLength={100}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-content">Review *</Label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">{content.length}/1000</p>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  )
}