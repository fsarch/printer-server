import { FsArchAppBuilder } from '@fsarch/server';
import { AppModule } from './app.module.js';
import { Role } from './constants/role.enum.js';
import { DATABASE_OPTIONS } from './database/index.js';

async function bootstrap() {
  const app = await new FsArchAppBuilder(AppModule, {
    name: 'Printer-Server',
    version: '1.0.0',
  })
    .addSwagger({
      title: 'Printer-Server',
      description: 'The Printer-Server API description',
      version: '1.0',
      path: 'docs',
    })
    .enableAuth()
    .enableUac(Object.values(Role))
    .setDatabase(DATABASE_OPTIONS)
    .build();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
