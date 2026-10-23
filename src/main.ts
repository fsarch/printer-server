import { FsArchAppBuilder } from '@fsarch/server';
import { AppModule } from './app.module.js';
import { descriptor } from './lib/index.js';

async function bootstrap() {
  const app = await new FsArchAppBuilder(AppModule, {
    name: 'Printer-Server',
    version: '1.0.0',
  })
    .addSwagger({ ...descriptor.swagger, path: 'docs' })
    .enableAuth()
    .enableUac(descriptor.uac.roles)
    .setDatabase({
      entities: descriptor.entities,
      migrations: descriptor.migrations,
    })
    .build();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
