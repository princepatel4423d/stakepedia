import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import {
    Shield, ChevronRight, Mail, Clock,
    Lock, Users, Database, Eye, Trash2,
    AlertCircle, Baby, RefreshCw, Share2,
} from 'lucide-react'

const LAST_UPDATED = '2026-01-15'

const SECTIONS = [
    {
        id: 'overview',
        title: 'Overview',
        number: '01',
        icon: Eye,
        content: `Stakepedia ("we", "us", "our") operates the website located at stakepedia.com (the "Service"). This Privacy Policy explains how we collect, use, disclose and safeguard your personal information when you visit our website and use our services.

By accessing or using our Service, you acknowledge that you have read, understood and agree to our collection and use of information in accordance with this policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.

We are committed to protecting your privacy. We handle all personal data in accordance with applicable privacy laws, including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA) and India's Digital Personal Data Protection Act (DPDPA).`,
    },
    {
        id: 'information-we-collect',
        title: 'Information we collect',
        number: '02',
        icon: Database,
        content: `We collect several different types of information for various purposes:

**Account information.** When you register for an account, we collect your name, email address and password (stored as a secure hash). If you register via Google OAuth, we receive your name, email and profile picture as permitted by your Google account settings.

**Profile information.** Any information you voluntarily add to your profile — such as a bio, website URL or social media links — is stored and may be visible to other users depending on your privacy settings.

**Usage data.** We automatically collect certain information when you use our Service, including your IP address, browser type, browser version, the pages you visit, the time and date of your visit, time spent on pages, device identifiers and other diagnostic data.

**User-generated content.** Reviews, ratings, comments and saved tools you submit through our platform are stored and, where applicable, published as part of the Service.

**Communications.** If you contact us by email or through our contact form, we retain the contents of your message and your contact details to respond to you and for our records.

**Cookies and tracking technologies.** We use cookies and similar tracking technologies to track activity on our Service and hold certain information. See our Cookies section below for more detail.`,
    },
    {
        id: 'how-we-use',
        title: 'How we use your information',
        number: '03',
        icon: RefreshCw,
        content: `We use the information we collect for the following purposes:

**To provide and maintain our Service** — processing your account registration, storing your saved tools and preferences, and enabling all core platform features.

**To improve our Service** — analysing usage patterns, identifying popular content, understanding user needs and developing new features. This analysis is performed on aggregated and anonymised data where possible.

**To communicate with you** — sending transactional emails such as account verification, password resets and notifications you've opted into. We do not send marketing emails without your explicit consent.

**To protect our platform** — detecting and preventing fraud, abuse and security incidents, enforcing our Terms of Service and complying with legal obligations.

**To personalise your experience** — showing you relevant AI tools based on categories you've browsed, recommending courses related to tools you've saved, and customising content based on your stated interests.

We do not sell your personal information to third parties. We do not allow advertisers to target you based on your Stakepedia activity.`,
    },
    {
        id: 'cookies',
        title: 'Cookies',
        number: '04',
        icon: Lock,
        content: `Cookies are small data files stored on your browser. We use the following categories of cookies:

**Essential cookies** are necessary for the Service to function. They enable core functionality such as security, account authentication and remembering your preferences. You cannot opt out of essential cookies.

**Analytics cookies** help us understand how visitors interact with our website by collecting and reporting information anonymously. We use these to identify popular pages, understand user journeys and improve performance. You can opt out of analytics cookies at any time.

**Preference cookies** remember your settings — such as dark/light mode and language preferences — to enhance your experience across visits.

We do not use advertising or tracking cookies. We do not allow third-party advertising networks to place cookies on our site.`,
    },
    {
        id: 'data-sharing',
        title: 'Data sharing and disclosure',
        number: '05',
        icon: Share2,
        content: `We do not sell, rent or trade your personal information. We share data only in the following limited circumstances:

**Service providers.** We use third-party companies to help operate our Service — including cloud infrastructure (hosting), email delivery, image storage and analytics. These providers are contractually bound to use your data only for the services they provide to us.

**Legal requirements.** We may disclose your information if required to do so by law or in response to valid requests by public authorities (such as a court order or government agency). We will notify you when permitted before complying with such requests.

**Business transfers.** In the event of a merger, acquisition, or sale of all or a portion of our assets, your personal data may be transferred. We will provide notice before your data is transferred.

**With your consent.** We may share your information with third parties when you have given explicit consent for us to do so.

**Aggregate data.** We may share anonymised, aggregated statistics about our users publicly. This data cannot be used to identify any individual.`,
    },
    {
        id: 'data-retention',
        title: 'Data retention',
        number: '06',
        icon: Clock,
        content: `We retain personal information for as long as your account is active or as needed to provide you with our Service.

**Active accounts.** Your account data is retained for the duration of your account's existence. You may delete your account at any time via account settings.

**Deleted accounts.** When you delete your account, we will delete your personal information within 30 days. Some anonymised data may be retained for statistical purposes.

**User-generated content.** Reviews and comments you've posted may remain visible after account deletion in anonymised form to preserve the integrity of our platform's content. You can request removal by contacting us.

**Backup data.** Copies of your data may persist in our backups for up to 90 days after deletion for disaster recovery purposes.

**Log data.** Server logs are retained for up to 12 months for security and debugging purposes, then permanently deleted.`,
    },
    {
        id: 'your-rights',
        title: 'Your rights',
        number: '07',
        icon: Users,
        content: `You have the following rights regarding your personal data:

**Right of access.** You can request a copy of the personal data we hold about you.

**Right to rectification.** You can ask us to correct inaccurate or incomplete personal data we hold about you. You can update most information directly in your account settings.

**Right to erasure.** You can request that we delete your personal data. Note that we may need to retain certain data for legal or legitimate business purposes.

**Right to restrict processing.** You can ask us to limit how we use your personal data in certain circumstances.

**Right to data portability.** You can request your personal data in a structured, machine-readable format.

**Right to object.** You can object to our processing of your personal data in certain circumstances, particularly for direct marketing.

To exercise any of these rights, email us at privacy@stakepedia.com. We will respond within 30 days.`,
    },
    {
        id: 'security',
        title: 'Security',
        number: '08',
        icon: Shield,
        content: `We implement a range of security measures to protect your personal information:

All data in transit is encrypted using TLS 1.2 or higher. Passwords are hashed using bcrypt before storage — we never store plain-text passwords. Our infrastructure is hosted on secure cloud platforms with regular security audits.

We restrict access to personal data to employees and contractors who need it to perform their job duties, and require all staff to comply with our data protection policies.

We use rate limiting, CAPTCHA and fraud detection to protect against automated attacks and unauthorised access attempts.

Despite these measures, no method of transmission over the internet or electronic storage is 100% secure. In the event of a data breach that affects your rights and freedoms, we will notify you and the relevant authorities as required by law.

If you discover a security vulnerability, please report it responsibly to security@stakepedia.com.`,
    },
    {
        id: 'children',
        title: "Children's privacy",
        number: '09',
        icon: Baby,
        content: `Our Service is not directed to children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.

If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us at privacy@stakepedia.com. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to remove that information from our servers promptly.

Users between the ages of 13 and 18 may use our Service only with the involvement and consent of a parent or legal guardian.`,
    },
    {
        id: 'changes',
        title: 'Changes to this policy',
        number: '10',
        icon: AlertCircle,
        content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements or other factors.

When we make changes, we will update the "Last updated" date at the top of this page. For material changes — those that significantly affect how we process your data — we will notify you by email at least 14 days before the change takes effect.

We encourage you to review this Privacy Policy periodically. Your continued use of our Service after the effective date of any changes constitutes your acceptance of the updated policy.

If you have questions about this Privacy Policy or our privacy practices, contact our Data Protection Officer at dpo@stakepedia.com.`,
    },
]

/* Render bold markdown in content */
function renderContent(text) {
    return text.split('\n\n').filter(Boolean).map((para, i) => {
        const parts = para.trim().split(/(\*\*[^*]+\*\*)/)
        return (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-4 last:mb-0">
                {parts.map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
                        : part
                )}
            </p>
        )
    })
}

/* Main */
export default function PrivacyPolicy() {
    const [activeSection, setActiveSection] = useState('overview')
    const observerRef = useRef(null)

    /* IntersectionObserver to auto-highlight active TOC item */
    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id)
                })
            },
            { rootMargin: '-20% 0% -70% 0%' }
        )
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observerRef.current.observe(el)
        })
        return () => observerRef.current?.disconnect()
    }, [])

    return (
        <div className="pt-8">
            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* Page header */}
                <div className="mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
                        <Shield className="h-3.5 w-3.5" />
                        Legal document
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Last updated: {formatDate(LAST_UPDATED)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                            <Lock className="h-3.5 w-3.5 text-emerald-500" />
                            GDPR · CCPA · DPDPA compliant
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-5 leading-relaxed max-w-2xl text-sm border-l-2 border-primary pl-4">
                        Your privacy matters to us. This policy explains clearly what data we collect, why we collect it and how we protect it. Questions? Email us at{' '}
                        <a href="mailto:stakepedia@gmail.com" className="text-primary hover:underline font-medium">stakepedia@gmail.com</a>.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* ── Sticky sidebar TOC ── */}
                    <nav className="lg:w-64 xl:w-72 shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-3">
                                Contents
                            </p>
                            <div className="space-y-0.5">
                                {SECTIONS.map(({ id, title, number, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2.5 group
                      ${activeSection === id
                                                ? 'bg-primary/10 text-primary font-semibold'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-bold shrink-0 ${activeSection === id ? 'text-primary' : 'text-muted-foreground/50'}`}>
                                            {number}
                                        </span>
                                        <Icon className={`h-3.5 w-3.5 shrink-0 ${activeSection === id ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`} />
                                        <span className="truncate">{title}</span>
                                        {activeSection === id && <ChevronRight className="h-3 w-3 ml-auto shrink-0" />}
                                    </button>
                                ))}
                            </div>

                            {/* Quick contact in sidebar */}
                            <div className="mt-6 p-4 rounded-2xl border border-border bg-card">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Privacy contact</p>
                                <a href="mailto:privacy@stakepedia.com"
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    stakepedia@gmail.com
                                </a>
                            </div>
                        </div>
                    </nav>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-2">
                        {SECTIONS.map(({ id, title, number, icon: Icon, content }) => (
                            <section
                                key={id}
                                id={id}
                                className="scroll-mt-28 rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/20 transition-colors"
                            >
                                {/* Section header */}
                                <div className="flex items-center gap-4 px-6 py-5 border-b border-border bg-muted/20">
                                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Icon className="h-4.5 w-4.5 text-primary" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{number}</span>
                                        <h2 className="text-base font-bold leading-tight">{title}</h2>
                                    </div>
                                </div>
                                {/* Section body */}
                                <div className="px-6 py-5">
                                    {renderContent(content)}
                                </div>
                            </section>
                        ))}

                        {/* Contact CTA card */}
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mt-4">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base mb-1">Still have questions?</h3>
                                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                        Our Data Protection Officer is happy to help with any privacy-related enquiries.
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <a href="mailto:dpo@stakepedia.com" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                            <Shield className="h-3.5 w-3.5" /> dpo@stakepedia.com
                                        </a>
                                        <a href="mailto:privacy@stakepedia.com" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                            <Mail className="h-3.5 w-3.5" /> privacy@stakepedia.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}