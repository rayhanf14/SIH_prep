import { createServer } from 'node:http';
import { createPlatformApp } from './app.mjs';

const port = Number(process.env.PORT ?? 3000);
createServer(createPlatformApp()).listen(port, () => console.log(`KMRL platform integration service listening on http://localhost:${port}`));
