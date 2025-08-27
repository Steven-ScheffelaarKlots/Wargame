import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scoreboard | Warhammer Hub',
  description: 'Track your Warhammer 40k 10th Edition battles with this scoreboard tool',
};

export default function ScoreboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-5xl mx-auto">
      {children}
    </div>
  );
}
