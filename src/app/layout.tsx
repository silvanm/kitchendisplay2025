import type { Metadata } from "next";
import { Montserrat, Manrope } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: "Kitchen Display",
  description: "A real-time dashboard for the kitchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${montserrat.variable} ${manrope.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
