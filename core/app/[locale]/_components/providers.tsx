'use client';

import { PropsWithChildren } from 'react';

import { FragmentOf } from '~/client/graphql';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';
import { Analytics } from '~/lib/analytics';
import { Bodl } from '~/lib/analytics/providers/bodl';
import { AnalyticsProvider } from '~/lib/analytics/react';

import { AccountStatusProvider } from '../(default)/account/(tabs)/_components/account-status-provider';

import { WebAnalyticsFragment } from './fragment';

interface Props {
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null;
  channelId?: number;
}

const getAnalytics = (
  settings?: FragmentOf<typeof WebAnalyticsFragment> | null,
  channelId?: number,
) => {
  if (settings?.webAnalytics?.ga4?.tagId && channelId) {
    const bodl = new Bodl({
      channelId: Number(channelId),
      googleAnalytics: {
        id: settings.webAnalytics.ga4.tagId,
      },
    });

    return new Analytics({
      providers: [bodl],
    });
  }

  return null;
};

export function Providers({ children, settings, channelId }: PropsWithChildren<Props>) {
  const analytics = getAnalytics(settings, channelId);

  return (
    <AnalyticsProvider analytics={analytics ?? null}>
      <AccountStatusProvider>
        <CompareDrawerProvider>{children}</CompareDrawerProvider>
      </AccountStatusProvider>
    </AnalyticsProvider>
  );
}
