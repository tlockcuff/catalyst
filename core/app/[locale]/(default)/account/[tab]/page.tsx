import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { getCustomerAddresses } from '~/client/queries/get-customer-addresses';

import { AddressesContent } from './_components/addresses-content';
import { SettingsContent } from './_components/settings-content';
import { TabHeading } from './_components/tab-heading';
import { TabType } from './layout';
import { getCustomerSettingsQuery } from './page-data';

interface Props {
  params: {
    tab: TabType;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  };
}

export async function generateMetadata({ params: { tab } }: Props): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return {
    title: t(tab === 'recently-viewed' ? 'recentlyViewed' : tab),
  };
}

export default async function AccountTabPage({ params: { tab }, searchParams }: Props) {
  switch (tab) {
    case 'orders':
      return <TabHeading heading={tab} />;

    case 'messages':
      return <TabHeading heading={tab} />;

    case 'addresses': {
      const { before, after } = searchParams;
      const customerAddressesDetails = await getCustomerAddresses({
        ...(after && { after }),
        ...(before && { before }),
        limit: 2,
      });

      if (!customerAddressesDetails) {
        notFound();
      }

      const { addresses, pageInfo } = customerAddressesDetails;

      return <AddressesContent addresses={addresses} pageInfo={pageInfo} />;
    }

    case 'wishlists':
      return <TabHeading heading={tab} />;

    case 'recently-viewed':
      return <TabHeading heading={tab} />;

    case 'settings': {
      const customerSettings = await getCustomerSettingsQuery({
        address: { filters: { entityIds: [4, 5, 6, 7] } },
      });

      if (!customerSettings) {
        notFound();
      }

      return <SettingsContent action={searchParams.action} customerSettings={customerSettings} />;
    }

    default:
      return notFound();
  }
}

export const runtime = 'edge';
