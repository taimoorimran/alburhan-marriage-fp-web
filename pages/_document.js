import Document, { Html, Head, Main, NextScript } from 'next/document'

class MainDocument extends Document {
  render() {
    return (
      <html>
        <Head>
            <meta charSet='utf-8' key="charSet" />
            <meta name='viewport' content='initial-scale=1.0, width=device-width' key="viewport" />
            <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png" />
            <link rel="mask-icon" href="/assets/img/safari-pinned-tab.svg" color="#F69295" />
            <link rel="shortcut icon" href="/assets/img/favicon.ico" />
            <link href="/assets/fontawesome/css/all.css" rel="stylesheet" />
            <script src="/assets/js/jquery-3.2.1.slim.min.js"></script>       
        </Head>
        <body>

          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}

export default MainDocument