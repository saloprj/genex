'use client'

import { motion } from 'framer-motion'
import { Microscope, Stethoscope, Dumbbell } from 'lucide-react'
import { EmailCaptureForm } from './EmailCaptureForm'

const audiences = [
  {
    icon: Microscope,
    title: 'Scientists & Researchers',
    description:
      'Investigating biological pathways through rigorous scientific methodology.',
  },
  {
    icon: Stethoscope,
    title: 'Medical Professionals',
    description:
      'Seeking precision in metabolic and signaling research.',
  },
  {
    icon: Dumbbell,
    title: 'Performance Athletes',
    description:
      'Exploring advancements in recovery and human endurance research.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-brand-surface/50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">
            Who&apos;s Exploring Research Peptides?
          </h2>
          <p className="text-brand-muted">
            Education first. Access follows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {audiences.map((audience, i) => (
            <motion.div
              key={audience.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-surface border border-brand-border mb-4">
                <audience.icon className="w-7 h-7 text-brand-muted" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{audience.title}</h3>
              <p className="text-sm text-brand-muted">{audience.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <EmailCaptureForm showName />
        </motion.div>
      </div>
    </section>
  )
}
