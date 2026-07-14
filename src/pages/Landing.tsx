import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { TrustStrip } from '../components/TrustStrip'
import { HowItWorks } from '../components/HowItWorks'
import { JobGrid } from '../components/JobGrid'
import { ComplianceMock } from '../components/ComplianceMock'
import { ForStudentsEmployers } from '../components/ForStudentsEmployers'
import { Testimonials } from '../components/Testimonials'
import { Pricing } from '../components/Pricing'
import { FAQ } from '../components/FAQ'
import { CTABand } from '../components/CTABand'
import { Footer } from '../components/Footer'

export function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <JobGrid />
        <ComplianceMock />
        <ForStudentsEmployers />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTABand />
      </main>
      <Footer />
    </>
  )
}
