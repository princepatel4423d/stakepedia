import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Save, Sun, Moon, Monitor, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import { useThemeStore } from '@/store/themeStore'
import { settingsApi } from '@/api/settings.api'

const FONTS = [
    'Inter Variable', 'Poppins', 'Outfit', 'Roboto', 'DM Sans',
]

const PRESETS = [
    { label: 'Indigo', primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4' },
    { label: 'Emerald', primary: '#10b981', secondary: '#059669', accent: '#6366f1' },
    { label: 'Rose', primary: '#f43f5e', secondary: '#e11d48', accent: '#f97316' },
    { label: 'Amber', primary: '#f59e0b', secondary: '#d97706', accent: '#10b981' },
    { label: 'Sky', primary: '#0ea5e9', secondary: '#0284c7', accent: '#8b5cf6' },
    { label: 'Slate', primary: '#64748b', secondary: '#475569', accent: '#06b6d4' },
]

const ThemeMode = ({ value, icon: Icon, label, current, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(value)}
        className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
            current === value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-muted/50'
        )}
    >
        <Icon className={cn('h-6 w-6', current === value ? 'text-primary' : 'text-muted-foreground')} />
        <span className={cn('text-sm font-medium', current === value ? 'text-primary' : 'text-muted-foreground')}>
            {label}
        </span>
    </button>
)

const ColorSwatch = ({ color, label, value, onChange }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
            <div
                className="h-9 w-9 rounded-md border cursor-pointer shrink-0"
                style={{ backgroundColor: color }}
                onClick={() => document.getElementById(`color-${label}`)?.click()}
            />
            <Input
                id={`color-${label}`}
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full"
            />
            <Input
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#6366f1"
                className="h-9 font-mono text-sm"
                maxLength={7}
            />
        </div>
    </div>
)

const ThemeSettings = () => {
    const qc = useQueryClient()
    const {
        theme, primaryColor, secondaryColor, accentColor, fontFamily,
        setTheme, setColors, setFontFamily, applyAll,
    } = useThemeStore()

    const [localPrimary, setLocalPrimary] = useState(primaryColor)
    const [localSecondary, setLocalSecondary] = useState(secondaryColor)
    const [localAccent, setLocalAccent] = useState(accentColor)

    const saveMutation = useMutation({
        mutationFn: (data) => settingsApi.update(data),
        onSuccess: () => {
            toast.success('Theme settings saved')
            setColors({
                primaryColor: localPrimary,
                secondaryColor: localSecondary,
                accentColor: localAccent,
            })
            qc.invalidateQueries({ queryKey: ['site-settings'] })
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
    })

    const handleSave = () => {
        saveMutation.mutate({
            theme,
            primaryColor: localPrimary,
            secondaryColor: localSecondary,
            accentColor: localAccent,
            fontFamily,
        })
    }

    const applyPreset = (preset) => {
        setLocalPrimary(preset.primary)
        setLocalSecondary(preset.secondary)
        setLocalAccent(preset.accent)
    }

    const handleThemeChange = (val) => {
        setTheme(val)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Theme settings"
                description="Customise the look and feel of Stakepedia"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Settings', href: '/settings' },
                    { label: 'Theme' },
                ]}
                actions={
                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        {saveMutation.isPending ? 'Saving...' : 'Save theme'}
                    </Button>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Color mode */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Color mode</CardTitle>
                        <CardDescription>Choose how the interface appears</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            <ThemeMode value="light" icon={Sun} label="Light" current={theme} onChange={handleThemeChange} />
                            <ThemeMode value="dark" icon={Moon} label="Dark" current={theme} onChange={handleThemeChange} />
                            <ThemeMode value="system" icon={Monitor} label="System" current={theme} onChange={handleThemeChange} />
                        </div>
                    </CardContent>
                </Card>

                {/* Font */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Typography</CardTitle>
                        <CardDescription>Select the font used across the admin panel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            {FONTS.map((font) => (
                                <button
                                    key={font}
                                    type="button"
                                    onClick={() => setFontFamily(font)}
                                    style={{ fontFamily: font }}
                                    className={cn(
                                        'p-3 rounded-lg border-2 text-left transition-all',
                                        fontFamily === font
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                                    )}
                                >
                                    <p className="text-sm font-semibold">Aa</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{font}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Presets */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Palette className="h-4 w-4" /> Color presets
                        </CardTitle>
                        <CardDescription>Quick-apply a color scheme</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.label}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className="group flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary/40 hover:bg-muted/50 transition-all"
                                >
                                    <div className="flex gap-1">
                                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.accent }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground">
                                        {preset.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Custom colors */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Custom colors</CardTitle>
                        <CardDescription>Fine-tune your brand colors</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ColorSwatch
                            label="Primary"
                            color={localPrimary}
                            value={localPrimary}
                            onChange={setLocalPrimary}
                        />
                        <ColorSwatch
                            label="Secondary"
                            color={localSecondary}
                            value={localSecondary}
                            onChange={setLocalSecondary}
                        />
                        <ColorSwatch
                            label="Accent"
                            color={localAccent}
                            value={localAccent}
                            onChange={setLocalAccent}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Live preview */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Live preview</CardTitle>
                    <CardDescription>See how your colors look before saving</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                            style={{ backgroundColor: localPrimary }}
                        >
                            Primary button
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                            style={{ backgroundColor: localSecondary }}
                        >
                            Secondary button
                        </button>
                        <button
                            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                            style={{ backgroundColor: localAccent }}
                        >
                            Accent button
                        </button>
                        <div
                            className="px-4 py-2 rounded-lg text-sm font-medium border-2"
                            style={{ borderColor: localPrimary, color: localPrimary }}
                        >
                            Outlined
                        </div>
                        <div
                            className="px-4 py-2 rounded-lg text-sm font-medium"
                            style={{ backgroundColor: localPrimary + '20', color: localPrimary }}
                        >
                            Ghost
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ThemeSettings