export interface AnalyticsProvider {
  cart: Analytics.Cart.Events;
  navigation: Analytics.Navigation.Events;
  initialize: () => void;
}

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
}

export interface Analytics {
  readonly cart: Analytics.Cart.Events;
  readonly navigation: Analytics.Navigation.Events;

  initialize(): void;
}
