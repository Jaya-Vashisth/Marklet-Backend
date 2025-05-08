import app from '../app.js';
import { createServer } from 'http';

export default (req: any, res: any) => {
  const server = createServer((req, res) => app(req, res));
  server.listen();
};