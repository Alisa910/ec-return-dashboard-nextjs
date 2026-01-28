import ChannelCard from '@/components/ChannelCard';
import StatsOverview from '@/components/StatsOverview';
import { loadProcessedData, getChannelSummaries, getBrandSummaries } from '@/lib/dataProcessor';

export default async function HomePage() {
  // 服务端加载数据
  const allData = await loadProcessedData();
  const channelSummaries = getChannelSummaries(allData);
  const brandSummaries = getBrandSummaries(allData);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        
        {/* 页面标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-900 mb-3 sm:mb-4">
            EC OR Return Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4">
            2025 vs 2024 YTD 渠道对比分析
          </p>
        </div>

        {/* 统计总览 - 新组件 */}
        <div className="max-w-[1600px] mx-auto px-4">
          <StatsOverview allData={allData} />
        </div>
        
        {/* 品牌概览 */}
        <div className="mb-8 max-w-[1600px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            <span>品牌概览</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {brandSummaries
              .filter(brand => ['MLB', 'MLB KIDS', 'Discovery'].includes(brand.brand))
              .map(brand => (
              <div key={brand.brand} 
                   className="bg-white rounded-lg p-4 shadow-md border-2 border-purple-100">
                <h3 className="text-lg font-bold text-purple-900 mb-2">{brand.brand}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">销售YOY:</span>
                    <span className={`font-semibold ${
                      brand.sales_yoy_pct >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {brand.sales_yoy_pct >= 0 ? '+' : ''}{brand.sales_yoy_pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">退货率YOY:</span>
                    <span className={`font-semibold ${
                      brand.return_rate_yoy < 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {brand.return_rate_yoy >= 0 ? '+' : ''}{brand.return_rate_yoy.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>店铺数:</span>
                    <span>{brand.shop_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 渠道卡片网格 - 横向并列显示 */}
        <div className="mb-8 max-w-[1600px] mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏪</span>
            <span>渠道分析</span>
          </h2>
          {/* 大屏幕：5列网格，小屏幕：横向滚动 */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {channelSummaries
              .sort((a, b) => {
                // 按退货率YOY降序排列
                return b.return_rate_yoy - a.return_rate_yoy;
              })
              .map((summary) => (
                <ChannelCard key={summary.channel} data={summary} />
              ))}
          </div>
          {/* 移动端和平板：横向滚动 */}
          <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4">
              {channelSummaries
                .sort((a, b) => {
                  return b.return_rate_yoy - a.return_rate_yoy;
                })
                .map((summary) => (
                  <div key={summary.channel} className="flex-shrink-0 w-72">
                    <ChannelCard data={summary} />
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* 页脚 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>数据来源: EC退货率变化.CSV | 更新时间: {new Date().toLocaleDateString('zh-CN')}</p>
        </div>
      </div>
    </main>
  );
}
