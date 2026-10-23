import { Module } from '@nestjs/common';
import { descriptor } from './lib/index.js';

/**
 * Standalone root module only: the service itself lives in
 * `descriptor.module` (see `src/lib`).
 */
@Module({
  imports: [descriptor.module.register()],
})
export class AppModule {}
