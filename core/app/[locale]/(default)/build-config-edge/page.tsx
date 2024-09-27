import { buildConfig } from '~/build-config/reader';

export default function Page() {
  return (
    <div>
      <h1>Edge Page</h1>

      <pre>{JSON.stringify(buildConfig.get('locales'), null, 2)}</pre>
    </div>
  );
}

export const runtime = 'edge';
