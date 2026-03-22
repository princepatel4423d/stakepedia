import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Mail, MessageSquare, MapPin, Clock,
    Twitter, Github, Linkedin, Send,
    HelpCircle, Bug, Lightbulb, Building,
    CheckCircle, ArrowRight, Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'

/* ── Schema ───────────────────────────────────────────────── */
const schema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Valid email required'),
    subject: z.string().min(1, 'Please select a subject'),
    message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
})

/* ── Data ─────────────────────────────────────────────────── */
const SUBJECTS = [
    { value: 'general', label: 'General enquiry', icon: MessageSquare },
    { value: 'tool-submission', label: 'Submit an AI tool', icon: Lightbulb },
    { value: 'bug', label: 'Report a bug', icon: Bug },
    { value: 'partnership', label: 'Partnership / press', icon: Building },
    { value: 'support', label: 'Account support', icon: HelpCircle },
]

const CONTACT_INFO = [
    {
        icon: Mail,
        title: 'Email us',
        value: 'jainishparmar63@gmail.com',
        note: 'We reply within 24 hours on business days',
        color: 'bg-primary/10 text-primary',
    }
]

const SOCIAL = [
    { icon: Twitter, label: 'Twitter', href: '#', handle: '@stakepedia', hover: 'hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30' },
    { icon: Github, label: 'GitHub', href: '#', handle: 'stakepedia', hover: 'hover:bg-foreground/10 hover:text-foreground hover:border-foreground/20' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', handle: 'Stakepedia', hover: 'hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30' },
]

/* ── Component ────────────────────────────────────────────── */
export default function Contact() {
    const [sent, setSent] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { subject: '', message: '' },
    })

    const watchedSubject = watch('subject')
    const messageLength = watch('message')?.length || 0

    const onSubmit = (data) => {
        console.log('Contact form submission:', data)
        setSent(true)
        toast.success("Message sent! We'll get back to you soon.")
        reset()
    }

    /* ── Success screen ───────────────────────────────────────── */
    if (sent) {
        return (
            <div className="pt-16 min-h-[80vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-12 w-12 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black mb-3 tracking-tight">Message sent!</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        Thanks for reaching out. We typically reply within one business day. Keep an eye on your inbox!
                    </p>
                    <Button variant="outline" className="rounded-xl gap-2" onClick={() => setSent(false)}>
                        Send another message <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    /* ── Main UI ──────────────────────────────────────────────── */
    return (
        <div className="py-8">

            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="relative py-12 overflow-hidden border-b border-border">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-size-[64px_64px]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(var(--primary)/0.08),transparent)]" />
                </div>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2 border border-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        We'd love to hear from you
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
                        Get in touch
                    </h1>
                    <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                        Have a question, idea, or tool to submit? Drop us a message and we'll get back to you within 24 hours.
                    </p>
                </div>
            </section>

            {/* ── Body ─────────────────────────────────────────────── */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* ── FORM (2/3) ────────────────────────────────── */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl border border-border bg-card p-8">
                                <h2 className="text-xl font-bold mb-1">Send a message</h2>
                                <p className="text-sm text-muted-foreground mb-8">Fill in the form and we'll be in touch.</p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                                    {/* Name + Email */}
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name *</Label>
                                            <Input
                                                {...register('name')}
                                                placeholder="Your name"
                                                className="rounded-xl h-11 focus-visible:ring-primary/30"
                                            />
                                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email *</Label>
                                            <Input
                                                type="email"
                                                {...register('email')}
                                                placeholder="you@example.com"
                                                className="rounded-xl h-11 focus-visible:ring-primary/30"
                                            />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject *</Label>
                                        <Select
                                            value={watchedSubject}
                                            onValueChange={(v) => setValue('subject', v, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="rounded-xl h-11">
                                                <SelectValue placeholder="What's this about?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SUBJECTS.map(({ value, label, icon: Icon }) => (
                                                    <SelectItem key={value} value={value}>
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                                    </div>

                                    {/* Conditional hint */}
                                    {watchedSubject === 'tool-submission' && (
                                        <div className="flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-700 dark:text-amber-400">
                                            <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>Please include the tool's name, URL, a short description, and the category it belongs to.</p>
                                        </div>
                                    )}
                                    {watchedSubject === 'bug' && (
                                        <div className="flex gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-600 dark:text-red-400">
                                            <Bug className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>Include steps to reproduce, what you expected, and what actually happened. Screenshots help!</p>
                                        </div>
                                    )}
                                    {watchedSubject === 'partnership' && (
                                        <div className="flex gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-sm text-blue-600 dark:text-blue-400">
                                            <Building className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>Tell us about your company and what kind of partnership you have in mind.</p>
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message *</Label>
                                            <span className={`text-xs ${messageLength > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {messageLength}/2000
                                            </span>
                                        </div>
                                        <Textarea
                                            {...register('message')}
                                            maxLength={2000}
                                            rows={6}
                                            placeholder="Tell us what's on your mind..."
                                            className="rounded-xl resize-none focus-visible:ring-primary/30"
                                        />
                                        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="gap-2 rounded-xl h-11 px-8 font-semibold w-full sm:w-auto"
                                    >
                                        <Send className="h-4 w-4" />
                                        {isSubmitting ? 'Sending...' : 'Send message'}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* ── SIDEBAR (1/3) ─────────────────────────────── */}
                        <div className="space-y-5">

                            {/* Contact info cards */}
                            {CONTACT_INFO.map(({ icon: Icon, title, value, note, color }) => (
                                <div key={title} className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{title}</p>
                                        <p className="text-sm font-semibold truncate">{value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{note}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Social links */}
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Find us online</p>
                                <div className="space-y-2">
                                    {SOCIAL.map(({ icon: Icon, label, href, handle, hover }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border text-sm text-muted-foreground transition-all ${hover}`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span className="font-medium">{handle}</span>
                                            <span className="text-xs ml-auto opacity-60">on {label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Response time badge */}
                            <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                    Average response time: <strong>under 4 hours</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}