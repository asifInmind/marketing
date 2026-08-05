# AdManager Platform Architecture & Flow Guide

This document provides a comprehensive, end-to-end documentation of the AdManager Next.js application, explaining its complete layout, authentication mechanisms, data synchronization, and matching flows.

---

## 1. High-Level Architecture Overview

AdManager is a Next.js (App Router) SaaS application built to aggregate Meta Ads statistics and correlate them with live Shopify store inventory and orders. The app is completely **serverless and database-free**—all merchant credentials and session configurations are persisted directly in the client's browser using `localStorage`.

```
                        ┌─────────────────────────────────┐
                        │      Merchant Web Browser       │
                        └──────┬───────────────────▲──────┘
                               │                   │
                     Facebook  │                   │  API Proxy
                    OAuth Flow │                   │  Requests
                               ▼                   │
                  ┌─────────────────────────────┐  │
                  │   Meta Ads / Shopify APIs   │  │
                  └────────────▲────────────────┘  │
                               │                   │
                               │ Backend           │
                               │ Outbound          │
                               ▼                   │
                    ┌──────────────────────────────┴┐
                    │    Next.js serverless API     │
                    │   (routes: /api/meta, etc.)   │
                    └───────────────────────────────┘
```

---

## 2. Phase 1: Meta Ads Connection & Authentication

AdManager offers two options to retrieve Meta credentials on the **[HomePage](file:///e:/Office%20Projects/admanager/src/app/(pages)/homePage/page.tsx)**:

### Flow A: Facebook OAuth Login (Automatic)

```mermaid
sequenceDiagram
    participant Merchant as Merchant Browser
    participant App as NextJS Server
    participant Meta as Meta Graph OAuth API
    
    Merchant->>App: Clicks "Connect with Facebook" (/api/Facebook-login)
    App->>Merchant: Redirects to Facebook Login Screen
    Merchant->>Meta: Enters credentials & approves permissions
    Meta->>App: Redirects to /api/Facebook-callback?code=CODE
    App->>Meta: Swaps CODE for User Access Token (POST /oauth/access_token)
    Meta->>App: Returns user access token
    App->>Meta: Queries User Ad Accounts (GET /me/adaccounts)
    Meta->>App: Returns list of ad accounts
    App->>Merchant: Redirects to /choice?act_id={ID}&access_token={TOKEN}
```

* **Login Endpoint**: **[Facebook-login/route.ts](file:///e:/Office%20Projects/admanager/src/app/api/Facebook-login/route.ts)**
  Constructs the Facebook authorization URI requesting the following scopes:
  * `ads_management`: To modify and read ad sets/ads.
  * `ads_read`: To retrieve analytics.
  * `business_management`: To navigate corporate Business Managers.
  * `pages_read_engagement`: To fetch linked business assets.
* **Callback Endpoint**: **[Facebook-callback/route.ts](file:///e:/Office%20Projects/admanager/src/app/api/Facebook-callback/route.ts)**
  Exchanges the temporary `code` for a long-lived User Access Token. It fetches the default account ID and redirects the merchant to the selection page: `/choice`.

### Flow B: Developer Token Input (Manual)
* For development, testing, or custom accounts, the user enters:
  1. **Ad Account ID** (e.g. `act_123456789`)
  2. **Facebook User Token** (`EAAB...`)
* Clicking "Proceed" bypasses OAuth routes and pushes directly to `/choice/{accountID}?access_token={token}`.

---

## 3. Phase 2: Ad Account Selection (`/choice`)

Once authenticated, the merchant lands on **[choice/page.tsx](file:///e:/Office%20Projects/admanager/src/app/(pages)/choice/page.tsx)**:
* The page triggers a client-side fetch to Meta's endpoint:
  `https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status&access_token={token}`.
* The merchant is presented with a listing of accounts. Choosing one redirects them to:
  `/choice/{accountID}?access_token={token}`.

---

## 4. Phase 3: Dashboard Assembly (`/choice/[accountID]`)

The folder **[choice/[accountID]/page.tsx](file:///e:/Office%20Projects/admanager/src/app/(pages)/choice/[accountID]/page.tsx)** serves as the main dashboard wrapper. It loads **[MetaDashboard.tsx](file:///e:/Office%20Projects/admanager/src/components/meta/MetaDashboard.tsx)** which initializes two data engines:

### 1. Meta Ads Analytics Engine (`useMetaDashboard.ts`)
Queries the API proxy route `/api/meta` to fetch and parse:
* **Campaigns**: Status, CTR, total budget, cost, and name.
* **Ad Sets**: Target profiles, spend, conversions.
* **Ads & Creatives**: Target URLs (`finalUrl`), copywriting headlines, and creative attachments.
* **Insights**: Attributed sales, impressions, clicks.
* Supports **progressive page loading** (limit 50 per page + cursor pagination) to optimize dashboard speed.

### 2. Shopify E-Commerce Engine (`useShopifyDashboard.ts`)
Manages store synchronization via OAuth redirects or manual Admin API keys (`shpat_...`):
* Fetches Shopify Products (50 items limit with dynamic Link-header pagination).
* Fetches the last 250 orders to attribute revenue and calculate sales quantities.
* Automatically stores credentials in `localStorage` for automatic logins on subsequent visits.

---

## 5. Phase 4: Dynamic Shopify Correlative Analysis

Once both sources (Meta + Shopify) are connected, the dashboard enables advanced features:

```mermaid
graph TD
    A[Meta Ad finalUrl / adName / SKU] --> B{Attr Engine}
    C[Shopify Product Handle / Title / SKU] --> B
    B -->|Match Found| D[Calculate Attributed Spend]
    B -->|Match Found| E[Calculate Store Orders & Sales]
    D & E --> F[Calculate True Product ROAS & MER]
    B -->|Matches Sold-Out Product| G[Wasted Spend Alert Panel]
```

### 1. Multi-Tier Product Matching
To link an active Facebook Ad to a Shopify Product listing, the matching engine runs:
* **Level 1: URL Handle Extraction**: Extracts `/products/{handle}` out of the ad's landing page URL (e.g. `finalUrl` or `url_tags`) and checks it against the Shopify Product handle.
* **Level 2: Variant SKU Match**: Searches the ad name for any Shopify Variant SKU code (e.g., `COZY-BLK-MD`).
* **Level 3: Title Match**: Checks if the ad name contains the exact product title.

### 2. Wasted Budget Alerts
If a Meta Ad's effective status is `ACTIVE` and has spend $> 0$, but the matched Shopify Product has **0 total stock** in inventory, it triggers an alert panel. The panel highlights the exact amount of budget wasted driving traffic to a sold-out item.

### 3. Dynamic Currency Localization
1. The app extracts the store currency code from the Shopify orders payload (e.g., `PKR`, `USD`, `EUR`).
2. If Shopify is connected, the app unifies the dashboard currency, formatting both Meta Spend/Revenue and Shopify Revenue values using the browser's dynamic localization formatter:
   ```typescript
   new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode })
   ```
3. If a merchant's store is in **PKR**, all dollar values are automatically converted to PKR formats (e.g., **`₨1,365.00`**).

### 4. Side-by-Side Performance Comparison (Double-Row Grid)
* **Single Row Layout (Shopify Disconnected)**: Renders a simple, single row of 6 columns displaying standard Meta Ads data.
* **Double Row Layout (Shopify Connected)**: Automatically splits into two rows of 3 columns (`grid-cols-3`), enlarging the cards to show Meta and Shopify statistics side-by-side:
  * **Spend vs. Shopify Orders**
  * **Clicks vs. Shopify Customers** (Traffic vs. Buyers)
  * **Ad Impressions** (Reach)
  * **Ad Conversions vs. Store Orders**
  * **Ad Revenue vs. Banked Cash Revenue**
  * **Meta ROAS vs. Blended ROAS (MER)** (Total Store Sales $\div$ Total Meta Spend)

---

## 6. Shopify OAuth Flow (Automatic Connection)

For merchants who want to connect Shopify automatically without generating manual tokens, the app implements a secure OAuth loop:

```mermaid
sequenceDiagram
    participant Merchant as Merchant Browser
    participant App as NextJS Server
    participant Shopify as Shopify Partner Portal
    
    Merchant->>App: Submits Store URL + Meta config (to /api/shopify/login)
    App->>Merchant: Redirects to Shopify Auth screen with scopes & state
    Merchant->>Shopify: Approves App installation
    Shopify->>App: Redirects to /api/shopify/callback?code=CODE&state=STATE
    App->>Shopify: Exchanges CODE for Permanent Store Access Token
    Shopify->>App: Returns store access token
    App->>Merchant: Redirects back to Dashboard /choice with query parameters
```

* **Login Initiator**: **[shopify/login/route.ts](file:///e:/Office%20Projects/admanager/src/app/api/shopify/login/route.ts)**
  Constructs the Shopify oauth authorize URL. It passes client id, scopes, and preserves the Facebook `access_token` and `act_id` inside the `state` parameter so the user doesn't lose their Meta session context.
* **Auth Callback**: **[shopify/callback/route.ts](file:///e:/Office%20Projects/admanager/src/app/api/shopify/callback/route.ts)**
  Exchanges the authorization code for a persistent Admin access token. Once obtained, it redirects the browser back to the Meta `/choice` configuration dashboard page.

---

## 7. Global Facebook Pixel Tracking

The application is integrated with a global tracking pixel to monitor traffic and interactions:
* **Script Location**: **[layout.tsx](file:///e:/Office%20Projects/admanager/src/app/layout.tsx#L31-L49)**
* **Details**: Loaded synchronously in the HTML body. It initiates tracking under Pixel ID `978250051055927` and fires a `PageView` event automatically.

---

## 8. Directory & File Structure

Here is a map of the important codebase files:

* **Pages & Routing (`src/app/`)**:
  * [page.tsx](file:///e:/Office%20Projects/admanager/src/app/page.tsx): Main entry point redirecting to the Home Page.
  * [homePage/page.tsx](file:///e:/Office%20Projects/admanager/src/app/(pages)/homePage/page.tsx): Landing panel where users select their Meta and Shopify login mode.
  * [choice/page.tsx](file:///e:/Office%20Projects/admanager/src/app/(pages)/choice/page.tsx): Lists Meta ad accounts retrieved from OAuth.
  * [choice/\[accountID\]/page.tsx](file:///e:/Office%20Projects/admanager/src/app/(pages)/choice/%5BaccountID%5D/page.tsx): The core dashboard routing page.
  * `api/meta/route.ts`: Backend proxy server fetching Meta campaigns, ad sets, and creatives.
  * `api/shopify/route.ts`: Backend proxy server querying Shopify REST endpoints for orders and inventory.

* **UI Components (`src/components/`)**:
  * `meta/`: Interactive tables, metrics widgets, detail drill-downs, and skeletal loaders.
  * `shopify/`: Contains the [ShopifyConnectModal.tsx](file:///e:/Office%20Projects/admanager/src/components/shopify/ShopifyConnectModal.tsx) component.

* **Business Logic & Libraries (`src/lib/`)**:
  * `api/`: Outbound handlers communicating with external Graph and Shopify APIs.
  * `hooks/`: Custom state hubs (`useMetaDashboard` and `useShopifyDashboard`) doing matches and computing Blended ROAS.

---

## 9. Data Storage (No Database Approach)

To ensure privacy, ease of setup, and zero cloud hosting costs:
* **Zero Database**: No database (e.g. Postgres, MongoDB) is used.
* **Local Storage**: Critical credentials (like the Shopify Store URL and access tokens) are saved strictly inside the visitor's local web browser via `localStorage` (keys: `shopifyStoreUrl` and `shopifyAccessToken`).
* **Session Passing**: Transient authorization contexts are passed directly through secure query strings between the login loops.

---

## 10. Local Environment Configurations

To run the project locally, create a **[.env.local](file:///e:/Office%20Projects/admanager/.env.local)** file in the root directory with the following variables:



