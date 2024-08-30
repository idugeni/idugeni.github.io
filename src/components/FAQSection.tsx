import faqs from '@/data/faqs.json'

interface FAQ {
  id: string
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

const FAQSection = ({ faqs }: FAQSectionProps) => {
  if (!faqs.length) {
    return <p>No FAQs available.</p>
  }

  return (
    <section className='py-8 md:py-12 lg:py-16 bg-base-200 text-base-content border-b border-neutral'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8'>
        <h2 className='text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-center text-primary'>
          Frequently Asked Questions
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className='bg-base-100 border border-base-300 rounded-lg shadow-md'
            >
              <div className='px-4 py-3 bg-base-300 flex items-center justify-between text-left font-semibold text-md text-primary border-b border-base-300'>
                {faq.question}
              </div>
              <div className='p-4'>
                <p className='text-sm'>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Page () {
  return <FAQSection faqs={faqs as FAQ[]} />
}
