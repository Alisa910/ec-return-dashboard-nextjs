// EC退货率Dashboard - TypeScript类型定义

/**
 * 店铺原始数据结构
 */
export interface ShopData {
  channel: string;
  shop_name: string;
  brand: string;
  year_2025: {
    net_sales: number | null;
    return_rate: number | null;
  };
  year_2024: {
    net_sales: number | null;
    return_rate: number | null;
  };
  yoy: {
    sales_amount: number | null;
    sales_pct: number | null;
    return_rate: number | null;
  };
  risk_level: RiskLevel;
  suggestion: string;
  is_new_store: boolean;
}

/**
 * 渠道汇总数据
 */
export interface ChannelSummary {
  channel: string;
  total_sales_2025: number;
  total_sales_2024: number;
  avg_return_rate_2025: number;
  avg_return_rate_2024: number;
  sales_yoy_pct: number;
  sales_yoy_amount: number;
  return_rate_yoy: number;
  shop_count: number;
  high_risk_count: number;
  watch_count: number;
  new_store_count: number;
  shops: ShopData[];
}

/**
 * 品牌汇总统计
 */
export interface BrandSummary {
  brand: string;
  total_sales_2025: number;
  total_sales_2024: number;
  sales_yoy_pct: number;
  avg_return_rate_2025: number;
  return_rate_yoy: number;
  shop_count: number;
  high_risk_count: number;
}

/**
 * 风险级别
 */
export type RiskLevel = '🚨 高风险' | '🔴 风险' | '⚠️ 观察' | '✅ 正常' | '新开店｜不可比' | '数据不全';

/**
 * 指标卡片数据
 */
export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'red' | 'blue' | 'purple';
}

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
