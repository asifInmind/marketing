import type { TransformedAd } from './meta.types';

export interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string | null;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyProductImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string | null;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  status: 'active' | 'archived' | 'draft';
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }[];
  images: ShopifyProductImage[];
  image: ShopifyProductImage | null;
}

export interface ShopifyOrderLineItem {
  id: number;
  admin_graphql_api_id: string;
  attributed_staffs: any[];
  current_quantity: number;
  fulfillable_quantity: number;
  fulfillment_service: string;
  fulfillment_status: string | null;
  gift_card: boolean;
  grams: number;
  name: string;
  price: string;
  price_set: any;
  product_exists: boolean;
  product_id: number | null;
  properties: any[];
  quantity: number;
  requires_shipping: boolean;
  sku: string | null;
  taxable: boolean;
  title: string;
  total_discount: string;
  total_discount_set: any;
  variant_id: number | null;
  variant_inventory_management: string | null;
  variant_title: string | null;
  vendor: string | null;
}

export interface ShopifyOrder {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string | null;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string | null;
  checkout_id: number | null;
  checkout_token: string | null;
  client_details: any;
  closed_at: string | null;
  company: any;
  confirmed: boolean;
  contact_email: string | null;
  created_at: string;
  currency: string;
  current_subtotal_price: string;
  current_subtotal_price_set: any;
  current_total_additional_fees_set: any;
  current_total_discounts: string;
  current_total_discounts_set: any;
  current_total_duties_set: any;
  current_total_price: string;
  current_total_price_set: any;
  current_total_tax: string;
  current_total_tax_set: any;
  customer_locale: string | null;
  device_id: number | null;
  discount_codes: any[];
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string | null;
  landing_site: string | null;
  landing_site_ref: string | null;
  location_id: number | null;
  merchant_of_record_app_id: number | null;
  name: string;
  note: string | null;
  note_attributes: any[];
  number: number;
  order_number: number;
  order_status_url: string;
  original_total_additional_fees_set: any;
  original_total_duties_set: any;
  payment_gateway_names: string[];
  phone: string | null;
  po_number: string | null;
  presentment_currency: string;
  processed_at: string;
  reference: string | null;
  referring_site: string | null;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  subtotal_price_set: any;
  tags: string;
  tax_lines: any[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_discounts: string;
  total_discounts_set: any;
  total_line_items_price: string;
  total_line_items_price_set: any;
  total_outstanding: string;
  total_price: string;
  total_price_set: any;
  total_shipping_price_set: any;
  total_tax: string;
  total_tax_set: any;
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: number | null;
  brand?: string | null;
  line_items: ShopifyOrderLineItem[];
  customer: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    state: string;
    verified_email: boolean;
    currency: string;
  } | null;
}

export interface ShopifyCredentials {
  shopifyStoreUrl: string;
  shopifyAccessToken: string;
}

export interface WastedBudgetAlert {
  adId: string;
  adName: string;
  adSetName: string;
  campaignName: string;
  spend: number;
  clicks: number;
  shopifyProductId: number;
  productTitle: string;
  sku: string;
  inventoryQuantity: number;
  status: string;
  adUrl: string;
}

export interface ProductPerformance {
  productId: number;
  productTitle: string;
  sku: string;
  inventoryQuantity: number;
  shopifySalesQuantity: number;
  shopifyRevenue: number;
  adSpend: number;
  adClicks: number;
  attributedSales: number;
  attributedRevenue: number;
  trueROAS: number;
  productImageUrl: string | null;
  matchedAds: TransformedAd[];
}
