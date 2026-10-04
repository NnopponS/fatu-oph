# Local API routing

`npm run dev` and `npm run preview` serve the frontend through Vite. Vite does not execute the Web Request/Response handlers in `api/`.

Both now proxy `/api/*` to the existing event backend, `https://fatu-oph-2026.vercel.app`. The frontend uses the same Firebase event project, so participant sign-in, profile lookup and authorized operations use the real backend. Normal permission checks still apply. Preview actions can affect event data just as they do on the deployed site.

Set server-only `API_PROXY_TARGET` in the shell or `.env.local` to use another backend. It is read by Vite config and is never bundled into the frontend. There is no requirement to copy Firebase Admin private keys into Vite browser variables.

`npm run test:api-routing` starts isolated HTTP and Vite servers. It checks dev and preview POST routing, JSON responses, query strings, request bodies and authorization forwarding, and keeps SPA page routes working. It never changes event accounts. Before the fix the first assertion reproduced the reported 404; with the proxy both servers return the upstream JSON response.

Production continues to run the existing Vercel API handlers; the Vite proxy is for local servers only.
