import { getBuildConfigValue } from '~/build-config/reader';

const config = await getBuildConfigValue('locales');

export default function Page() {
  return (
    <div>
      <h1>Page</h1>

      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}
