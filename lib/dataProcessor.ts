// 数据处理核心逻辑

import { ShopData, ChannelSummary, BrandSummary } from '@/types';

/**
 * 读取处理后的JSON数据
 * 使用动态导入，适配服务端渲染
 */
export async function loadProcessedData(): Promise<ShopData[]> {
  try {
    // 动态导入JSON文件（只在服务端执行）
    const data = await import('../public/data/processed_data.json');
    return data.default as ShopData[];
  } catch (error) {
    console.error('加载数据失败:', error);
    return [];
  }
}

/**
 * 按渠道汇总数据
 */
export function getChannelSummaries(data: ShopData[]): ChannelSummary[] {
  // 按渠道分组
  const channelMap = new Map<string, ShopData[]>();
  
  data.forEach(shop => {
    if (!channelMap.has(shop.channel)) {
      channelMap.set(shop.channel, []);
    }
    channelMap.get(shop.channel)!.push(shop);
  });
  
  // 计算每个渠道的汇总指标
  const summaries: ChannelSummary[] = [];
  
  channelMap.forEach((shops, channel) => {
    // 排除新开店和数据不全的店铺进行YOY计算
    const comparableShops = shops.filter(s => 
      !s.is_new_store && 
      s.year_2024.net_sales !== null && 
      s.year_2024.net_sales > 0
    );
    
    // 2025年总销售额（包括新开店）
    const total_sales_2025 = shops.reduce((sum, s) => 
      sum + (s.year_2025.net_sales || 0), 0
    );
    
    // 2024年总销售额（仅可比店）
    const total_sales_2024 = comparableShops.reduce((sum, s) => 
      sum + (s.year_2024.net_sales || 0), 0
    );
    
    // 计算加权平均退货率（按销售额加权）
    const weighted_return_2025 = comparableShops.length > 0
      ? comparableShops.reduce((sum, s) => 
          sum + (s.year_2025.return_rate || 0) * (s.year_2025.net_sales || 0), 0
        ) / total_sales_2025
      : 0;
    
    const weighted_return_2024 = comparableShops.length > 0 && total_sales_2024 > 0
      ? comparableShops.reduce((sum, s) => 
          sum + (s.year_2024.return_rate || 0) * (s.year_2024.net_sales || 0), 0
        ) / total_sales_2024
      : 0;
    
    // YOY计算
    const sales_yoy_amount = total_sales_2025 - total_sales_2024;
    const sales_yoy_pct = total_sales_2024 > 0 
      ? (sales_yoy_amount / total_sales_2024) * 100 
      : 0;
    const return_rate_yoy = (weighted_return_2025 - weighted_return_2024) * 100;
    
    // 风险店铺统计
    const high_risk_count = shops.filter(s => s.risk_level === '🚨 高风险').length;
    const watch_count = shops.filter(s => s.risk_level === '⚠️ 观察').length;
    const new_store_count = shops.filter(s => s.is_new_store).length;
    
    summaries.push({
      channel,
      total_sales_2025,
      total_sales_2024,
      avg_return_rate_2025: weighted_return_2025,
      avg_return_rate_2024: weighted_return_2024,
      sales_yoy_pct,
      sales_yoy_amount,
      return_rate_yoy,
      shop_count: shops.length,
      high_risk_count,
      watch_count,
      new_store_count,
      shops: shops.sort((a, b) => {
        // 排序：高风险 > 风险 > 观察 > 新开店 > 正常
        const riskOrder: Record<string, number> = {
          '🚨 高风险': 1,
          '🔴 风险': 2,
          '⚠️ 观察': 3,
          '新开店｜不可比': 4,
          '✅ 正常': 5,
          '数据不全': 6
        };
        return (riskOrder[a.risk_level] || 999) - (riskOrder[b.risk_level] || 999);
      })
    });
  });
  
  // 按2025年销售额排序
  return summaries.sort((a, b) => b.total_sales_2025 - a.total_sales_2025);
}

/**
 * 按品牌汇总数据
 */
export function getBrandSummaries(data: ShopData[]): BrandSummary[] {
  const brandMap = new Map<string, ShopData[]>();
  
  data.forEach(shop => {
    if (!brandMap.has(shop.brand)) {
      brandMap.set(shop.brand, []);
    }
    brandMap.get(shop.brand)!.push(shop);
  });
  
  const summaries: BrandSummary[] = [];
  
  brandMap.forEach((shops, brand) => {
    const comparableShops = shops.filter(s => !s.is_new_store && s.year_2024.net_sales);
    
    const total_sales_2025 = shops.reduce((sum, s) => sum + (s.year_2025.net_sales || 0), 0);
    const total_sales_2024 = comparableShops.reduce((sum, s) => sum + (s.year_2024.net_sales || 0), 0);
    
    const sales_yoy_pct = total_sales_2024 > 0 
      ? ((total_sales_2025 - total_sales_2024) / total_sales_2024) * 100 
      : 0;
    
    const avg_return_rate_2025 = shops.length > 0
      ? shops.reduce((sum, s) => sum + (s.year_2025.return_rate || 0), 0) / shops.length
      : 0;
    
    const avg_return_rate_2024 = comparableShops.length > 0
      ? comparableShops.reduce((sum, s) => sum + (s.year_2024.return_rate || 0), 0) / comparableShops.length
      : 0;
    
    const return_rate_yoy = (avg_return_rate_2025 - avg_return_rate_2024) * 100;
    
    const high_risk_count = shops.filter(s => s.risk_level === '🚨 高风险').length;
    
    summaries.push({
      brand,
      total_sales_2025,
      total_sales_2024,
      sales_yoy_pct,
      avg_return_rate_2025,
      return_rate_yoy,
      shop_count: shops.length,
      high_risk_count
    });
  });
  
  return summaries.sort((a, b) => b.total_sales_2025 - a.total_sales_2025);
}

/**
 * 获取指定渠道的详细数据
 */
export function getChannelDetail(data: ShopData[], channelName: string): ChannelSummary | null {
  const channelShops = data.filter(s => s.channel === channelName);
  if (channelShops.length === 0) return null;
  
  const summaries = getChannelSummaries(channelShops);
  return summaries[0] || null;
}

/**
 * 格式化货币（千元K）
 */
export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return '-';
  const k = value / 1000;
  return `¥${k.toFixed(1)}K`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number | null, showSign: boolean = true): string {
  if (value === null || value === undefined) return '-';
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 格式化退货率（不带符号）
 */
export function formatReturnRate(value: number | null): string {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * 获取风险级别对应的颜色
 */
export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case '🚨 高风险':
      return 'text-red-600 bg-red-100';
    case '🔴 风险':
      return 'text-rose-600 bg-rose-100';
    case '⚠️ 观察':
      return 'text-orange-600 bg-orange-100';
    case '✅ 正常':
      return 'text-green-600 bg-green-100';
    case '新开店｜不可比':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
