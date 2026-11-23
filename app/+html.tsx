import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <title>Circle</title>
        <meta
          name="description"
          content="Need a lawyer, stylist, or founder? Ask your circle. Warm intros through people you already trust."
        />
        {/* Inline SVG so the tab icon cannot stick on the old Expo chevron after deploy */}
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23050508'/%3E%3Ccircle cx='16' cy='16' r='12' fill='none' stroke='%23E8E0D4' stroke-opacity='0.28' stroke-width='1'/%3E%3Ccircle cx='16' cy='16' r='8.5' fill='none' stroke='%23E8E0D4' stroke-opacity='0.45' stroke-width='1'/%3E%3Ccircle cx='16' cy='16' r='5.2' fill='none' stroke='%23E8E0D4' stroke-opacity='0.75' stroke-width='1.2' stroke-dasharray='12 7'/%3E%3Ccircle cx='16' cy='16' r='2.6' fill='%23E8E0D4'/%3E%3Ccircle cx='24.5' cy='9.5' r='1.3' fill='%23E8E0D4' fill-opacity='0.9'/%3E%3C/svg%3E"
        />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; margin: 0; background: #050508; }
              body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; }
              * { box-sizing: border-box; }
              ::-webkit-scrollbar { width: 10px; height: 10px; }
              ::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 8px; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
