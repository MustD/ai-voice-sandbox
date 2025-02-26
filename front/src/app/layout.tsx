import type {Metadata} from "next";
import {CssBaseline} from "@mui/material";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v15-appRouter";
import {Roboto} from 'next/font/google';
import {ThemeProvider} from '@mui/material/styles';
import theme from "@/app/theme";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Voice playground",
  description: "Voice recognition playground",
};

export default function RootLayout({children,}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
    <body className={roboto.variable}>
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
    </body>
    </html>
  );
}
