import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, X, Save, ArrowLeft, Globe, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/shared/PageHeader'
import ImageUploader from '@/components/shared/ImageUploader'
import { aiToolsApi } from '@/api/aitools.api'
import { categoriesApi } from '@/api/categories.api'
import { promptsApi } from '@/api/prompts.api'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(200).optional().or(z.literal('')),
  url: z.string().url('Enter a valid URL'),
  pricing: z.enum(['free', 'freemium', 'paid', 'open-source', 'contact']),
  pricingDetails: z.string().optional().or(z.literal('')),
  companyName: z.string().max(120).optional().or(z.literal('')),
  developerName: z.string().max(120).optional().or(z.literal('')),
  foundedYear: z.string().optional().or(z.literal('')).refine(
    (value) => !value || /^\d{4}$/.test(value),
    'Founded year must be a 4-digit year',
  ),
  headquarters: z.string().max(120).optional().or(z.literal('')),
  supportEmail: z.string().email('Enter a valid support email').optional().or(z.literal('')),
  docsUrl: z.string().url('Enter a valid docs URL').optional().or(z.literal('')),
  socialWebsite: z.string().url('Enter a valid website URL').optional().or(z.literal('')),
  socialX: z.string().url('Enter a valid X URL').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Enter a valid LinkedIn URL').optional().or(z.literal('')),
  socialYoutube: z.string().url('Enter a valid YouTube URL').optional().or(z.literal('')),
  freeTrialDays: z.string().optional().or(z.literal('')).refine(
    (value) => !value || /^\d{1,3}$/.test(value),
    'Free trial days must be a number',
  ),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  apiAvailable: z.boolean().optional(),
  hasFreeTrial: z.boolean().optional(),
  metaTitle: z.string().max(60).optional().or(z.literal('')),
  metaDescription: z.string().max(160).optional().or(z.literal('')),
})

const ListField = ({ label, placeholder, value = [], onChange }) => {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add() }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
            >
              <span className="max-w-50 truncate">{item}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="hover:text-destructive transition-colors shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TutorialsField = ({ value = [], onChange }) => {
  const [draft, setDraft] = useState({
    title: '',
    youtubeUrl: '',
    channelName: '',
    durationText: '',
    language: 'English',
    level: 'all',
  })

  const addTutorial = () => {
    const title = draft.title.trim()
    const youtubeUrl = draft.youtubeUrl.trim()
    if (!title || !youtubeUrl) {
      toast.error('Tutorial title and YouTube URL are required')
      return
    }
    onChange([
      ...value,
      {
        ...draft,
        title,
        youtubeUrl,
      },
    ])
    setDraft({
      title: '',
      youtubeUrl: '',
      channelName: '',
      durationText: '',
      language: 'English',
      level: 'all',
    })
  }

  return (
    <div className="space-y-3">
      <Label>Tutorials (YouTube)</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Tutorial title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <Input
          placeholder="YouTube URL"
          value={draft.youtubeUrl}
          onChange={(e) => setDraft({ ...draft, youtubeUrl: e.target.value })}
        />
        <Input
          placeholder="Channel name (optional)"
          value={draft.channelName}
          onChange={(e) => setDraft({ ...draft, channelName: e.target.value })}
        />
        <Input
          placeholder="Duration (optional, e.g. 12:45)"
          value={draft.durationText}
          onChange={(e) => setDraft({ ...draft, durationText: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Language (optional)"
          value={draft.language}
          onChange={(e) => setDraft({ ...draft, language: e.target.value })}
        />
        <Select value={draft.level} onValueChange={(level) => setDraft({ ...draft, level })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="button" variant="outline" onClick={addTutorial}>
        <Plus className="h-4 w-4 mr-2" /> Add tutorial
      </Button>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((tutorial, index) => (
            <div key={`${tutorial.title}-${index}`} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{tutorial.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{tutorial.youtubeUrl}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tutorial.channelName || 'Unknown channel'} • {tutorial.language || 'English'} • {tutorial.level || 'all'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const PricingPlansField = ({ value = [], onChange }) => {
  const [draft, setDraft] = useState({
    name: '',
    priceLabel: '',
    billingNote: '',
    description: '',
    ctaUrl: '',
    features: [],
    featureInput: '',
    isPopular: false,
  })

  const addFeature = () => {
    const trimmed = draft.featureInput.trim()
    if (!trimmed || draft.features.includes(trimmed)) return
    setDraft({ ...draft, features: [...draft.features, trimmed], featureInput: '' })
  }

  const addPlan = () => {
    if (!draft.name.trim() || !draft.priceLabel.trim()) {
      toast.error('Plan name and price label are required')
      return
    }
    onChange([
      ...value,
      {
        name: draft.name.trim(),
        priceLabel: draft.priceLabel.trim(),
        billingNote: draft.billingNote.trim() || undefined,
        description: draft.description.trim() || undefined,
        ctaUrl: draft.ctaUrl.trim() || undefined,
        features: draft.features,
        isPopular: draft.isPopular,
      },
    ])
    setDraft({
      name: '',
      priceLabel: '',
      billingNote: '',
      description: '',
      ctaUrl: '',
      features: [],
      featureInput: '',
      isPopular: false,
    })
  }

  return (
    <div className="space-y-3">
      <Label>Pricing plans</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Plan name (e.g. Pro)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <Input
          placeholder="Price label (e.g. $20/month)"
          value={draft.priceLabel}
          onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })}
        />
        <Input
          placeholder="Billing note (optional)"
          value={draft.billingNote}
          onChange={(e) => setDraft({ ...draft, billingNote: e.target.value })}
        />
        <Input
          placeholder="CTA URL (optional)"
          value={draft.ctaUrl}
          onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })}
        />
      </div>
      <Textarea
        rows={2}
        placeholder="Plan description (optional)"
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Plan features</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add plan feature"
            value={draft.featureInput}
            onChange={(e) => setDraft({ ...draft, featureInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addFeature() }
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {draft.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {draft.features.map((feature, index) => (
              <div key={`${feature}-${index}`} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, features: draft.features.filter((_, i) => i !== index) })}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">Mark as popular</p>
          <p className="text-xs text-muted-foreground">Highlight this plan on detail page</p>
        </div>
        <Switch
          checked={draft.isPopular}
          onCheckedChange={(checked) => setDraft({ ...draft, isPopular: checked })}
        />
      </div>

      <Button type="button" variant="outline" onClick={addPlan}>
        <Plus className="h-4 w-4 mr-2" /> Add pricing plan
      </Button>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((plan, index) => (
            <div key={`${plan.name}-${index}`} className="rounded-md border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{plan.name} • {plan.priceLabel}</p>
                  {plan.billingNote && <p className="text-xs text-muted-foreground">{plan.billingNote}</p>}
                  {plan.description && <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AIToolForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const qc = useQueryClient()
  const isEdit = !!id

  const [logo, setLogo] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [screenshots, setScreenshots] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [features, setFeatures] = useState([])
  const [useCases, setUseCases] = useState([])
  const [selectedPrompts, setSelectedPrompts] = useState([])
  const [pros, setPros] = useState([])
  const [cons, setCons] = useState([])
  const [tutorials, setTutorials] = useState([])
  const [pricingPlans, setPricingPlans] = useState([])

  const normalizeManualValues = (items = []) =>
    (Array.isArray(items) ? items : [])
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object') {
          return (item.name || item.title || item.label || '').trim()
        }
        return ''
      })
      .filter(Boolean)

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      url: '',
      pricing: 'free',
      pricingDetails: '',
      companyName: '',
      developerName: '',
      foundedYear: '',
      headquarters: '',
      supportEmail: '',
      docsUrl: '',
      socialWebsite: '',
      socialX: '',
      socialLinkedin: '',
      socialYoutube: '',
      status: 'draft',
      isFeatured: false,
      isVerified: false,
      apiAvailable: false,
      hasFreeTrial: false,
      freeTrialDays: '',
      metaTitle: '',
      metaDescription: '',
    },
  })

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handle = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handle)
    return () => window.removeEventListener('beforeunload', handle)
  }, [isDirty])

  // Fetch for edit
  const { data: toolData, isLoading: toolLoading } = useQuery({
    queryKey: ['admin-aitool', id],
    queryFn: () => aiToolsApi.getById(id),
    select: (res) => res.data.data,
    enabled: isEdit,
  })

  useEffect(() => {
    if (!toolData) return
    reset({
      name: toolData.name || '',
      description: toolData.description || '',
      shortDescription: toolData.shortDescription || '',
      url: toolData.url || '',
      pricing: toolData.pricing || 'free',
      pricingDetails: toolData.pricingDetails || '',
      companyName: toolData.companyName || '',
      developerName: toolData.developerName || '',
      foundedYear: toolData.foundedYear ? String(toolData.foundedYear) : '',
      headquarters: toolData.headquarters || '',
      supportEmail: toolData.supportEmail || '',
      docsUrl: toolData.docsUrl || '',
      socialWebsite: toolData.socialMedia?.website || '',
      socialX: toolData.socialMedia?.x || '',
      socialLinkedin: toolData.socialMedia?.linkedin || '',
      socialYoutube: toolData.socialMedia?.youtube || '',
      status: toolData.status || 'draft',
      isFeatured: toolData.isFeatured || false,
      isVerified: toolData.isVerified || false,
      apiAvailable: toolData.apiAvailable || false,
      hasFreeTrial: toolData.hasFreeTrial || false,
      freeTrialDays: toolData.freeTrialDays ? String(toolData.freeTrialDays) : '',
      metaTitle: toolData.meta?.title || '',
      metaDescription: toolData.meta?.description || '',
    })
    setLogo(toolData.logo || null)
    setCoverImage(toolData.coverImage || null)
    setScreenshots(toolData.screenshots || [])
    const categoryItems = toolData.categories?.length
      ? toolData.categories.filter((item) => item && typeof item === 'object' && item.name)
      : (toolData.category && typeof toolData.category === 'object' && toolData.category.name
        ? [toolData.category]
        : [])
    setSelectedCategories(categoryItems)
    setSelectedTags(normalizeManualValues(toolData.tags || []))
    setFeatures(toolData.features || [])
    setUseCases(toolData.useCases || [])
    setSelectedPrompts(toolData.prompts || [])
    setPros(toolData.pros || [])
    setCons(toolData.cons || [])
    setTutorials(toolData.tutorials || [])
    setPricingPlans(toolData.pricingPlans || [])
  }, [toolData, reset])

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories-all'],
    queryFn: () => categoriesApi.getAll({ limit: 100 }),
    select: (res) => {
      const d = res.data.data
      return Array.isArray(d) ? d : (d?.items || [])
    },
  })

  // Prompts
  const { data: allPrompts = [] } = useQuery({
    queryKey: ['admin-prompts-all'],
    queryFn: () => promptsApi.getAll({ limit: 200 }),
    select: (res) => {
      const d = res.data.data
      const items = Array.isArray(d) ? d : (d?.items || [])
      return items.map((prompt) => ({
        ...prompt,
        name: prompt.title,
      }))
    },
  })

  // Save
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? aiToolsApi.update(id, payload) : aiToolsApi.create(payload),
    onSuccess: (res) => {
      toast.success(isEdit ? 'AI tool updated' : 'AI tool created')
      qc.invalidateQueries({ queryKey: ['admin-aitools'] })
      qc.invalidateQueries({ queryKey: ['admin-aitool', id] })
      if (!isEdit) navigate(`/ai-tools/${res.data.data._id}/edit`)
    },
    onError: (err) => {
      const errs = err.response?.data?.errors
      if (errs?.length) errs.forEach((e) => toast.error(`${e.field}: ${e.message}`))
      else toast.error(err.response?.data?.message || 'Save failed')
    },
  })

  const onSubmit = (data) => {
    if (!selectedCategories.length) {
      toast.error('Select at least one category')
      return
    }
    if (!features.length) {
      toast.error('Add at least one key feature')
      return
    }
    if (!useCases.length) {
      toast.error('Add at least one use case')
      return
    }
    if (data.hasFreeTrial && !data.freeTrialDays) {
      toast.error('Please set free trial days when free trial is enabled')
      return
    }

    saveMutation.mutate({
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription || undefined,
      url: data.url,
      categories: selectedCategories.map((c) => c._id || c),
      pricing: data.pricing,
      pricingDetails: data.pricingDetails || undefined,
      companyName: data.companyName || undefined,
      developerName: data.developerName || undefined,
      foundedYear: data.foundedYear ? Number(data.foundedYear) : undefined,
      headquarters: data.headquarters || undefined,
      supportEmail: data.supportEmail || undefined,
      docsUrl: data.docsUrl || undefined,
      socialMedia: {
        website: data.socialWebsite || undefined,
        x: data.socialX || undefined,
        linkedin: data.socialLinkedin || undefined,
        youtube: data.socialYoutube || undefined,
      },
      status: data.status,
      isFeatured: data.isFeatured,
      isVerified: data.isVerified,
      apiAvailable: data.apiAvailable,
      hasFreeTrial: data.hasFreeTrial,
      freeTrialDays: data.freeTrialDays ? Number(data.freeTrialDays) : undefined,
      logo: logo || undefined,
      coverImage: coverImage || undefined,
      screenshots,
      tags: selectedTags,
      prompts: selectedPrompts.map((p) => p._id || p),
      features,
      useCases,
      pros,
      cons,
      tutorials,
      pricingPlans,
      meta: {
        title: data.metaTitle || undefined,
        description: data.metaDescription || undefined,
      },
    })
  }

  const onError = (formErrors) => {
    const first = Object.values(formErrors)[0]
    if (first?.message) toast.error(first.message)
  }

  if (isEdit && toolLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit AI tool' : 'Add AI tool'}
        description={isEdit ? 'Update tool details and settings' : 'Add a new AI tool to Stakepedia'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'AI Tools', href: '/ai-tools' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/ai-tools')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              onClick={handleSubmit(onSubmit, onError)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                : <><Save className="h-4 w-4 mr-2" /> Save tool</>
              }
            </Button>
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 space-y-6">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* Details */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Basic info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Tool name *</Label>
                        <Input id="name" placeholder="e.g. ChatGPT" {...register('name')} />
                        {errors.name && (
                          <p className="text-xs text-destructive">{errors.name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">Website URL *</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="url"
                            placeholder="https://example.com"
                            className="pl-9"
                            {...register('url')}
                          />
                        </div>
                        {errors.url && (
                          <p className="text-xs text-destructive">{errors.url.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDescription">Short description</Label>
                      <Input
                        id="shortDescription"
                        placeholder="One-line summary (max 200 chars)"
                        {...register('shortDescription')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Detailed description of the tool..."
                        rows={5}
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="text-xs text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categories *</Label>
                        <Controller
                          name="categoriesUi"
                          control={control}
                          render={() => (
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (!value) return
                                const selectedCategory = categories.find((c) => c._id === value)
                                if (!selectedCategory) return
                                if (!selectedCategories.some((c) => c._id === selectedCategory._id)) {
                                  setSelectedCategories([...selectedCategories, selectedCategory])
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={categories.length === 0 ? 'No categories found' : 'Select categories...'} />
                              </SelectTrigger>
                              <SelectContent>
                                {categories
                                  .filter((c) => !selectedCategories.some((selected) => selected._id === c._id))
                                  .map((c) => (
                                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {selectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedCategories.map((category) => (
                              <div
                                key={category._id}
                                className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
                              >
                                <span>{category.name}</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCategories(selectedCategories.filter((c) => c._id !== category._id))}
                                  className="hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {categories.length === 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            <a href="/categories" className="underline">Create a category</a> before adding tools.
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Pricing *</Label>
                        <Controller
                          name="pricing"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['free', 'freemium', 'paid', 'open-source', 'contact'].map((p) => (
                                  <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pricingDetails">Pricing details</Label>
                      <Input
                        id="pricingDetails"
                        placeholder="e.g. Free tier available, Pro from $20/mo"
                        {...register('pricingDetails')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company</Label>
                        <Input id="companyName" placeholder="e.g. OpenAI" {...register('companyName')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="developerName">Developer / Maker</Label>
                        <Input id="developerName" placeholder="Creator or team" {...register('developerName')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foundedYear">Founded year</Label>
                        <Input id="foundedYear" placeholder="e.g. 2022" {...register('foundedYear')} />
                        {errors.foundedYear && <p className="text-xs text-destructive">{errors.foundedYear.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headquarters">Headquarters</Label>
                        <Input id="headquarters" placeholder="e.g. San Francisco, USA" {...register('headquarters')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail">Support email</Label>
                        <Input id="supportEmail" placeholder="support@company.com" {...register('supportEmail')} />
                        {errors.supportEmail && <p className="text-xs text-destructive">{errors.supportEmail.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="docsUrl">Documentation URL</Label>
                        <Input id="docsUrl" placeholder="https://docs.example.com" {...register('docsUrl')} />
                        {errors.docsUrl && <p className="text-xs text-destructive">{errors.docsUrl.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">Public API available</p>
                          <p className="text-xs text-muted-foreground">Useful for technical buyers</p>
                        </div>
                        <Controller
                          name="apiAvailable"
                          control={control}
                          render={({ field }) => (
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">Free trial available</p>
                          <p className="text-xs text-muted-foreground">Show trial badge on detail page</p>
                        </div>
                        <Controller
                          name="hasFreeTrial"
                          control={control}
                          render={({ field }) => (
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="freeTrialDays">Free trial days</Label>
                      <Input id="freeTrialDays" placeholder="e.g. 14" {...register('freeTrialDays')} />
                      {errors.freeTrialDays && <p className="text-xs text-destructive">{errors.freeTrialDays.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <ListField
                        label=""
                        value={selectedTags}
                        onChange={setSelectedTags}
                        placeholder="Add tags..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content */}
              <TabsContent value="content" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Features & use cases</CardTitle>
                    <CardDescription>Help users understand what this tool can do</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ListField
                      label="Key features"
                      placeholder="Add a feature and press Enter"
                      value={features}
                      onChange={setFeatures}
                    />
                    <Separator />
                    <ListField
                      label="Use cases"
                      placeholder="Add a use case and press Enter"
                      value={useCases}
                      onChange={setUseCases}
                    />
                    <Separator />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ListField
                        label="Pros"
                        placeholder="Add a pro and press Enter"
                        value={pros}
                        onChange={setPros}
                      />
                      <ListField
                        label="Cons"
                        placeholder="Add a con and press Enter"
                        value={cons}
                        onChange={setCons}
                      />
                    </div>
                    <Separator />
                    <TutorialsField value={tutorials} onChange={setTutorials} />
                    <Separator />
                    <PricingPlansField value={pricingPlans} onChange={setPricingPlans} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prompts */}
              <TabsContent value="prompts" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Prompt selection</CardTitle>
                    <CardDescription>
                      Select from existing prompts only. Manual prompt creation is not allowed in AI Tool form.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Linked prompts</Label>
                      <Controller
                        name="promptsUi"
                        control={control}
                        render={() => (
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (!value) return
                              const selectedPrompt = allPrompts.find((p) => p._id === value)
                              if (!selectedPrompt) return
                              if (!selectedPrompts.some((p) => p._id === selectedPrompt._id)) {
                                setSelectedPrompts([...selectedPrompts, selectedPrompt])
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select created prompts..." />
                            </SelectTrigger>
                            <SelectContent>
                              {allPrompts
                                .filter((p) => !selectedPrompts.some((selected) => selected._id === p._id))
                                .map((prompt) => (
                                  <SelectItem key={prompt._id} value={prompt._id}>{prompt.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {selectedPrompts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedPrompts.map((prompt) => (
                            <div
                              key={prompt._id}
                              className="flex items-center gap-1.5 bg-muted text-muted-foreground text-xs px-2.5 py-1.5 rounded-md"
                            >
                              <span className="max-w-50 truncate">{prompt.name}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedPrompts(selectedPrompts.filter((p) => p._id !== prompt._id))}
                                className="hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Pick prompts exactly like category and tags selection.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Social media</CardTitle>
                    <CardDescription>Optional links for brand presence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="socialWebsite">Website</Label>
                        <Input id="socialWebsite" placeholder="https://yourcompany.com" {...register('socialWebsite')} />
                        {errors.socialWebsite && <p className="text-xs text-destructive">{errors.socialWebsite.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialX">X (Twitter)</Label>
                        <Input id="socialX" placeholder="https://x.com/username" {...register('socialX')} />
                        {errors.socialX && <p className="text-xs text-destructive">{errors.socialX.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialLinkedin">LinkedIn</Label>
                        <Input id="socialLinkedin" placeholder="https://linkedin.com/company/name" {...register('socialLinkedin')} />
                        {errors.socialLinkedin && <p className="text-xs text-destructive">{errors.socialLinkedin.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="socialYoutube">YouTube</Label>
                        <Input id="socialYoutube" placeholder="https://youtube.com/@channel" {...register('socialYoutube')} />
                        {errors.socialYoutube && <p className="text-xs text-destructive">{errors.socialYoutube.message}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media */}
              <TabsContent value="media" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Images</CardTitle>
                    <CardDescription>Upload logo, cover image and screenshots</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <ImageUploader
                          value={logo}
                          onChange={setLogo}
                          folder="ai-tools"
                          label="Upload logo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cover image</Label>
                        <ImageUploader
                          value={coverImage}
                          onChange={setCoverImage}
                          folder="ai-tools"
                          label="Upload cover"
                          aspectRatio="16:9"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Screenshots (max 5)</Label>
                      <div className="flex flex-wrap gap-3">
                        {screenshots.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt={`Screenshot ${i + 1}`}
                              className="h-24 w-40 object-cover rounded-lg border"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                            <button
                              type="button"
                              onClick={() => setScreenshots(screenshots.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {screenshots.length < 5 && (
                          <ImageUploader
                            value={null}
                            onChange={(url) => url && setScreenshots([...screenshots, url])}
                            folder="ai-tools"
                            label="Add screenshot"
                            aspectRatio="16:9"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO */}
              <TabsContent value="seo" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">SEO meta</CardTitle>
                    <CardDescription>Optimise how this tool appears in search results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitle">Meta title</Label>
                      <Input
                        id="metaTitle"
                        placeholder="SEO title (max 60 characters)"
                        {...register('metaTitle')}
                      />
                      <p className="text-xs text-muted-foreground">Leave blank to use tool name</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metaDescription">Meta description</Label>
                      <Textarea
                        id="metaDescription"
                        placeholder="SEO description (max 160 characters)"
                        rows={3}
                        {...register('metaDescription')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Featured</p>
                    <p className="text-xs text-muted-foreground">Show in featured section</p>
                  </div>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Verified</p>
                    <p className="text-xs text-muted-foreground">Mark as verified by team</p>
                  </div>
                  <Controller
                    name="isVerified"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSubmit(onSubmit, onError)}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    : <><Save className="h-4 w-4 mr-2" /> {isEdit ? 'Update tool' : 'Create tool'}</>
                  }
                </Button>
              </CardContent>
            </Card>

            {/* Preview card — edit only */}
            {isEdit && toolData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {toolData.logo ? (
                      <img
                        src={toolData.logo}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {toolData.name?.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{toolData.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{toolData.url}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Views: <span className="font-medium text-foreground">{toolData.viewCount || 0}</span></div>
                    <div>Rating: <span className="font-medium text-foreground">{toolData.averageRating?.toFixed(1) || '—'}</span></div>
                    <div>Reviews: <span className="font-medium text-foreground">{toolData.reviewCount || 0}</span></div>
                    <div>Likes: <span className="font-medium text-foreground">{toolData.likeCount || 0}</span></div>
                  </div>

                  {/* Public URL — only when published */}
                  {toolData.slug && toolData.status === 'published' && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Public URL</p>
                      <a
                        href={`${import.meta.env.VITE_CLIENT_URL}/ai-tools/${toolData.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        /ai-tools/{toolData.slug}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AIToolForm