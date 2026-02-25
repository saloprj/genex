import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DisclaimerBanner } from '@/components/layout/Disclaimer'
import { Disclaimer } from '@/components/layout/Disclaimer'
import { FlaskConical, BookOpen, ShieldCheck, Award } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Gene X Labs and our commitment to research-grade peptides.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DisclaimerBanner />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">About Gene X Labs</h1>
            <p className="text-lg text-brand-muted max-w-2xl mx-auto">
              Precision research peptides for scientific exploration.
              Education-first approach to peptide research.
            </p>
          </div>

          {/* Mission */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <p className="text-brand-muted leading-relaxed mb-4">
              Gene X Labs is dedicated to advancing peptide research by providing
              the highest quality research-grade compounds alongside comprehensive
              educational resources. We believe that responsible access to research
              materials begins with understanding.
            </p>
            <p className="text-brand-muted leading-relaxed">
              Our education-first model ensures that every researcher who accesses
              our catalogue has the foundational knowledge to conduct their work
              with precision and responsibility.
            </p>
          </section>

          {/* Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: 'Education First',
                  description:
                    'We prioritize understanding before access. Every researcher should know the pathways and mechanisms relevant to their work.',
                },
                {
                  icon: FlaskConical,
                  title: 'Research Integrity',
                  description:
                    'All compounds undergo rigorous quality control with Certificates of Analysis available for every batch.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Responsible Access',
                  description:
                    'Our private-access model ensures that materials reach qualified researchers committed to ethical scientific exploration.',
                },
                {
                  icon: Award,
                  title: 'Quality Assurance',
                  description:
                    'HPLC and Mass Spec testing validate compound integrity, purity, and consistency across all products.',
                },
              ].map((value) => (
                <div
                  key={value.title}
                  className="bg-brand-surface border border-brand-border rounded-lg p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-brand-teal/10 flex items-center justify-center">
                      <value.icon className="w-5 h-5 text-brand-teal" />
                    </div>
                    <h3 className="font-semibold">{value.title}</h3>
                  </div>
                  <p className="text-sm text-brand-muted">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COA */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Quality & Testing</h2>
            <div className="bg-brand-surface border border-brand-border rounded-lg p-8">
              <p className="text-brand-muted leading-relaxed mb-4">
                Certificates of Analysis (COAs) are presented for each batch ensuring
                identity, purity, and consistency. Rigorous HPLC and Mass Spec tests
                validate compound integrity.
              </p>
              <p className="text-brand-muted leading-relaxed">
                We are committed to transparency in our testing processes and
                welcome inquiries about specific batch analyses.
              </p>
            </div>
          </section>

          <Disclaimer />
        </div>
      </main>
      <Footer />
    </div>
  )
}
