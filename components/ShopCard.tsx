'use client';

import { ShopData } from '@/types';
import { formatCurrency, formatPercentage, formatReturnRate, getRiskColor } from '@/lib/dataProcessor';

interface Props {
  shop: ShopData;
}

export default function ShopCard({ shop }: Props) {
  const isNewStore = shop.is_new_store;
  
  // 根据风险级别设置边框颜色
  const getBorderColor = () => {
    switch (shop.risk_level) {
      case '🚨 高风险': return 'border-red-400';
      case '🔴 风险': return 'border-rose-400';
      case '⚠️ 观察': return 'border-orange-400';
      case '✅ 正常': return 'border-green-400';
      case '新开店｜不可比': return 'border-blue-400';
      default: return 'border-gray-200';
    }
  };
  
  return (
    <div className={`bg-white rounded-xl p-5 shadow-md border-l-4 ${getBorderColor()}
                    hover:shadow-xl hover:-translate-y-1 transition-all duration-200`}>
      
      {/* 店铺名称和标签 */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">
            {shop.shop_name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getRiskColor(shop.risk_level)}`}>
            {shop.risk_level}
          </span>
        </div>
        <span className="inline-block text-sm px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
          {shop.brand}
        </span>
      </div>
      
      {/* 数据指标 */}
      {isNewStore ? (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800 font-bold mb-3 flex items-center gap-2">
            <span className="text-lg">🆕</span>
            2025年新开店铺
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">2025销售:</span>
              <span className="text-sm font-bold text-blue-700">{formatCurrency(shop.year_2025.net_sales)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">2025退货率:</span>
              <span className="text-sm font-bold text-blue-700">{formatReturnRate(shop.year_2025.return_rate)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 销售YOY */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1 font-semibold">销售 YOY</div>
            <div className={`text-xl font-bold mb-1 ${
              (shop.yoy?.sales_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(shop.yoy?.sales_pct)}
            </div>
            <div className="text-xs text-gray-600">
              {formatCurrency(shop.yoy?.sales_amount)}
            </div>
          </div>
          
          {/* 退货率YOY */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1 font-semibold">退货率 YOY</div>
            <div className={`text-xl font-bold mb-1 ${
              (shop.yoy?.return_rate || 0) < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(shop.yoy?.return_rate)}
            </div>
            <div className="text-xs text-gray-600">
              当前: {formatReturnRate(shop.year_2025?.return_rate)}
            </div>
          </div>
        </div>
      )}
      
      {/* 业务建议 */}
      {shop.suggestion && shop.suggestion !== '保持当前运营策略' && (
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">💡</span>
            <span className="text-xs text-purple-800 font-bold">改善建议</span>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed">
            {shop.suggestion}
          </div>
        </div>
      )}
      
      {/* 详细数据 - 更紧凑的布局 */}
      {!isNewStore && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500 mb-1">2024销售</div>
              <div className="font-bold text-gray-700">{formatCurrency(shop.year_2024.net_sales)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500 mb-1">2025销售</div>
              <div className="font-bold text-gray-700">{formatCurrency(shop.year_2025.net_sales)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500 mb-1">2024退货率</div>
              <div className="font-bold text-gray-700">{formatReturnRate(shop.year_2024.return_rate)}</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-gray-500 mb-1">2025退货率</div>
              <div className="font-bold text-gray-700">{formatReturnRate(shop.year_2025.return_rate)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
