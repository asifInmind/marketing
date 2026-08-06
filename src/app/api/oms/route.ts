import { NextRequest, NextResponse } from 'next/server';
import { OMS_API } from '../../../lib/utils/constants';

// Helper to safely parse strings to numbers
function safeParseInt(val: any, defaultVal = 0): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? defaultVal : parsed;
  }
  return defaultVal;
}

// Map OMS Order product representation to Shopify Order Line Item schema
function mapOmsProductToLineItem(p: any, index: number) {
  return {
    id: safeParseInt(p.variant_id || p.id || index),
    admin_graphql_api_id: '',
    attributed_staffs: [],
    current_quantity: safeParseInt(p.quantity, 1),
    fulfillable_quantity: safeParseInt(p.quantity, 1),
    fulfillment_service: '',
    fulfillment_status: null,
    gift_card: false,
    grams: 0,
    name: p.title || '',
    price: String(p.price || '0.00'),
    price_set: null,
    product_exists: true,
    product_id: safeParseInt(p.id),
    properties: [],
    quantity: safeParseInt(p.quantity, 1),
    requires_shipping: true,
    sku: p.sku || null,
    taxable: true,
    title: p.title || '',
    total_discount: '0',
    total_discount_set: null,
    variant_id: safeParseInt(p.variant_id || p.id),
    variant_inventory_management: null,
    variant_title: null,
    vendor: null
  };
}

// Map OMS Order payload to Shopify Order schema expected by frontend hook
function mapOmsOrderToShopifyOrder(o: any) {
  const isCancelled = o.orderStatus === 'cancelled' || o.orderStatus === 'canceled' || o.orderStatus === 'returned';
  const subtotal = o.current_subtotal_price || o.total_price || '0';
  const total = o.current_total_price || o.total_price || '0';
  const discount = o.current_total_discounts || '0';

  return {
    id: safeParseInt(o.id),
    admin_graphql_api_id: '',
    app_id: 0,
    browser_ip: null,
    buyer_accepts_marketing: false,
    cancel_reason: null,
    cancelled_at: isCancelled ? o.updated_at || new Date().toISOString() : null,
    cart_token: null,
    checkout_id: null,
    checkout_token: null,
    client_details: null,
    closed_at: null,
    company: null,
    confirmed: true,
    contact_email: o.email || null,
    created_at: o.created_at || new Date().toISOString(),
    currency: o.currency || 'PKR',
    current_subtotal_price: String(subtotal),
    current_subtotal_price_set: null,
    current_total_additional_fees_set: null,
    current_total_discounts: String(discount),
    current_total_discounts_set: null,
    current_total_duties_set: null,
    current_total_price: String(total),
    current_total_price_set: null,
    current_total_tax: '0',
    current_total_tax_set: null,
    customer_locale: null,
    device_id: null,
    discount_codes: o.discount_codes || [],
    email: o.email || '',
    estimated_taxes: false,
    financial_status: o.financial_status || 'pending',
    fulfillment_status: null,
    landing_site: null,
    landing_site_ref: null,
    location_id: null,
    merchant_of_record_app_id: null,
    name: o.name || `#${o.id}`,
    note: o.remarks ? o.remarks.join(', ') : null,
    note_attributes: [],
    number: 0,
    order_number: 0,
    order_status_url: '',
    original_total_additional_fees_set: null,
    original_total_duties_set: null,
    payment_gateway_names: o.payment_gateway_names || [],
    phone: o.phone || null,
    po_number: null,
    presentment_currency: o.currency || 'PKR',
    processed_at: o.created_at || new Date().toISOString(),
    reference: null,
    referring_site: null,
    source_identifier: null,
    source_name: o.platform || 'oms',
    source_url: null,
    subtotal_price: String(subtotal),
    subtotal_price_set: null,
    tags: o.tags ? o.tags.join(',') : '',
    tax_lines: [],
    taxes_included: false,
    test: false,
    token: '',
    total_discounts: String(discount),
    total_discounts_set: null,
    total_line_items_price: String(subtotal),
    total_line_items_price_set: null,
    total_outstanding: '0',
    total_price: String(total),
    total_price_set: null,
    total_shipping_price_set: null,
    total_tax: '0',
    total_tax_set: null,
    total_tip_received: '0',
    total_weight: 0,
    updated_at: o.created_at || new Date().toISOString(),
    user_id: null,
    brand: o.brand || null,
    line_items: (o.products || []).map((p: any, idx: number) => mapOmsProductToLineItem(p, idx)),
    customer: o.customer ? {
      id: safeParseInt(o.customer),
      email: o.email || '',
      first_name: o.first_name || null,
      last_name: o.last_name || null,
      state: '',
      verified_email: false,
      currency: o.currency || 'PKR'
    } : null
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'products'; // 'products' or 'orders'
  const token = searchParams.get('oms_token');
  const page = safeParseInt(searchParams.get('page'), 1);
  const limit = safeParseInt(searchParams.get('limit'), 25);
  const startDate = searchParams.get('start_date') || undefined;
  const endDate = searchParams.get('end_date') || undefined;

  if (!token) {
    return NextResponse.json({ error: 'Missing OMS token' }, { status: 400 });
  }

  try {
    if (type === 'products') {
      const urlParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'active,unlisted'
      });
      
      const url = `${OMS_API.BASE_URL}/products?${urlParams.toString()}`;
      console.log(`[OMS API Proxy] Fetching products from ${url}`);
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: `OMS API returned status ${res.status}: ${text}` }, { status: res.status });
      }
      
      const data = await res.json();
      const products = data.products || [];
      
      // Calculate nextPageInfo if list size equals the requested page limit
      const nextPageInfo = products.length === limit ? (page + 1).toString() : null;

      return NextResponse.json({
        products: products,
        nextPageInfo: nextPageInfo
      });
    }
    
    if (type === 'orders') {
      let queryLimit = safeParseInt(searchParams.get('limit'), 100); // Default to 100
      if (queryLimit > 100) {
        queryLimit = 100; // Cap at max OMS limit
      }
      const urlParams = new URLSearchParams({
        page: page.toString(),
        limit: queryLimit.toString(),
        searchBy: 'customer_phone'
      });

      let queryStartDate = startDate;
      let queryEndDate = endDate;

      if (!queryStartDate || !queryEndDate) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30); // Default to last 30 days

        const formatDate = (d: Date) => {
          const pad = (n: number) => n.toString().padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        if (!queryStartDate) queryStartDate = formatDate(start);
        if (!queryEndDate) queryEndDate = formatDate(end);
      }

      urlParams.set('start_date', queryStartDate);
      urlParams.set('end_date', queryEndDate);
      
      const url = `${OMS_API.BASE_URL}/orders/history?${urlParams.toString()}`;
      console.log(`[OMS API Proxy] Fetching orders from ${url}`);
      
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: `OMS API returned status ${res.status}: ${text}` }, { status: res.status });
      }
      
      const rawData = await res.json();
      const rawOrders = rawData.data?.orders || [];
      
      // Transform raw orders into the expected schema
      const mappedOrders = rawOrders.map(mapOmsOrderToShopifyOrder);
      const nextPageInfo = rawOrders.length === queryLimit ? (page + 1).toString() : null;

      return NextResponse.json({
        orders: mappedOrders,
        nextPageInfo: nextPageInfo
      });
    }

    return NextResponse.json({ error: "Invalid type parameter. Use type=products or type=orders" }, { status: 400 });
  } catch (error: any) {
    console.error("[OMS API Proxy Error]", error);
    return NextResponse.json({ error: error.message || 'Failed to fetch from OMS' }, { status: 500 });
  }
}
