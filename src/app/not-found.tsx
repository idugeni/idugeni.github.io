export const metadata = {
  title: '404 Not Found',
  description: 'The requested page could not be found.',
}

export default function NotFound () {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-8'>
      <div className='flex flex-col md:flex-row items-center justify-center w-full max-w-4xl'>
        <div className='text-6xl md:text-9xl font-bold tracking-tight mb-4 md:mb-0'>
          404
        </div>
        <div className='border-l border-gray-600 mx-0 md:mx-4 h-16 md:h-40 md:block hidden'></div>
        <div className='flex flex-col text-center md:text-left'>
          <div className='text-xl md:text-lg font-semibold mb-2'>
            Page Not Found
          </div>
          <div className='text-base md:text-lg'>
            The page you're looking for doesn't exist.
          </div>
        </div>
      </div>
    </div>
  )
}
