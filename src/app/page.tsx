import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import FeaturesSection from '@/components/FeaturesSection'
import SponsorsSection from '@/components/SponsorsSection'
import ProjectsSection from '@/components/ProjectsSection'
import NewsletterSignup from '@/components/NewsletterSignup'
import TestimonialsSection from '@/components/TestimonialsSection'
import CallToAction from '@/components/CallToAction'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import ContactForm from '@/components/ContactForm'

export default function Page () {
  return (
    <div data-theme='night' className='bg-base-200 text-base-content'>
      <HeroSection />
      <div className='mx-auto'>
        <AboutSection />
        <FeaturesSection />
        <SponsorsSection />
        <ProjectsSection />
        <TestimonialsSection />
        <CallToAction />
        <PricingSection />
        <FAQSection />
        <NewsletterSignup />
        <ContactForm />
      </div>
    </div>
  )
}
