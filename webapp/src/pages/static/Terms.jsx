import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import {
    FileText, ChevronRight, Mail, Clock,
    CheckCircle, Users, Shield, AlertTriangle,
    Ban, Cpu, Info, Scale, Globe, MessageSquare,
} from 'lucide-react'

const LAST_UPDATED = '2024-01-15'

const SECTIONS = [
    {
        id: 'acceptance',
        title: 'Acceptance of terms',
        number: '01',
        icon: CheckCircle,
        content: `By accessing or using Stakepedia ("Service"), you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all visitors, users and others who access or use the Service.

If you are using the Service on behalf of a company, organisation or other legal entity, you represent that you have authority to bind that entity to these Terms. If you do not have such authority, or if you do not agree with these Terms, you may not use the Service.

We reserve the right to update these Terms at any time. We will notify you of significant changes by email or by posting a notice on our website. Continued use after changes take effect constitutes acceptance of the updated Terms.`,
    },
    {
        id: 'description',
        title: 'Description of service',
        number: '02',
        icon: Cpu,
        content: `Stakepedia is an AI tools directory and educational resource platform. Our Service includes:

**Discovery platform.** A searchable, curated directory of AI tools with descriptions, pricing information, ratings and user reviews.

**Educational content.** Courses, tutorials and blog posts related to AI tools, prompt engineering and artificial intelligence.

**Prompt library.** A collection of ready-to-use prompts for various AI tools and use cases, contributed by our team and community.

**Community features.** User accounts, ratings, reviews, comments and the ability to save tools to personalised lists.

We reserve the right to modify, suspend or discontinue any part of the Service at any time with reasonable notice. We will not be liable to you or any third party for any modification, suspension or discontinuation of the Service.`,
    },
    {
        id: 'accounts',
        title: 'User accounts',
        number: '03',
        icon: Users,
        content: `**Registration.** To access certain features, you must create an account. You agree to provide accurate, current and complete information during registration and to update this information as needed.

**Account security.** You are responsible for safeguarding your password and for all activities that occur under your account. Notify us immediately at security@stakepedia.com if you suspect unauthorised access. We cannot be liable for any loss arising from your failure to keep your account secure.

**One account per person.** You may not create multiple accounts or share your account credentials with others. Accounts created to evade a ban or circumvent usage limits will be terminated.

**Age requirement.** You must be at least 13 years old to create an account. Users under 18 require parental or guardian consent.

**Account termination.** We reserve the right to suspend or permanently disable accounts that violate these Terms, engage in abusive behaviour, or for any other reason at our sole discretion. You may delete your account at any time via account settings.`,
    },
    {
        id: 'user-content',
        title: 'User-generated content',
        number: '04',
        icon: MessageSquare,
        content: `**Your content.** "User Content" means any content you submit through the Service — including reviews, ratings, comments, and profile information. You retain ownership of your User Content.

**Licence to us.** By submitting User Content, you grant Stakepedia a worldwide, non-exclusive, royalty-free, perpetual licence to use, copy, modify, publish, translate and display your User Content in connection with the Service and our business.

**Content standards.** You agree not to submit content that:
— Is false, misleading or deceptive
— Infringes any third-party intellectual property rights
— Contains personal attacks, harassment or hate speech
— Includes spam, promotional material or irrelevant content
— Violates any applicable law or regulation
— Contains malware, viruses or harmful code

**Moderation.** We moderate user-submitted content before publication. We reserve the right to remove any User Content at any time and for any reason without prior notice.

**No endorsement.** User reviews and ratings reflect individual opinions and not the views of Stakepedia. We do not verify claims made in user reviews.`,
    },
    {
        id: 'prohibited',
        title: 'Prohibited uses',
        number: '05',
        icon: Ban,
        content: `You agree not to use the Service in any way that:

— Violates any applicable local, national or international law or regulation
— Is fraudulent, deceptive or harmful in any way
— Involves scraping, crawling or data mining the Service without our prior written consent
— Attempts to gain unauthorised access to any part of the Service or our infrastructure
— Interferes with or disrupts the integrity or performance of the Service
— Transmits unsolicited communications (spam) to other users
— Impersonates any person or entity, or falsely claims an affiliation with any person or entity
— Uses the Service to develop a competing product or service
— Circumvents any access controls, rate limits or usage restrictions we impose
— Uploads content that infringes third-party intellectual property rights

Violation of these prohibitions may result in immediate account termination and, where appropriate, referral to law enforcement.`,
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual property',
        number: '06',
        icon: Shield,
        content: `**Our content.** The Service and its original content (excluding User Content), features and functionality are owned by Stakepedia and are protected by international copyright, trademark and other intellectual property laws.

**Our trademarks.** The Stakepedia name, logo and product names are trademarks of Stakepedia. You may not use our trademarks without prior written consent.

**Third-party content.** AI tool descriptions, logos and information about third-party products belong to their respective owners. We include this content for informational purposes under fair use provisions.

**Feedback.** Any feedback, suggestions or ideas you provide about the Service may be used by us without restriction or compensation. You waive any rights you may have in such Feedback.

**DMCA.** If you believe your copyright has been infringed by content on our platform, please send a DMCA takedown notice to legal@stakepedia.com. We will respond promptly and remove infringing content.`,
    },
    {
        id: 'disclaimers',
        title: 'Disclaimers',
        number: '07',
        icon: Info,
        content: `**As-is basis.** The Service is provided on an "AS IS" and "AS AVAILABLE" basis without any warranties, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose or non-infringement.

**Accuracy.** We strive to keep information about AI tools accurate and up to date, but we cannot guarantee that all information is current, complete or error-free. AI tools change rapidly — pricing, features and availability may have changed since our listing was last updated. Always verify information directly with the tool provider before making purchasing decisions.

**User reviews.** Reviews and ratings on our platform reflect individual user opinions and have not been independently verified by Stakepedia. We do not endorse any tool or product listed on our platform.

**Availability.** We do not warrant that the Service will be available uninterrupted or error-free. We may perform maintenance that temporarily limits access.

**External links.** Our Service contains links to third-party websites. We have no control over, and assume no responsibility for, the content or practices of any third-party sites.`,
    },
    {
        id: 'limitation',
        title: 'Limitation of liability',
        number: '08',
        icon: AlertTriangle,
        content: `To the maximum extent permitted by applicable law, Stakepedia and its directors, employees and agents shall not be liable for any indirect, incidental, special, consequential or punitive damages — including but not limited to loss of profits, data, goodwill or other intangible losses — resulting from:

— Your use of or inability to use the Service
— Any unauthorised access to or alteration of your data
— Any conduct or content of any third party on the Service
— Any content obtained from the Service
— Any errors or omissions in any content posted, emailed or otherwise transmitted via the Service

Our total liability to you for all claims arising from or related to these Terms or the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or £100 (GBP) if you have not made any payments.

Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above may not apply to you.`,
    },
    {
        id: 'governing-law',
        title: 'Governing law',
        number: '09',
        icon: Scale,
        content: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts located in Ahmedabad, Gujarat, India.

If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms will otherwise remain in full force and effect.

Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.`,
    },
    {
        id: 'contact-legal',
        title: 'Contact',
        number: '10',
        icon: Globe,
        content: `Questions about these Terms should be sent to legal@stakepedia.com.

**Stakepedia**
Ahmedabad, Gujarat, India
legal@stakepedia.com

For general support, visit our Contact page. For privacy-related enquiries, see our Privacy Policy.`,
    },
]

/* ── Render bold + bullet list content ───────────────────── */
function renderContent(text) {
    return text.split('\n\n').filter(Boolean).map((para, i) => {
        const trimmed = para.trim()

        // Bullet list block
        if (trimmed.startsWith('—')) {
            const lines = trimmed.split('\n').filter(Boolean)
            return (
                <ul key={i} className="space-y-1.5 mb-4 ml-1">
                    {lines.map((line, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2.5">
                            <span className="shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-primary/50" />
                            {line.replace(/^—\s*/, '')}
                        </li>
                    ))}
                </ul>
            )
        }

        // Normal paragraph (possibly with bold)
        const parts = trimmed.split(/(\*\*[^*]+\*\*)/)
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

/* ── Main ─────────────────────────────────────────────────── */
export default function Terms() {
    const [activeSection, setActiveSection] = useState('acceptance')

    /* IntersectionObserver — auto-highlight active TOC item */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id)
                })
            },
            { rootMargin: '-20% 0% -70% 0%' }
        )
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    return (
        <div className="pt-8">
            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* ── Page header ── */}
                <div className="mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-5">
                        <FileText className="h-3.5 w-3.5" />
                        Legal document
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-4">Terms of Service</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Last updated: {formatDate(LAST_UPDATED)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                            <Scale className="h-3.5 w-3.5 text-primary" />
                            Governed by Indian law · Ahmedabad jurisdiction
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-5 leading-relaxed max-w-2xl text-sm border-l-2 border-primary pl-4">
                        Please read these Terms carefully before using Stakepedia. By using our Service, you agree to be bound by these Terms. Questions? Email{' '}
                        <a href="mailto:legal@stakepedia.com" className="text-primary hover:underline font-medium">legal@stakepedia.com</a>.
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

                            {/* Quick contact */}
                            <div className="mt-6 p-4 rounded-2xl border border-border bg-card">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Legal contact</p>
                                <a href="mailto:legal@stakepedia.com"
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    legal@stakepedia.com
                                </a>
                                <Link to="/contact"
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors mt-2">
                                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                    General contact page
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* ── Content ── */}
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

                        {/* Contact CTA */}
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mt-4">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base mb-1">Questions about our terms?</h3>
                                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                        Our team is happy to clarify anything. Reach out to our legal team or use our general contact page.
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <a href="mailto:legal@stakepedia.com" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                            <Scale className="h-3.5 w-3.5" /> legal@stakepedia.com
                                        </a>
                                        <Link to="/contact" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                            <MessageSquare className="h-3.5 w-3.5" /> Contact page
                                        </Link>
                                        <Link to="/privacy" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
                                            <Shield className="h-3.5 w-3.5" /> Privacy Policy
                                        </Link>
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