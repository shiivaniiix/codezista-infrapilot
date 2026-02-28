import "./globals.css";

export const metadata = {
  title: "InfraPilot",
  description: "Cloud Infrastructure Dashboard by Codezista",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
