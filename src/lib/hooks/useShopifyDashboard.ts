'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ShopifyProduct, ShopifyOrder, WastedBudgetAlert, ProductPerformance } from '../types/shopify.types';
import type { TransformedAd } from '../types/meta.types';

const EMPTY_PRODUCTS: ShopifyProduct[] = [];
const EMPTY_ORDERS: ShopifyOrder[] = [];
const DEFAULT_SHOPIFY_SUMMARY = { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, currency: 'PKR' };
const EMPTY_ALERTS: WastedBudgetAlert[] = [];
const EMPTY_PERFORMANCE: ProductPerformance[] = [];

export function useShopifyDashboard(metaAds: TransformedAd[] = []) {
  const [shopifyToken, setShopifyToken] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [nextPageInfo, setNextPageInfo] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Load credentials from localStorage on mount
  useEffect(() => {
    let storedToken = localStorage.getItem('omsToken') || localStorage.getItem('token') || localStorage.getItem('shopifyAccessToken');
    if (storedToken) {
      // If the token starts with "Bearer ", strip it to extract the raw JWT token
      if (storedToken.startsWith('Bearer ')) {
        storedToken = storedToken.substring(7);
      }
      setShopifyToken(storedToken.trim());
      setIsConnected(true);
    }
  }, []);

  // Fetch data from Next.js server-side API proxy
  const fetchShopifyData = useCallback(async (tokenStr = shopifyToken) => {
    if (!tokenStr) return;
    setLoading(true);
    setError(null);
    try {
      console.log("[OMS Dashboard Hook] Fetching OMS products and orders in parallel...");
      const [prodRes, orderRes] = await Promise.all([
        fetch(`/api/oms?type=products&oms_token=${encodeURIComponent(tokenStr)}&limit=50`),
        fetch(`/api/oms?type=orders&oms_token=${encodeURIComponent(tokenStr)}&limit=100`)
      ]);

      if (!prodRes.ok) {
        throw new Error(`Products sync failed: ${prodRes.statusText}`);
      }
      if (!orderRes.ok) {
        throw new Error(`Orders sync failed: ${orderRes.statusText}`);
      }

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();

      if (prodData.error) throw new Error(prodData.error);
      if (orderData.error) throw new Error(orderData.error);

      setProducts(prodData.products || []);
      setOrders(orderData.orders || []);
      setNextPageInfo(prodData.nextPageInfo || null);
    } catch (err: any) {
      console.error("[OMS Dashboard Hook Error]", err);
      setError(err.message || 'An error occurred while loading data from the OMS.');
    } finally {
      setLoading(false);
    }
  }, [shopifyToken]);

  // Load more products for pagination
  const loadMoreProducts = useCallback(async () => {
    if (!shopifyToken || !nextPageInfo || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/oms?type=products&limit=50` +
        `&oms_token=${encodeURIComponent(shopifyToken)}` +
        `&page=${encodeURIComponent(nextPageInfo)}`
      );
      if (!res.ok) {
        throw new Error(`Failed to load more products: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setProducts(prev => [...prev, ...(data.products || [])]);
      setNextPageInfo(data.nextPageInfo || null);
    } catch (err: any) {
      console.error('Error paginating products:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [shopifyToken, nextPageInfo, loadingMore]);

  // Trigger fetch if credentials exist
  useEffect(() => {
    if (isConnected && shopifyToken) {
      fetchShopifyData();
    }
  }, [isConnected, shopifyToken, fetchShopifyData]);

  // Connect automatically using Shopify OAuth redirection (DEPRECATED for OMS, stubbed out to prevent crashes)
  const connectOauth = useCallback((shopUrl: string, actId: string, fbToken: string) => {
    console.warn("connectOauth is deprecated and has no effect with OMS.");
  }, []);

  // Connect manually with store URL (optional) and admin access token
  const connectManual = useCallback((shopUrlOrToken: string, tokenParam?: string) => {
    // If two parameters are passed, use the second as the token (for backward compatibility).
    // Otherwise, use the first parameter as the token.
    const token = tokenParam ? tokenParam : shopUrlOrToken;
    const cleanToken = token.trim();

    localStorage.setItem('omsToken', cleanToken);
    setShopifyToken(cleanToken);
    setIsConnected(true);
  }, []);

  // Disconnect and wipe localStorage keys
  const disconnect = useCallback(() => {
    localStorage.removeItem('omsToken');
    localStorage.removeItem('token');
    localStorage.removeItem('shopifyStoreUrl');
    localStorage.removeItem('shopifyAccessToken');
    setShopifyToken('');
    setProducts([]);
    setOrders([]);
    setNextPageInfo(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Helper function to match Meta Ad to a Product
  const matchAdToProduct = useCallback((ad: TransformedAd, shopifyProducts: ShopifyProduct[]): ShopifyProduct | null => {
    const url = (ad.finalUrl || ad.creative?.url_tags || '').toLowerCase();
    
    const handleRegex = /\/products\/([a-zA-Z0-9-_]+)/;
    const match = url.match(handleRegex);
    if (match && match[1]) {
      const handle = match[1];
      const product = shopifyProducts.find(p => p.handle.toLowerCase() === handle);
      if (product) return product;
    }

    const adNameLower = ad.name.toLowerCase();
    for (const product of shopifyProducts) {
      if (adNameLower.includes(product.title.toLowerCase())) {
        return product;
      }
      for (const variant of product.variants) {
        if (variant.sku && adNameLower.includes(variant.sku.toLowerCase())) {
          return product;
        }
      }
    }

    return null;
  }, []);

  // 1. Wasted Budget Alerts Engine
  const wastedBudgetAlerts = useMemo((): WastedBudgetAlert[] => {
    if (!isConnected || products.length === 0 || metaAds.length === 0) return [];

    const alerts: WastedBudgetAlert[] = [];

    metaAds.forEach(ad => {
      const isActive = ad.status.toUpperCase() === 'ACTIVE' || ad.raw?.effective_status === 'ACTIVE';
      const hasSpend = ad.cost > 0;

      if (isActive && hasSpend) {
        const product = matchAdToProduct(ad, products);
        if (product) {
          const totalStock = product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0);
          
          if (totalStock <= 0) {
            alerts.push({
              adId: ad.id,
              adName: ad.name,
              adSetName: ad.adGroupName || '—',
              campaignName: ad.campaignName || '—',
              spend: ad.cost,
              clicks: ad.clicks,
              shopifyProductId: product.id,
              productTitle: product.title,
              sku: product.variants[0]?.sku || 'No SKU',
              inventoryQuantity: totalStock,
              status: ad.status,
              adUrl: ad.finalUrl || '#',
            });
          }
        }
      }
    });

    return alerts;
  }, [isConnected, products, metaAds, matchAdToProduct]);

  // 2. Product Performance Engine
  const productPerformance = useMemo((): ProductPerformance[] => {
    if (!isConnected || products.length === 0) return [];

    const perfMap: Record<number, {
      product: ShopifyProduct;
      adSpend: number;
      adClicks: number;
      attributedSales: number;
      attributedRevenue: number;
      matchedAds: TransformedAd[];
    }> = {};

    products.forEach(p => {
      perfMap[p.id] = {
        product: p,
        adSpend: 0,
        adClicks: 0,
        attributedSales: 0,
        attributedRevenue: 0,
        matchedAds: [],
      };
    });

    metaAds.forEach(ad => {
      const product = matchAdToProduct(ad, products);
      if (product && perfMap[product.id]) {
        perfMap[product.id].adSpend += ad.cost || 0;
        perfMap[product.id].adClicks += ad.clicks || 0;
        perfMap[product.id].attributedSales += ad.insights?.conversions || 0;
        perfMap[product.id].attributedRevenue += ad.insights?.conversion_values || 0;
        perfMap[product.id].matchedAds.push(ad);
      }
    });

    const salesMap: Record<number, { quantity: number; revenue: number }> = {};
    
    orders.forEach(order => {
      const isCancelled = order.cancelled_at !== null;
      if (!isCancelled) {
        order.line_items.forEach(item => {
          if (item.product_id) {
            if (!salesMap[item.product_id]) {
              salesMap[item.product_id] = { quantity: 0, revenue: 0 };
            }
            salesMap[item.product_id].quantity += item.quantity || 0;
            salesMap[item.product_id].revenue += (parseFloat(item.price) * (item.quantity || 0));
          }
        });
      }
    });

    return Object.values(perfMap).map(({ product, adSpend, adClicks, attributedSales, attributedRevenue, matchedAds }) => {
      const totalStock = product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0);
      const actualSales = salesMap[product.id] || { quantity: 0, revenue: 0 };
      const trueROAS = adSpend > 0 ? actualSales.revenue / adSpend : 0;

      return {
        productId: product.id,
        productTitle: product.title,
        sku: product.variants[0]?.sku || '—',
        inventoryQuantity: totalStock,
        shopifySalesQuantity: actualSales.quantity,
        shopifyRevenue: actualSales.revenue,
        adSpend,
        adClicks,
        attributedSales,
        attributedRevenue,
        trueROAS,
        productImageUrl: product.image?.src || (product.images && product.images[0]?.src) || null,
        matchedAds,
      };
    });
  }, [isConnected, products, orders, metaAds, matchAdToProduct]);

  // 3. Store Metrics Summary
  const shopifySummary = useMemo(() => {
    if (!isConnected || orders.length === 0) {
      return DEFAULT_SHOPIFY_SUMMARY;
    }

    const validOrders = orders.filter(o => o.cancelled_at === null);
    const totalRevenue = validOrders.reduce((sum, o) => sum + parseFloat(o.total_price || '0'), 0);
    const totalOrders = validOrders.length;
    
    const uniqueEmails = new Set(validOrders.map(o => o.email).filter(Boolean));
    const totalCustomers = uniqueEmails.size;
    
    const currency = validOrders[0]?.currency || 'PKR';

    return { totalRevenue, totalOrders, totalCustomers, currency };
  }, [isConnected, orders]);

  return {
    shopifyUrl: "OMS",
    isConnected,
    loading,
    products: products || EMPTY_PRODUCTS,
    orders: orders || EMPTY_ORDERS,
    error,
    wastedBudgetAlerts: wastedBudgetAlerts || EMPTY_ALERTS,
    productPerformance: productPerformance || EMPTY_PERFORMANCE,
    shopifySummary: shopifySummary || DEFAULT_SHOPIFY_SUMMARY,
    nextPageInfo,
    loadingMore,
    connectOauth,
    connectManual,
    disconnect,
    refresh: fetchShopifyData,
    loadMoreProducts,
  };
}
