export const dynamic = 'force-static'

import { ImageResponse } from 'next/og'

export const GET = async () => {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: '40px',
          color: '#333',
          background: 'linear-gradient(to bottom, #ffffff, #f3f4f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box',
          padding: '40px',
          fontFamily: `'Roboto', sans-serif`,
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 75 65'
          fill='none'
          height='80'
          style={{ marginBottom: '30px' }}
        >
          <path d='M37.59.25l36.95 64H.64l36.95-64z' fill='#333' />
        </svg>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}
        >
          IduGeni SabdoDadi
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#6B7280',
            lineHeight: '1.5',
            maxWidth: '80%',
            margin: '0 auto',
          }}
        >
          Showcasing innovation and excellence in personal and professional
          projects.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
