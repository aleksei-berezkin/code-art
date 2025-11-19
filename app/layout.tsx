import '../typique-output.css'

export default function Layout({ children }: { children: React.ReactNode }) {
    return <html lang='en'>
    <head>
        <title>Code Art</title>
        <meta name='description' content='Abstract code artworks for your creations'/>

        <meta property='og:title' content='Code Art'/>
        <meta property='og:description' content='Abstract artworks for your creations'/>
        <meta property='og:url' content='https://code-art.pictures'/>
        <meta property='og:image' content='https://code-art.pictures/og-image.png'/>
        <meta property='og:image:type' content='image/png' />

        <link rel='icon' type='image/png' href='favicon.png'/>

        <link rel='preconnect' href='https://fonts.googleapis.com'/>
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous'/>
        <link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Roboto&family=Ubuntu:wght@300&family=Anonymous+Pro&family=B612+Mono&family=Courier+Prime&family=Cutive+Mono&family=Inconsolata&family=JetBrains+Mono&family=Noto+Sans+Mono&family=Nova+Mono&family=Share+Tech+Mono&family=Syne+Mono&family=Ubuntu+Mono&family=Fira+Code&display=swap'/>

        <script
            src='https://cdn.telemetrydeck.com/websdk/telemetrydeck.min.js'
            data-app-id='F5A4280F-0C3E-4FED-8322-C35B7ADDA5EF'
            defer
        ></script>
    </head>
    <body>
        {
            children
        }
    </body>
    </html>
}
