import type BodlEvents from '@bigcommerce/bodl-events';
import { v4 as uuidV4 } from 'uuid';

import type { AnalyticsProvider } from '../../types';

declare global {
  interface Window {
    bodlEvents?: typeof BodlEvents;
    dataLayer?: unknown[];
  }
}

interface BodlGoogleAnalyticsConfig {
  id: string;
  consentModeEnabled?: boolean;
  developerId?: string;
}

interface BodlConfig {
  channelId: number;
  googleAnalytics: BodlGoogleAnalyticsConfig;
}

export class Bodl implements AnalyticsProvider {
  static #instance: Bodl | null = null;

  readonly cart = this.getCartEvents();
  readonly navigation = this.getNavigationEvents();

  private readonly bodlScriptId = 'bodl-events-script';
  private readonly dataLayerScriptId = 'data-layer-script';
  private readonly gtagScriptId = 'gtag-script';

  constructor(private readonly config: BodlConfig) {
    this.validateConfig();

    if (Bodl.#instance) {
      return Bodl.#instance;
    }

    Bodl.#instance = this;
  }

  static waitForBodlEvents(callback: () => void, iteration = 0) {
    if (window.bodlEvents) {
      callback();

      return;
    }

    if (iteration >= 10) {
      return;
    }

    setTimeout(() => {
      this.waitForBodlEvents(callback, iteration + 1);
    }, 1000);
  }

  initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Bodl is only available in the browser environment');
    }

    this.initializeBodlEvents();
    this.initializeDataLayer();
    this.initializeGTM();

    this.bindEvents();
  }

  private validateConfig() {
    if (!this.config.channelId) {
      throw new Error('Bodl requires a channel ID');
    }

    if (!this.config.googleAnalytics.id) {
      throw new Error('Bodl requires a Google Analytics ID');
    }
  }

  private initializeBodlEvents() {
    const existingScript = document.getElementById(this.bodlScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.bodlScriptId;
    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';

    document.body.appendChild(script);
  }

  private initializeDataLayer() {
    const existingScript = document.getElementById(this.dataLayerScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.dataLayerScriptId;
    script.type = 'text/javascript';
    script.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }

      gtag('js', new Date());
      gtag('set', 'developer_id.${this.config.googleAnalytics.developerId}', true);
      gtag('config', '${this.config.googleAnalytics.id}');
    `;

    document.body.appendChild(script);
  }

  private initializeGTM() {
    const existingScript = document.getElementById(this.gtagScriptId);

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.gtagScriptId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.id}`;
    script.async = true;

    document.head.appendChild(script);
  }

  private bindEvents() {
    this.bindNavigationEvents();
    this.bindCartEvents();
  }

  private getCartEvents() {
    return {
      cartViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_viewed', {
            event_id: uuidV4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      productAdded: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_product_added', {
            event_id: uuidV4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      productRemoved: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.cart.emit('bodl_v1_cart_product_removed', {
            event_id: uuidV4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
    } satisfies Analytics.Cart.Events;
  }

  private bindCartEvents() {
    Bodl.waitForBodlEvents(() => {
      window.bodlEvents?.cart.viewed((payload) => {
        gtag('event', 'view_cart', payload);
      });

      window.bodlEvents?.cart.addItem((payload) => {
        gtag('event', 'add_to_cart', payload);
      });

      window.bodlEvents?.cart.removeItem((payload) => {
        gtag('event', 'remove_from_cart', payload);
      });
    });
  }

  private getNavigationEvents() {
    return {
      categoryViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.product.emit('bodl_v1_product_category_viewed', {
            event_id: uuidV4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
      productViewed: (payload) => {
        Bodl.waitForBodlEvents(() => {
          window.bodlEvents?.product.emit('bodl_v1_product_page_viewed', {
            event_id: uuidV4(),
            channel_id: this.config.channelId,
            ...payload,
          });
        });
      },
    } satisfies Analytics.Navigation.Events;
  }

  private bindNavigationEvents() {
    Bodl.waitForBodlEvents(() => {
      window.bodlEvents?.product.pageViewed((payload) => {
        gtag('event', 'view_item', payload);
      });

      window.bodlEvents?.product.categoryViewed((payload) => {
        gtag('event', 'view_item_list', payload);
      });
    });
  }
}
