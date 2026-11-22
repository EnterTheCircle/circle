import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>MyCircle</title>
        <meta
          name="description"
          content="Need a lawyer, stylist, or founder? Ask your circle. Warm intros through people you already trust."
        />
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
