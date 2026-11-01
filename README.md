# Sabyakashi

Traditional Banarasi saree catalogue with product management and website settings.

## Repository status

This is the application source, not a GitHub Pages deployment. The existing live website is https://sabyakashi.heroicdill.chatgpt.site .

## Runtime

React, Vinext/Vite, Cloudflare Workers, D1 database and R2 image storage. Server routes handle product publishing, uploads and website settings. GitHub Pages alone cannot run these features.

Use Node.js 22.13 or later and the pnpm version in package.json. Install with `pnpm install`; use `pnpm dev` or `pnpm build` after configuring the runtime.

## Hosting configuration

The original Sites project identifier and private owner email have been removed. The owner email is deliberately set to owner@example.invalid; configure your intended owner and verify authentication before enabling admin access. ChatGPT identity and Sites integrations require their supported hosting runtime; do not treat a copied frontend login as authorization. The checked-in hosting configuration contains binding names only.

For a separate deployment, configure and test authentication, D1 migrations, R2 uploads and runtime bindings. No credentials, live database contents, uploaded customer data or generated builds are included.

## Catalogue launch

Checkout is not connected. Replace sample products and reference imagery with your own or properly licensed materials before a commercial launch. The WhatsApp contact number can be configured later.
