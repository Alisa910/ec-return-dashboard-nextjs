// YOY 计算和风险识别逻辑

import { COMPARE_YEARS, RISK_LEVELS, RISK_SUGGESTIONS, DECIMAL_PLACES } from './config'
import type { ProcessedShopData, ShopYOY, ChannelSummary, BrandStats, RiskLevel } from '@/types'

/**
 * 识别新开店铺
 */
export function identifyNewShops(data: ProcessedShopData[]): Set<string> {
  const shops2025 = new Set(
    data.filter(row => row.Year === COMPARE_YEARS.CURRENT).map(row => row.Shop_Name)
  )
  const shops2024 = new Set(
    data.filter(row => row.Year === COMPARE_YEARS.PREVIOUS).map(row => row.Shop_Name)
  )
  
  return new Set([...shops2025].filter(shop => !shops2024.has(shop)))
}

/**
 * 计算风险等级
 */
function calculateRiskLevel(
  isNewShop: boolean,
  salesYOY: number,
  returnYOY: number
): RiskLevel {
  if (isNewShop) return RISK_LEVELS.NEW_SHOP
  if (salesYOY < 0 && returnYOY > 0) return RISK_LEVELS.HIGH
  if (salesYOY > 0 && returnYOY > 0) return RISK_LEVELS.WATCH
  return RISK_LEVELS.NORMAL
}

/**
 * 计算店铺级别 YOY
 */
export function calculateShopYOY(data: ProcessedShopData[]): ShopYOY[] {
  const newShops = identifyNewShops(data)
  
  // 按店铺分组
  const shopGroups = data.reduce((acc, row) => {
    const key = `${row.Brand}|${row.Channel}|${row.Shop_Name}`
    if (!acc[key]) {
      acc[key] = { brand: row.Brand, channel: row.Channel, shop: row.Shop_Name, data: [] }
    }
    acc[key].data.push(row)
    return acc
  }, {} as Record<string, { brand: string; channel: string; shop: string; data: ProcessedShopData[] }>)
  
  // 计算 YOY
  const results: ShopYOY[] = []
  
  for (const [_, group] of Object.entries(shopGroups)) {
    const data2024 = group.data.find(d => d.Year === COMPARE_YEARS.PREVIOUS)
    const data2025 = group.data.find(d => d.Year === COMPARE_YEARS.CURRENT)
    
    if (!data2025) continue
    
    const isNewShop = newShops.has(group.shop)
    
    const returnRate2024 = data2024?.Return_Rate_YTD || 0
    const returnRate2025 = data2025.Return_Rate_YTD
    const sales2024 = data2024?.Net_Sales || 0
    const sales2025 = data2025.Net_Sales
    const salesK2024 = sales2024 / 1000
    const salesK2025 = sales2025 / 1000
    
    let salesYOYPct = 0
    let salesYOYK = 0
    let returnYOY = 0
    
    if (!isNewShop && data2024) {
      salesYOYPct = ((sales2025 - sales2024) / sales2024) * 100
      salesYOYK = salesK2025 - salesK2024
      returnYOY = returnRate2025 - returnRate2024
    }
    
    const riskLevel = calculateRiskLevel(isNewShop, salesYOYPct, returnYOY)
    
    results.push({
      Brand: group.brand,
      Channel: group.channel,
      Shop_Name: group.shop,
      Return_Rate_2024: Number(returnRate2024.toFixed(DECIMAL_PLACES.return_rate)),
      Return_Rate_2025: Number(returnRate2025.toFixed(DECIMAL_PLACES.return_rate)),
      Sales_2024: sales2024,
      Sales_2025: sales2025,
      Sales_K_2024: Number(salesK2024.toFixed(DECIMAL_PLACES.sales_k)),
      Sales_K_2025: Number(salesK2025.toFixed(DECIMAL_PLACES.sales_k)),
      Sales_YOY_Pct: Number(salesYOYPct.toFixed(DECIMAL_PLACES.yoy_pct)),
      Sales_YOY_K: Number(salesYOYK.toFixed(DECIMAL_PLACES.sales_k)),
      Return_YOY: Number(returnYOY.toFixed(DECIMAL_PLACES.return_rate)),
      Is_New_Shop: isNewShop,
      Risk_Level: riskLevel,
      Suggestion: RISK_SUGGESTIONS[riskLevel]
    })
  }
  
  return results
}

/**
 * 计算渠道汇总
 */
export function calculateChannelSummary(shopYOY: ShopYOY[]): ChannelSummary[] {
  const comparable = shopYOY.filter(shop => !shop.Is_New_Shop)
  
  // 按渠道分组
  const channelGroups = comparable.reduce((acc, shop) => {
    if (!acc[shop.Channel]) {
      acc[shop.Channel] = []
    }
    acc[shop.Channel].push(shop)
    return acc
  }, {} as Record<string, ShopYOY[]>)
  
  const results: ChannelSummary[] = []
  
  for (const [channel, shops] of Object.entries(channelGroups)) {
    const salesK2025 = shops.reduce((sum, s) => sum + s.Sales_K_2025, 0)
    const salesK2024 = shops.reduce((sum, s) => sum + s.Sales_K_2024, 0)
    const salesYOYK = salesK2025 - salesK2024
    const salesYOYPct = ((salesK2025 - salesK2024) / salesK2024) * 100
    
    // 加权平均退货率
    const weightedReturn2024 = shops.reduce((sum, s) => sum + s.Return_Rate_2024 * s.Sales_K_2024, 0)
    const weightedReturn2025 = shops.reduce((sum, s) => sum + s.Return_Rate_2025 * s.Sales_K_2025, 0)
    
    const returnRate2025 = weightedReturn2025 / salesK2025
    const returnRate2024 = weightedReturn2024 / salesK2024
    const returnYOY = returnRate2025 - returnRate2024
    
    results.push({
      Channel: channel,
      Sales_K_2025: Number(salesK2025.toFixed(DECIMAL_PLACES.sales_k)),
      Sales_K_2024: Number(salesK2024.toFixed(DECIMAL_PLACES.sales_k)),
      Sales_YOY_K: Number(salesYOYK.toFixed(DECIMAL_PLACES.sales_k)),
      Sales_YOY_Pct: Number(salesYOYPct.toFixed(DECIMAL_PLACES.yoy_pct)),
      Return_Rate_2025: Number(returnRate2025.toFixed(DECIMAL_PLACES.return_rate)),
      Return_YOY: Number(returnYOY.toFixed(DECIMAL_PLACES.return_rate)),
      Shop_Count: shops.length,
      Has_Risk: salesYOYPct < 0 || returnYOY > 0
    })
  }
  
  return results.sort((a, b) => b.Sales_K_2025 - a.Sales_K_2025)
}

/**
 * 获取品牌统计
 */
export function getBrandStats(shopYOY: ShopYOY[]): Record<string, BrandStats> {
  const brands = [...new Set(shopYOY.map(s => s.Brand))]
  
  return brands.reduce((acc, brand) => {
    const brandShops = shopYOY.filter(s => s.Brand === brand)
    
    acc[brand] = {
      total_shops: brandShops.length,
      new_shops: brandShops.filter(s => s.Is_New_Shop).length,
      high_risk_shops: brandShops.filter(s => s.Risk_Level === RISK_LEVELS.HIGH).length,
      watch_shops: brandShops.filter(s => s.Risk_Level === RISK_LEVELS.WATCH).length,
      total_sales_2025: brandShops.reduce((sum, s) => sum + s.Sales_K_2025, 0),
      avg_return_rate_2025: brandShops.reduce((sum, s) => sum + s.Return_Rate_2025, 0) / brandShops.length
    }
    
    return acc
  }, {} as Record<string, BrandStats>)
}
