# Connecting the Shop to Shopify

The shop page (`shop.html`) is fully built and works right now in **demo mode**:
you can browse wines, add to cart, and open the cart drawer. The only thing that
isn't live yet is real payment — because there's no Shopify store connected.

When you're ready to take real orders, follow these steps. You only ever edit
**one file**: `shop-config.js`.

---

## 1. Create a Shopify store

1. Go to <https://www.shopify.com> and start a store (any plan that includes the
   **Storefront API** — all paid plans do; the Starter/"Buy Button" plan also works).
2. Set your store currency to **USD** (or whatever you price in).

## 2. Add each wine as a product

In Shopify admin → **Products → Add product**, create one product per wine. Use
the same names as in `shop-config.js` so they're easy to match:

| Producer         | Products |
|------------------|----------|
| Bodega Peñafalcón | Gran Reserva 2007 · 14 Años 2003 · Tinto de Autor 2004 · 10 Meses en Barrica 2021 |
| Los Ángeles       | Romeroso 2021 · Cruz Alta 2025 · Las Suertes (Blanco) |
| Convento Oreja    | Selección de Familia 2020 · Crianza 2022 · Roble 2025 |

For each product, set the **price** and upload an image (you can reuse the images
in `img/shop/`). Set inventory / shipping as you like.

## 3. Turn on the Storefront API and get a token

1. Shopify admin → **Settings → Apps and sales channels → Develop apps**.
2. **Create an app** (e.g. "Sunnyside Website"), open it, go to
   **Configuration → Storefront API** and enable it with these scopes:
   `unauthenticated_read_product_listings`, `unauthenticated_write_checkouts`,
   `unauthenticated_read_checkouts`.
3. **Install** the app, then under **API credentials** copy the
   **Storefront API access token**.

## 4. Get each product's variant ID

Every product has at least one **variant**. The shop needs the variant ID in
Storefront (GID) form, which looks like:

```
gid://shopify/ProductVariant/1234567890
```

Easiest way to find it: open the product in admin, click the variant, and read the
number at the end of the URL
(`.../variants/1234567890`) — then wrap it as
`gid://shopify/ProductVariant/1234567890`.

(You can leave `productId` blank; only `variantId` is required for checkout.)

## 5. Fill in `shop-config.js`

At the top of the file:

```js
const SHOPIFY = {
  domain: 'your-store.myshopify.com',
  storefrontAccessToken: 'your-storefront-access-token',
};
```

Then, for each wine in the `PRODUCTS` array, paste its variant ID:

```js
shopify: { productId: '', variantId: 'gid://shopify/ProductVariant/1234567890' },
```

That's it. As soon as `domain` and `storefrontAccessToken` are set, demo mode
turns off automatically and the **Checkout** button sends customers to Shopify's
secure, hosted checkout with their cart pre-filled.

---

## Notes

- **Prices** shown on the cards come from the `price` field in `shop-config.js`
  (currently demo placeholders). Update them to match Shopify so the site and
  checkout agree. The card price is display-only; Shopify charges its own price.
- **Nothing else needs to change** — no code edits, no rebuild. The site is a
  static set of files; just re-upload `shop-config.js`.
- To test before going live, use Shopify's **test mode** (Bogus Gateway) under
  Settings → Payments.
