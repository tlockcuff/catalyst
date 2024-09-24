/* eslint-disable no-console */
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import { buildConfigSchema } from './schema';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(dirname, 'build-config.json');

// This fn is only intended to be used in the build process (next.config.ts)
export async function writeBuildConfig(data: unknown) {
  try {
    // Validate the data against the schema
    buildConfigSchema.parse(data);

    // Write the validated data to the file
    await writeFile(CONFIG_FILE, JSON.stringify(data), 'utf8');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Data validation failed:', error.errors);
    } else {
      console.error('Error writing build-config.json:', error);
    }

    throw error;
  }
}
