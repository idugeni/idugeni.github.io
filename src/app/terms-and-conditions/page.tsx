import React from 'react'

export const metadata = {
  title: 'Terms and Conditions',
  description:
    'Read the terms and conditions for using the services provided by IduGeni SabdoDadi.',
}

const TermsAndConditions = () => {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Terms and Conditions
        </h1>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Introduction
          </h2>
          <p className='text-base-content'>
            These Terms and Conditions govern your use of our website and
            services. By accessing or using our services, you agree to be bound
            by these terms. Please read them carefully.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Use of Services
          </h2>
          <p className='text-base-content'>
            You agree to use our services only for lawful purposes and in a way
            that does not infringe the rights of others or restrict or inhibit
            their use and enjoyment of the services. Prohibited behavior
            includes harassing or causing distress or inconvenience to any other
            user, transmitting obscene or offensive content, or disrupting the
            normal flow of dialogue within our services.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Intellectual Property
          </h2>
          <p className='text-base-content'>
            All content included on this site, such as text, graphics, logos,
            images, and software, is the property of IduGeni SabdoDadi or its
            content suppliers and protected by international copyright laws. The
            compilation of all content on this site is the exclusive property of
            IduGeni SabdoDadi and protected by international copyright laws.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Limitation of Liability
          </h2>
          <p className='text-base-content'>
            IduGeni SabdoDadi will not be liable for any direct, indirect,
            incidental, special, consequential, or exemplary damages resulting
            from the use of or inability to use our services, or for the cost of
            procurement of substitute goods and services, or resulting from any
            goods or services purchased or obtained or messages received or
            transactions entered into through our services.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Changes to the Terms
          </h2>
          <p className='text-base-content'>
            We reserve the right to modify these Terms and Conditions at any
            time. Your continued use of the site following the posting of
            changes to these terms will mean you accept those changes.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Governing Law
          </h2>
          <p className='text-base-content'>
            These terms are governed by and construed in accordance with the
            laws of the jurisdiction in which IduGeni SabdoDadi is based, and
            you irrevocably submit to the exclusive jurisdiction of the courts
            in that location.
          </p>
        </div>

        <div className='mb-8'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-4'>
            Contact Us
          </h2>
          <p className='text-base-content'>
            If you have any questions about these Terms and Conditions, please
            contact us at contact@idugeni.com.
          </p>
        </div>
      </div>
    </section>
  )
}

export default TermsAndConditions
