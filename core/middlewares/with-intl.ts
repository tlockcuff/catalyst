import createMiddleware from 'next-intl/middleware';

import { buildConfig } from '~/build-config/reader';
import { routing } from '~/i18n/routing';

import { type MiddlewareFactory } from './compose-middlewares';

const intlMiddleware = createMiddleware(routing);

export const withIntl: MiddlewareFactory = (next) => {
  return async (request, event) => {
    const intlResponse = intlMiddleware(request);

    // If intlMiddleware redirects, or returns a non-200 return it immediately
    if (!intlResponse.ok) {
      return intlResponse;
    }

    // Extract locale from intlMiddleware response
    const locale = intlResponse.headers.get('x-middleware-request-x-next-intl-locale') ?? '';

    request.headers.set('x-bc-locale', locale);

    // Continue the middleware chain
    const response = await next(request, event);

    // Copy headers from intlResponse to response, excluding 'x-middleware-rewrite'
    intlResponse.headers.forEach((v, k) => {
      if (k !== 'x-middleware-rewrite') {
        response?.headers.set(k, v);
      }
    });

    const locales = buildConfig.get('locales');
    const first = locales[0];

    response?.headers.set('x-bc-test-config', JSON.stringify(first));

    return response;
  };
};
