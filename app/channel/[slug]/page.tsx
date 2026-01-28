import Link from 'next/link';
import { loadProcessedData, getChannelDetail, formatCurrency, formatPercentage } from '@/lib/dataProcessor';
import ShopCard from '@/components/ShopCard';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    slug: string;
  };
}

export default async function ChannelDetailPage({ params }: Props) {
  const channelName = decodeURIComponent(params.slug);
  
  // 加载数据
  const allData = await loadProcessedData();
  const channelDetail = getChannelDetail(allData, channelName);
  
  if (!channelDetail) {
    notFound();
  }
  
  // 按风险级别分组
  const highRiskShops = channelDetail.shops.filter(s => s.risk_level === '🚨 高风险');
  const riskShops = channelDetail.shops.filter(s => s.risk_level === '🔴 风险');
  const watchShops = channelDetail.shops.filter(s => s.risk_level === '⚠️ 观察');
  const normalShops = channelDetail.shops.filter(s => s.risk_level === '✅ 正常');
  const newShops = channelDetail.shops.filter(s => s.is_new_store);
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 返回按钮 */}
        <Link href="/" 
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 
                       font-semibold mb-6 transition-colors">
          <span>←</span>
          <span>返回首页</span>
        </Link>
        
        {/* 渠道标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            {channelName}
          </h1>
          <p className="text-gray-600">
            详细店铺分析 · {channelDetail.shop_count} 家店铺
          </p>
        </div>
        
        {/* 渠道汇总指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 销售YOY */}
          <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">销售 YOY</div>
            <div className={`text-3xl font-bold mb-1 ${
              channelDetail.sales_yoy_pct >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(channelDetail.sales_yoy_pct)}
            </div>
            <div className="text-sm text-gray-600">
              {formatCurrency(channelDetail.sales_yoy_amount)}
            </div>
          </div>
          
          {/* 退货率YOY */}
          <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">退货率 YOY</div>
            <div className={`text-3xl font-bold mb-1 ${
              channelDetail.return_rate_yoy < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(channelDetail.return_rate_yoy)}
            </div>
            <div className="text-sm text-gray-600">
              当前: {(channelDetail.avg_return_rate_2025 * 100).toFixed(2)}%
            </div>
          </div>
          
          {/* 高风险店铺 */}
          <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">高风险店铺</div>
            <div className="text-3xl font-bold text-red-600 mb-1">
              {channelDetail.high_risk_count}
            </div>
            <div className="text-sm text-gray-600">
              需重点关注
            </div>
          </div>
          
          {/* 观察店铺 */}
          <div className="bg-white rounded-xl p-5 shadow-md border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">观察店铺</div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {channelDetail.watch_count}
            </div>
            <div className="text-sm text-gray-600">
              持续监控
            </div>
          </div>
        </div>
        
        {/* 高风险店铺 */}
        {highRiskShops.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-red-50 to-red-100 
                          p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
              <h2 className="text-2xl font-bold text-red-600">🚨 高风险店铺</h2>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {highRiskShops.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {highRiskShops.map(shop => (
                <ShopCard key={shop.shop_name} shop={shop} />
              ))}
            </div>
          </div>
        )}
        
        {/* 风险店铺 */}
        {riskShops.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-rose-50 to-rose-100 
                          p-4 rounded-lg border-l-4 border-rose-500 shadow-sm">
              <h2 className="text-2xl font-bold text-rose-600">🔴 风险店铺</h2>
              <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {riskShops.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {riskShops.map(shop => (
                <ShopCard key={shop.shop_name} shop={shop} />
              ))}
            </div>
          </div>
        )}
        
        {/* 观察店铺 */}
        {watchShops.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-orange-50 to-orange-100 
                          p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
              <h2 className="text-2xl font-bold text-orange-600">⚠️ 观察店铺</h2>
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {watchShops.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {watchShops.map(shop => (
                <ShopCard key={shop.shop_name} shop={shop} />
              ))}
            </div>
          </div>
        )}
        
        {/* 新开店铺 */}
        {newShops.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-blue-50 to-blue-100 
                          p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
              <h2 className="text-2xl font-bold text-blue-600">🆕 新开店铺</h2>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {newShops.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {newShops.map(shop => (
                <ShopCard key={shop.shop_name} shop={shop} />
              ))}
            </div>
          </div>
        )}
        
        {/* 正常店铺 */}
        {normalShops.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 bg-gradient-to-r from-green-50 to-green-100 
                          p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
              <h2 className="text-2xl font-bold text-green-600">✅ 正常运营店铺</h2>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                {normalShops.length} 家
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {normalShops.map(shop => (
                <ShopCard key={shop.shop_name} shop={shop} />
              ))}
            </div>
          </div>
        )}
        
        {/* 返回首页按钮 */}
        <div className="text-center mt-12">
          <Link href="/" 
                className="inline-block bg-purple-600 hover:bg-purple-700 
                         text-white font-semibold px-8 py-3 rounded-lg 
                         transition-colors shadow-lg">
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
