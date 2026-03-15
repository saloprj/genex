'use client'

import { motion } from 'framer-motion'
import { EmailCaptureForm } from './EmailCaptureForm'

export function Hero() {
  return (
    <section id="get-started" className="relative min-h-[85vh] flex items-center justify-center hero-bg bg-space-grid overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-teal/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-orange/8 rounded-full blur-[80px] animate-pulse-glow" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4"
        >
          <span className="italic">Precision</span> Meets{' '}
          <span className="italic">Understanding</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-brand-muted mb-8 max-w-xl mx-auto"
        >
          Welcome to Gene X Labs, where research drives peptide education
          in the pursuit of knowledge and discipline.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <EmailCaptureForm />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xs text-brand-subtle mt-4"
        >
          * Educational content only.
        </motion.p>
      </div>
    </section>
  )
}
