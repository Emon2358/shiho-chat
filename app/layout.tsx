// app/layout.tsx
import './global.css';

export const metadata = {
  title: 'しほチャット',
  description: 'GroqAI と会話できるチャットアプリ「しほ」'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
