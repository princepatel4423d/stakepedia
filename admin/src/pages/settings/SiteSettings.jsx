import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Globe, Search, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '@/components/shared/PageHeader'
import ImageUploader from '@/components/shared/ImageUploader'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { settingsApi } from '@/api/settings.api'

const SiteSettings = () => {
    const qc = useQueryClient()
    const [maintenanceDialog, setMaintenanceDialog] = useState(false)

    const { data: settings, isLoading } = useQuery({
        queryKey: ['site-settings'],
        queryFn: () => settingsApi.get(),
        select: (res) => res.data.data,
    })

    const { register, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            siteName: '',
            siteDescription: '',
            siteLogo: '',
            favicon: '',
            googleAnalyticsId: '',
            allowRegistrations: true,
            emailNotifications: true,
            socialLinks: {
                twitter: '',
                github: '',
                linkedin: '',
                discord: '',
                youtube: '',
            },
            seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: '',
                ogImage: '',
            },
            customHeaderScripts: '',
            customFooterScripts: '',
        },
    })

    useEffect(() => {
        if (!settings) return
        reset({
            siteName: settings.siteName || '',
            siteDescription: settings.siteDescription || '',
            siteLogo: settings.siteLogo || '',
            favicon: settings.favicon || '',
            googleAnalyticsId: settings.googleAnalyticsId || '',
            allowRegistrations: settings.allowRegistrations ?? true,
            emailNotifications: settings.emailNotifications ?? true,
            socialLinks: {
                twitter: settings.socialLinks?.twitter || '',
                github: settings.socialLinks?.github || '',
                linkedin: settings.socialLinks?.linkedin || '',
                discord: settings.socialLinks?.discord || '',
                youtube: settings.socialLinks?.youtube || '',
            },
            seo: {
                metaTitle: settings.seo?.metaTitle || '',
                metaDescription: settings.seo?.metaDescription || '',
                keywords: settings.seo?.keywords?.join(', ') || '',
                ogImage: settings.seo?.ogImage || '',
            },
            customHeaderScripts: settings.customHeaderScripts || '',
            customFooterScripts: settings.customFooterScripts || '',
        })
    }, [settings, reset])

    const saveMutation = useMutation({
        mutationFn: (data) => settingsApi.update(data),
        onSuccess: (res) => {
            toast.success('Settings saved')
            if (res?.data?.data) {
                qc.setQueryData(['site-settings'], res.data.data)
            }
            qc.invalidateQueries({ queryKey: ['site-settings'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    })

    const maintenanceMutation = useMutation({
        mutationFn: settingsApi.toggleMaintenance,
        onSuccess: () => {
            toast.success(`Maintenance mode ${settings?.maintenanceMode ? 'disabled' : 'enabled'}`)
            qc.invalidateQueries({ queryKey: ['site-settings'] })
            setMaintenanceDialog(false)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
    })

    const onSubmit = (data) => {
        const payload = {
            siteName: data.siteName,
            siteDescription: data.siteDescription,
            siteLogo: data.siteLogo || null,
            favicon: data.favicon || null,
            googleAnalyticsId: data.googleAnalyticsId,
            allowRegistrations: data.allowRegistrations ?? true,
            emailNotifications: data.emailNotifications ?? true,
            socialLinks: {
                twitter: data.socialLinks?.twitter || null,
                github: data.socialLinks?.github || null,
                linkedin: data.socialLinks?.linkedin || null,
                discord: data.socialLinks?.discord || null,
                youtube: data.socialLinks?.youtube || null,
            },
            seo: {
                metaTitle: data.seo?.metaTitle || null,
                metaDescription: data.seo?.metaDescription || null,
                keywords: data.seo?.keywords
                    ?.split(',').map((k) => k.trim()).filter(Boolean) || [],
                ogImage: data.seo?.ogImage || null,
            },
            customHeaderScripts: data.customHeaderScripts,
            customFooterScripts: data.customFooterScripts,
        }
        saveMutation.mutate(payload)
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Site settings"
                description="Manage global site configuration"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Settings' },
                ]}
                actions={
                    <Button onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending || isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {saveMutation.isPending ? 'Saving...' : 'Save settings'}
                    </Button>
                }
            />

            <form onSubmit={handleSubmit(onSubmit)}>
                <Tabs defaultValue="general">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="social">Social</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    {/* General */}
                    <TabsContent value="general" className="space-y-4 mt-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Brand</CardTitle>
                                <CardDescription>Site name, description and logo</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="siteName">Site name</Label>
                                        <Input id="siteName" placeholder="Stakepedia" {...register('siteName')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                                        <Input
                                            id="googleAnalyticsId"
                                            placeholder="G-XXXXXXXXXX"
                                            {...register('googleAnalyticsId')}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteDescription">Site description</Label>
                                    <Textarea
                                        id="siteDescription"
                                        placeholder="Discover the best AI tools, courses and prompts"
                                        rows={2}
                                        {...register('siteDescription')}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Logo</Label>
                                        <ImageUploader
                                            value={watch('siteLogo')}
                                            onChange={(url) => {
                                                setValue('siteLogo', url || '', { shouldDirty: true })
                                            }}
                                            folder="settings"
                                            label="Upload logo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Favicon</Label>
                                        <ImageUploader
                                            value={watch('favicon')}
                                            onChange={(url) => {
                                                setValue('favicon', url || '', { shouldDirty: true })
                                            }}
                                            folder="settings"
                                            label="Upload favicon"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <Card className="h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Site behaviour</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-3">
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="text-sm font-medium">Allow registrations</p>
                                            <p className="text-xs text-muted-foreground">Let new users create accounts</p>
                                        </div>
                                        <Switch
                                            checked={watch('allowRegistrations')}
                                            onCheckedChange={(v) => setValue('allowRegistrations', v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="text-sm font-medium">Email notifications</p>
                                            <p className="text-xs text-muted-foreground">Send transactional emails to users</p>
                                        </div>
                                        <Switch
                                            checked={watch('emailNotifications')}
                                            onCheckedChange={(v) => setValue('emailNotifications', v)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-destructive/50 h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
                                    <CardDescription>
                                        Maintenance mode blocks all public routes with a 503 message
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-destructive/30 bg-destructive/5">
                                        <div>
                                            <p className="text-sm font-medium">Maintenance mode</p>
                                            <p className="text-xs text-muted-foreground">
                                                Currently: <span className={settings?.maintenanceMode ? 'text-destructive font-semibold' : 'text-green-600 font-semibold'}>
                                                    {settings?.maintenanceMode ? 'ON' : 'OFF'}
                                                </span>
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant={settings?.maintenanceMode ? 'outline' : 'destructive'}
                                            size="sm"
                                            onClick={() => setMaintenanceDialog(true)}
                                        >
                                            {settings?.maintenanceMode ? 'Disable' : 'Enable'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* SEO */}
                    <TabsContent value="seo" className="space-y-4 mt-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Search className="h-4 w-4" /> SEO defaults
                                </CardTitle>
                                <CardDescription>Default meta tags for pages without specific SEO settings</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="metaTitle">Default meta title</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {watch('seo.metaTitle')?.length || 0}/60
                                        </span>
                                    </div>
                                    <Input
                                        id="metaTitle"
                                        placeholder="Stakepedia — Discover AI Tools"
                                        {...register('seo.metaTitle')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="metaDesc">Default meta description</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {watch('seo.metaDescription')?.length || 0}/160
                                        </span>
                                    </div>
                                    <Textarea
                                        id="metaDesc"
                                        placeholder="Discover and explore the best AI tools, courses and prompts"
                                        rows={3}
                                        {...register('seo.metaDescription')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="keywords">Keywords</Label>
                                    <Input
                                        id="keywords"
                                        placeholder="ai tools, prompt engineering, machine learning"
                                        {...register('seo.keywords')}
                                    />
                                    <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>OG image</Label>
                                    <ImageUploader
                                        value={watch('seo.ogImage')}
                                        onChange={(url) => {
                                            setValue('seo.ogImage', url || '', { shouldDirty: true })
                                        }}
                                        folder="settings"
                                        label="Upload OG image (1200×630)"
                                        aspectRatio="16:9"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Social */}
                    <TabsContent value="social" className="space-y-4 mt-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Globe className="h-4 w-4" /> Social links
                                </CardTitle>
                                <CardDescription>Links shown in the footer and social sections</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
                                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
                                    { key: 'discord', label: 'Discord', placeholder: 'https://discord.gg/...' },
                                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
                                ].map(({ key, label, placeholder }) => (
                                    <div key={key} className="space-y-2">
                                        <Label>{label}</Label>
                                        <Input
                                            placeholder={placeholder}
                                            {...register(`socialLinks.${key}`)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced */}
                    <TabsContent value="advanced" className="space-y-4 mt-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Code className="h-4 w-4" /> Custom scripts
                                </CardTitle>
                                <CardDescription>Inject custom HTML/JS into the site head or body</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="headerScripts">Header scripts</Label>
                                    <Textarea
                                        id="headerScripts"
                                        placeholder="<!-- Scripts injected before </head> -->"
                                        rows={5}
                                        className="font-mono text-xs"
                                        {...register('customHeaderScripts')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="footerScripts">Footer scripts</Label>
                                    <Textarea
                                        id="footerScripts"
                                        placeholder="<!-- Scripts injected before </body> -->"
                                        rows={5}
                                        className="font-mono text-xs"
                                        {...register('customFooterScripts')}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>

            <ConfirmDialog
                open={maintenanceDialog}
                onOpenChange={setMaintenanceDialog}
                title={settings?.maintenanceMode ? 'Disable maintenance mode?' : 'Enable maintenance mode?'}
                description={
                    settings?.maintenanceMode
                        ? 'The site will be accessible to all users again.'
                        : 'All public routes will return a 503 maintenance page. Admin panel will still work.'
                }
                confirmLabel={settings?.maintenanceMode ? 'Disable' : 'Enable'}
                variant={settings?.maintenanceMode ? 'default' : 'destructive'}
                loading={maintenanceMutation.isPending}
                onConfirm={() => maintenanceMutation.mutate()}
            />
        </div>
    )
}

export default SiteSettings