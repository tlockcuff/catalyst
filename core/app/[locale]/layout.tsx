import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { cache, PropsWithChildren } from 'react';

import '../globals.css';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

import { getChannelIdFromLocale } from '../../channels.config';
import { Notifications } from '../notifications';

import { WebAnalyticsFragment } from './_components/fragment';
import { Providers } from './_components/providers';
import { VercelComponents } from './_components/vercel';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const RootLayoutMetadataQuery = graphql(
  `
    query RootLayoutMetadataQuery {
      site {
        settings {
          storeName
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
          ...WebAnalyticsFragment
        }
      }
    }
  `,
  [WebAnalyticsFragment],
);

const getRootLayoutData = cache(async () => {
  return await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });
});

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getRootLayoutData();

  const storeName = data.site.settings?.storeName ?? '';

  const { pageTitle, metaDescription, metaKeywords } = data.site.settings?.seo || {};

  return {
    title: {
      template: `%s - ${storeName}`,
      default: pageTitle || storeName,
    },
    icons: {
      icon: '/favicon.ico', // app/favicon.ico/route.ts
    },
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
    },
  };
}

interface Props extends PropsWithChildren {
  params: { locale: string };
}

export default async function RootLayout({ children, params: { locale } }: Props) {
  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-unstable_setrequestlocale-to-all-layouts-and-pages
  unstable_setRequestLocale(locale);

  const { data } = await getRootLayoutData();
  const messages = await getMessages();

  const channelId = getChannelIdFromLocale(locale);

  return (
    <html className={`${inter.variable} font-sans`} lang={locale}>
      <body className="flex h-screen min-w-[375px] flex-col">
        <Notifications />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers channelId={Number(channelId)} settings={data.site.settings}>
            {children}
          </Providers>
        </NextIntlClientProvider>
        <VercelComponents />
      </body>
    </html>
  );
}

export const fetchCache = 'default-cache';
