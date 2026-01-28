'use client';

import Link from 'next/link';
import { ChannelSummary } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/dataProcessor';

interface Props {
  data: ChannelSummary;
}

export default function ChannelCard({ data }: Props) {
  const isPositiveSales = data.sales_yoy_pct >= 0;
  const isNegativeReturn = data.return_rate_yoy < 0; // 退货率下降是好事
  
  // 计算风险等级
  const totalRiskCount = data.high_risk_count + data.watch_count;
  const hasRisk = totalRiskCount > 0;
  
  // 根据渠道设置不同的背景颜色
  const getChannelColor = () => {
    switch (data.channel) {
      case 'TM':
        return 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400';
      case 'JD':
        return 'from-green-50 to-green-100 border-green-200 hover:border-green-400';
      case 'DY':
        return 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400';
      case 'VIP':
        return 'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400';
      case 'WeChat':
        return 'from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200 hover:border-gray-400';
    }
  };
  
  return (
    <Link href={`/channel/${encodeURIComponent(data.channel)}`}>
      <div className={`
        group relative 
        bg-gradient-to-br ${getChannelColor()}
        hover:shadow-2xl 
        rounded-2xl p-6 shadow-lg
        transition-all duration-300 cursor-pointer
        border-2
        h-full flex flex-col
      `}>
        
        {/* 渠道标题 */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-1 
                       group-hover:text-gray-700 transition-colors">
            {data.channel}
          </h2>
          <div className="text-sm text-gray-600">
            {data.shop_count} 家店铺
            {data.new_store_count > 0 && (
              <span className="ml-2 text-blue-600">
                （含 {data.new_store_count} 家新店）
              </span>
            )}
          </div>
        </div>
        
        {/* 销售YOY */}
        <div className="mb-4 pb-4 border-b border-gray-300">
          <div className="text-xs text-gray-500 mb-1 font-semibold">
            销售 YOY
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${
              isPositiveSales ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(data.sales_yoy_pct)}
            </span>
            <span className={`text-sm font-semibold ${
              isPositiveSales ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(data.sales_yoy_amount)}
            </span>
          </div>
        </div>
        
        {/* 退货率YOY */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1 font-semibold">
            退货率 YOY
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${
              isNegativeReturn ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(data.return_rate_yoy)}
            </span>
            {isNegativeReturn ? (
              <span className="text-xs text-green-600 font-semibold">↓ 改善</span>
            ) : (
              <span className="text-xs text-red-600 font-semibold">↑ 上升</span>
            )}
          </div>
        </div>
        
        {/* 2025年当前退货率 */}
        <div className="text-xs text-gray-600 mb-4">
          2025 退货率: <span className="font-semibold text-gray-900">
            {(data.avg_return_rate_2025 * 100).toFixed(2)}%
          </span>
        </div>
        
        {/* 风险提示 - 简化显示 */}
        {hasRisk && (
          <div className="bg-white bg-opacity-60 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              {data.high_risk_count > 0 && (
                <span className="text-red-600 font-semibold">
                  🚨 {data.high_risk_count} 高风险
                </span>
              )}
              {data.watch_count > 0 && (
                <span className="text-orange-600 font-semibold">
                  ⚠️ {data.watch_count} 观察
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* 查看详情 */}
        <div className="flex justify-between items-center text-sm pt-3 mt-auto
                      border-t border-gray-300">
          <span className="text-gray-500">点击查看详情</span>
          <span className="text-gray-700 font-semibold 
                         group-hover:text-gray-900 group-hover:translate-x-1 
                         transition-all">
            详情 →
          </span>
        </div>
      </div>
    </Link>
  );
}
