import { ScrollViewStyleReset } from 'expo-router/html';

/** Cyan network mark — inline so the tab icon cannot stick on a cached Expo/default favicon. */
const FAVICON_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23020617'/%3E%3Ccircle cx='16' cy='16' r='11.5' fill='none' stroke='%2322D3EE' stroke-opacity='0.35' stroke-width='1'/%3E%3Ccircle cx='16' cy='16' r='8' fill='none' stroke='%2367E8F9' stroke-opacity='0.55' stroke-width='1'/%3E%3Ccircle cx='16' cy='16' r='5' fill='none' stroke='%23A5F3FC' stroke-opacity='0.4' stroke-width='0.8' stroke-dasharray='2 2'/%3E%3Ccircle cx='16' cy='16' r='2.4' fill='%23ECFEFF'/%3E%3Ccircle cx='16' cy='4.8' r='1.15' fill='%2322D3EE'/%3E%3Ccircle cx='27.2' cy='16' r='1.15' fill='%2322D3EE'/%3E%3Ccircle cx='16' cy='27.2' r='1.15' fill='%2322D3EE'/%3E%3Ccircle cx='4.8' cy='16' r='1.15' fill='%2322D3EE'/%3E%3Ccircle cx='24' cy='8' r='0.9' fill='%2367E8F9'/%3E%3Ccircle cx='24' cy='24' r='0.9' fill='%2367E8F9'/%3E%3Ccircle cx='8' cy='24' r='0.9' fill='%2367E8F9'/%3E%3Ccircle cx='8' cy='8' r='0.9' fill='%2367E8F9'/%3E%3C/svg%3E";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#020617" />
        <title>Circle</title>
        <meta
          name="description"
          content="Ask someone you trust. Meet someone you need. Warm intros through your real circle."
        />
        <link rel="icon" href={FAVICON_SVG} type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico?v=circle3" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=circle3" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; margin: 0; background: #020617; }
              body {
                font-family: "Avenir Next", "Segoe UI", ui-sans-serif, system-ui, -apple-system, sans-serif;
                -webkit-font-smoothing: antialiased;
              }
              * { box-sizing: border-box; }
              ::-webkit-scrollbar { width: 8px; height: 8px; }
              ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 8px; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
