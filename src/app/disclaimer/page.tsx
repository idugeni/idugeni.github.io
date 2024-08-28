export const metadata = {
  title: 'Disclaimer',
  description: 'Disclaimer for IduGeni SabdoDadi website.',
}

const DisclaimerPage = () => {
  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center text-primary'>
          Disclaimer
        </h1>
        <p className='text-lg text-center mb-12'>
          The information provided by IduGeni SabdoDadi (“we,” “us,” or “our”)
          on this website is for general informational purposes only. All
          information on the site is provided in good faith, however, we make no
          representation or warranty of any kind, express or implied, regarding
          the accuracy, adequacy, validity, reliability, availability, or
          completeness of any information on the site.
        </p>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            External Links Disclaimer
          </h2>
          <p>
            The site may contain (or you may be sent through the site) links to
            other websites or content belonging to or originating from third
            parties or links to websites and features in banners or other
            advertising. Such external links are not investigated, monitored, or
            checked for accuracy, adequacy, validity, reliability, availability,
            or completeness by us.
          </p>
          <p className='mt-4'>
            We do not warrant, endorse, guarantee, or assume responsibility for
            the accuracy or reliability of any information offered by
            third-party websites linked through the site or any website or
            feature linked in any banner or other advertising. We will not be a
            party to or in any way be responsible for monitoring any transaction
            between you and third-party providers of products or services.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Professional Disclaimer
          </h2>
          <p>
            The site cannot and does not contain professional advice. The
            information is provided for general informational and educational
            purposes only and is not a substitute for professional advice.
            Accordingly, before taking any actions based upon such information,
            we encourage you to consult with the appropriate professionals. We
            do not provide any kind of professional advice.
          </p>
          <p className='mt-4'>
            The use or reliance of any information contained on this site is
            solely at your own risk.
          </p>
        </section>

        <section className='text-center'>
          <h2 className='text-xl md:text-2xl lg:text-3xl font-semibold mb-6'>
            Contact Us
          </h2>
          <p>
            If you have any questions or concerns regarding this disclaimer,
            please feel free to contact us through the{' '}
            <a href='/contact' className='text-primary font-semibold underline'>
              Contact Us
            </a>{' '}
            page.
          </p>
        </section>
      </div>
    </section>
  )
}

export default DisclaimerPage
