import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { DisclaimerBanner } from '@/components/layout/Disclaimer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DisclaimerBanner />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
