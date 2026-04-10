
import cookieSession from 'cookie-session';
import express from 'express';
import { createServer } from 'http';
import "dotenv/config";


const app = express()

app.get('/health', (req, res) => res.send('OK'));

const httpServer = createServer(app)
const PORT = process.env.PORT || 4000
const envWhitelist = process.env.WHITELIST_CORS ? (process.env.WHITELIST_CORS as string).split(',') : [];
const whitelist = [
  'http://localhost:8080'
].concat(envWhitelist);
console.log('Whitelist - cors (to handle included cookies with cors)', whitelist);

app.use(
  cookieSession({
    name: 'auth:sess',
    // keys: [process.env.COOKIE_SECRET || 'defaultSecret'], // Use a secure key for signing cookies
    // maxAge: 24 * 60 * 60 * 1000, // 1 day
    signed: false,
    secure: false, // process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
    path: '/',
  })
);


function start() {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`)
  });

  httpServer.on('error', (e: any) => {
    console.log('ERROR', e);
  })
  console.log('HTTP server running.');
  console.log('Ctrl-C to stop.')

  function graceFully() {
    httpServer.close(async () => {
      console.log('Closing Http Server');
    });

  };

  process.on('SIGINT', graceFully);
  process.on('SIGTERM', graceFully);

}

start();
