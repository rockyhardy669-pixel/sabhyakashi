# Sabhyakashi

Traditional Banarasi sarees. Local storefront first, Shopify theme later.

## Preview on this laptop

```bash
cd ~/sabhyakashi
python3 -m http.server 8000
```

Open http://localhost:8000

## Pages

- `index.html` — home
- `catalog.html` — saree grid and weave filters
- `product.html` — one saree
- `about.html` — the weave
- `contact.html` — WhatsApp form

Product names, prices, and photos live in `products.js`. Change the WhatsApp number there before launch.

## Merchant login

- URL: http://localhost:8000/login.html
- Username: `merchant`
- Password: `KashiLoom#1`

The admin console can add, hide, and price sarees. Change the password from the console after first login. This is a local preview login. Shopify admin replaces it when the shop goes live.

## Shopify next

These HTML pages become a Shopify theme: the same CSS, Liquid tags for product title and price, and checkout from Shopify admin. The bag on this preview is local only.
