'use client';

import { ShopData } from '@/types';
import { useState } from 'react';

interface Props {
  allData: ShopData[];
}

export default function StatsOverview({ allData }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<string>('');
  const [modalShops, setModalShops] = useState<ShopData[]>([]);

  // 计算各类店铺数量
  const totalShops = allData.length;
  const highRiskShops = allData.filter(s => s.risk_level === '🚨 高风险');
  const riskShops = allData.filter(s => s.risk_level === '🔴 风险');
  const watchShops = allData.filter(s => s.risk_level === '⚠️ 观察');
  const normalShops = allData.filter(s => s.risk_level === '✅ 正常');
  const newStoreShops = allData.filter(s => s.is_new_store);

  const handleCategoryClick = (category: string, shops: ShopData[]) => {
    setModalCategory(category);
    setModalShops(shops);
    setShowModal(true);
  };

  return (
    <>
      {/* 统计总览卡片 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100 p-6 mb-8">
        {/* 总店铺数 */}
        <div className="text-center mb-6 pb-6 border-b-2 border-purple-100">
          <div className="text-sm text-gray-500 mb-2">总店铺数</div>
          <div className="text-5xl font-bold text-purple-900">{totalShops}</div>
        </div>

        {/* 分类统计 - 对称网格布局 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 高风险 */}
          {highRiskShops.length > 0 && (
            <button
              onClick={() => handleCategoryClick('🚨 高风险店铺', highRiskShops)}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 
                       border-2 border-red-200 hover:border-red-400 hover:shadow-lg 
                       transition-all duration-200 text-left group"
            >
              <div className="text-xs text-red-600 mb-2 font-semibold">🚨 高风险</div>
              <div className="text-3xl font-bold text-red-600 mb-1 group-hover:scale-110 transition-transform">
                {highRiskShops.length}
              </div>
              <div className="text-xs text-red-500">点击查看详情 →</div>
            </button>
          )}

          {/* 风险 */}
          {riskShops.length > 0 && (
            <button
              onClick={() => handleCategoryClick('🔴 风险店铺', riskShops)}
              className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 
                       border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg 
                       transition-all duration-200 text-left group"
            >
              <div className="text-xs text-rose-600 mb-2 font-semibold">🔴 风险</div>
              <div className="text-3xl font-bold text-rose-600 mb-1 group-hover:scale-110 transition-transform">
                {riskShops.length}
              </div>
              <div className="text-xs text-rose-500">点击查看详情 →</div>
            </button>
          )}

          {/* 观察 */}
          {watchShops.length > 0 && (
            <button
              onClick={() => handleCategoryClick('⚠️ 观察店铺', watchShops)}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 
                       border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg 
                       transition-all duration-200 text-left group"
            >
              <div className="text-xs text-orange-600 mb-2 font-semibold">⚠️ 观察</div>
              <div className="text-3xl font-bold text-orange-600 mb-1 group-hover:scale-110 transition-transform">
                {watchShops.length}
              </div>
              <div className="text-xs text-orange-500">点击查看详情 →</div>
            </button>
          )}

          {/* 正常 */}
          <button
            onClick={() => handleCategoryClick('✅ 正常店铺', normalShops)}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 
                     border-2 border-green-200 hover:border-green-400 hover:shadow-lg 
                     transition-all duration-200 text-left group"
          >
            <div className="text-xs text-green-600 mb-2 font-semibold">✅ 正常</div>
            <div className="text-3xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform">
              {normalShops.length}
            </div>
            <div className="text-xs text-green-500">点击查看详情 →</div>
          </button>

          {/* 新开店铺 */}
          {newStoreShops.length > 0 && (
            <button
              onClick={() => handleCategoryClick('🆕 新开店铺', newStoreShops)}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 
                       border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg 
                       transition-all duration-200 text-left group"
            >
              <div className="text-xs text-blue-600 mb-2 font-semibold">🆕 新开店</div>
              <div className="text-3xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform">
                {newStoreShops.length}
              </div>
              <div className="text-xs text-blue-500">点击查看详情 →</div>
            </button>
          )}
        </div>
      </div>

      {/* 弹窗 - 显示店铺详情 */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗标题 */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{modalCategory}</h3>
                  <p className="text-purple-100">共 {modalShops.length} 家店铺</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 店铺列表 - 详细数据 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {modalShops.map((shop, index) => (
                  <div 
                    key={shop.shop_name}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all"
                  >
                    {/* 店铺标题 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full 
                                    flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{shop.shop_name}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            {shop.channel}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {shop.brand}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        shop.risk_level === '🚨 高风险' ? 'bg-red-100 text-red-700' :
                        shop.risk_level === '🔴 风险' ? 'bg-rose-100 text-rose-700' :
                        shop.risk_level === '⚠️ 观察' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {shop.risk_level}
                      </span>
                    </div>

                    {/* YOY数据 */}
                    {!shop.is_new_store && shop.yoy && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {/* 销售YOY */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                          <div className="text-xs text-gray-600 mb-1">销售 YOY</div>
                          <div className={`text-2xl font-bold mb-1 ${
                            (shop.yoy.sales_pct || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {shop.yoy.sales_pct !== null 
                              ? `${shop.yoy.sales_pct >= 0 ? '+' : ''}${shop.yoy.sales_pct.toFixed(1)}%`
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {shop.yoy.sales_amount !== null
                              ? `${shop.yoy.sales_amount >= 0 ? '+' : ''}${(shop.yoy.sales_amount / 1000).toFixed(1)}K`
                              : 'N/A'}
                          </div>
                        </div>

                        {/* 退货率YOY */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                          <div className="text-xs text-gray-600 mb-1">退货率 YOY</div>
                          <div className={`text-2xl font-bold mb-1 ${
                            (shop.yoy.return_rate || 0) < 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {shop.yoy.return_rate !== null
                              ? `${shop.yoy.return_rate >= 0 ? '+' : ''}${shop.yoy.return_rate.toFixed(2)}%`
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600">
                            当前: {shop.year_2025.return_rate !== null 
                              ? `${(shop.year_2025.return_rate * 100).toFixed(1)}%`
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 新开店铺提示 */}
                    {shop.is_new_store && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <div className="text-sm text-blue-700 font-semibold">
                          🆕 2025年新开店铺，无YOY数据
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="bg-gray-50 p-4 text-center border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white 
                         rounded-lg font-semibold transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
