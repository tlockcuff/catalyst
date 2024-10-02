import type { AnalyticsConfig, Analytics as AnalyticsImpl } from './types';

export class Analytics implements AnalyticsImpl {
  static #instance: Analytics | null = null;

  readonly cart = this.bindCartEvents();
  readonly navigation = this.bindNavigationEvents();

  constructor(private readonly config: AnalyticsConfig) {
    if (!Analytics.#instance) {
      Analytics.#instance = this;
    }

    return Analytics.#instance;
  }

  initialize() {
    this.config.providers.forEach((provider) => {
      provider.initialize();
    });
  }

  private bindCartEvents() {
    return {
      cartViewed: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.cart.cartViewed(payload);
        });
      },
      productAdded: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.cart.productAdded(payload);
        });
      },
      productRemoved: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.cart.productRemoved(payload);
        });
      },
    } satisfies Analytics.Cart.Events;
  }

  private bindNavigationEvents() {
    return {
      categoryViewed: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.navigation.categoryViewed(payload);
        });
      },
      productViewed: (payload) => {
        this.config.providers.forEach((provider) => {
          provider.navigation.productViewed(payload);
        });
      },
    } satisfies Analytics.Navigation.Events;
  }
}
