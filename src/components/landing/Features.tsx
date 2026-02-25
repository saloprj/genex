'use client'

import { motion } from 'framer-motion'
import { BookOpen, FlaskConical, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Education-First',
    description:
      'We prioritize understanding pathways and mechanisms before access.',
  },
  {
    icon: FlaskConical,
    title: 'Research-Driven',
    description:
      'Dedicated to research-first, clinical framing for clarity and precision.',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible Access',
    description:
      'Access is granted cautiously, with education as the foundation.',
  },
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Why Gene X Labs?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-teal/10 border border-brand-teal/20 mb-4">
                <feature.icon className="w-7 h-7 text-brand-teal" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-brand-muted">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
