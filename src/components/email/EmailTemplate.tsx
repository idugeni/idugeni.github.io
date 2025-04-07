import React from 'react';

interface EmailTemplateProps {
  name: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ name, email, message }) => {
  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesan Kontak Baru</title>
        <style>
          /* Reset CSS */
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f8fafc;
          }

          /* Container */
          .email-container {
            max-width: 600px;
            margin: 24px auto;
            padding: 32px;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          /* Header */
          .header {
            text-align: center;
            padding: 24px 0 32px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 32px;
          }

          .logo {
            width: 120px;
            height: auto;
            margin-bottom: 16px;
          }

          /* Content */
          .content {
            padding: 0 16px;
          }

          .field {
            margin-bottom: 24px;
          }

          .field-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .field-value {
            color: #1f2937;
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: 16px;
            line-height: 1.8;
          }

          .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          /* Footer */
          .footer {
            text-align: center;
            padding-top: 32px;
            margin-top: 32px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
          }

          .social-links {
            margin-top: 16px;
            padding: 0;
            list-style: none;
            display: flex;
            justify-content: center;
            gap: 16px;
          }

          .social-link {
            color: #64748b;
            text-decoration: none;
          }

          .social-link:hover {
            color: #2563eb;
          }

          /* Responsive Design */
          @media screen and (max-width: 600px) {
            .email-container {
              margin: 0;
              padding: 24px;
              border-radius: 0;
            }

            .content {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <img src="https://raw.githubusercontent.com/idugeni/idugeni.github.io/main/public/favicon.png" alt="Logo" class="logo">
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Nama</div>
              <div class="field-value">${name}</div>
            </div>
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${email}</div>
            </div>
            <div class="field">
              <div class="field-label">Pesan</div>
              <div class="field-value message-content">${message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis melalui formulir kontak website.</p>
            <div class="social-links">
              <a href="https://github.com/idugeni" class="social-link" target="_blank">GitHub</a>
              <a href="https://instagram.com/eliyantosarage_/" class="social-link" target="_blank">Instagram</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};