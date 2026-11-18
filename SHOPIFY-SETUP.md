# Connecting the shop to Shopify

The shop page already has a local cart. When connected, it creates a Shopify cart and sends the customer to Shopify's hosted checkout. The checkout handoff uses Shopify's current Storefront Cart API; the older Checkout API used by the previous setup has been shut down.

## 1. Create a Headless storefront

In Shopify admin, install/open the **Headless** sales channel, then create a storefront for Sunnyside Vines. In that storefront's API permissions, allow cart read/write access. The site needs a **public Storefront API access token** because its request runs in the customer's browser.

Copy the storefront's public token and your store's `.myshopify.com` domain. Do not use a private Storefront API token or an Admin API token in the website.

## 2. Add and publish the wines

You can create products in Shopify, or generate an import file from this site's catalog:

```sh
node tools/make-shopify-csv.js
```

Import `tools/shopify-products.csv` from Shopify admin → **Products → Import**. The import marks products as drafts, so review them, set inventory and shipping details, and publish the products to the Headless sales channel before selling them.

The prices shown on the website come from `shop-config.js`; keep them in sync with each Shopify variant's price. Shopify's checkout uses the Shopify price.

## 3. Add the Shopify variant IDs

For every wine that can be added to the website cart, get its Shopify variant ID. Open the variant in Shopify admin and use the numeric variant ID from its URL, wrapped in Storefront GID form:

```text
gid://shopify/ProductVariant/1234567890
```

In `shop-config.js`, add that value to the matching product's `shopify.variantId`. The `productId` field can stay blank; checkout uses the variant ID.

## 4. Connect the site

At the top of `shop-config.js`, fill in:

```js
const SHOPIFY = {
  domain: 'your-store.myshopify.com',
  storefrontAccessToken: 'your-public-storefront-access-token',
};
```

Save and deploy the site. If either setting is blank, the shop remains in demo mode and checkout opens an email order. If a cart contains a wine without a variant ID, checkout names the missing wine instead of silently dropping it.

## 5. Place a test order

Use Shopify's test payment setup and check that checkout has the right wines, prices, shipping, and taxes. Before accepting live orders, finish the store's inventory, shipping, tax, and applicable alcohol-sales settings in Shopify.

The site sends cart lines through Shopify's Storefront Cart API and redirects to the cart's `checkoutUrl`. Its API version is set in `shop.js` (`2026-10`).

## Tasting events

`sunnysidevines.com/tasting` (`tasting/index.html`) lists the wines poured at the latest tasting, in pour order, with "Add a case" and "Add a bottle" buttons. The QR code for it is `tools/qr/tasting-qr.svg` (vector, for print) and `tools/qr/tasting-qr.png`; the code never changes, so reuse it on every sheet.

For each new event, edit `TASTING` in `shop-config.js`: the producers, hosts and wines (in pour order), plus the discount code. Create the code in Shopify admin → Discounts first. The page remembers the code and checkout applies it automatically. Case sizes come from each wine's `caseSize` (default 6).

Every bottle counts toward a case whatever the wine, so customers can mix producers. The cart shows how many bottles are left until a full case of 6 or 12.

## Selling in person (Shopify POS)

The products already live in Shopify, so POS needs no new catalog:

1. Shopify admin → Sales channels → add **Point of Sale**; publish the wines to it.
2. Install the Shopify POS app on the phone or iPad used at events and sign in with a staff account.
3. Take cards with Tap to Pay on iPhone (no hardware) or a Shopify Tap & Chip reader.
4. Set the event location for sales tax, and check IDs at the table.
