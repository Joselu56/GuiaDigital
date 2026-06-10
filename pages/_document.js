// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Google Fonts */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Source+Sans+3:wght@400;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* Tabler Icons */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}