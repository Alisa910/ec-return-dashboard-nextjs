// 配置文件 - 品牌映射规则和常量

export const BRAND_MAPPING: Record<string, string[]> = {
  'MLB': ['MLB', 'MM', 'ML', 'VIPMLB'],
  'MLB KIDS': ['MK', 'MLBKIDS', 'VIPMLBkids'],
  'Discovery': ['DX', 'DV', 'SP', 'VIPDV', 'VIPSP']
}

export const COMPARE_YEARS = {
  CURRENT: 2025,
  PREVIOUS: 2024
}

export const RISK_LEVELS = {
  HIGH: '🚨 高风险',
  WATCH: '⚠️ 观察',
  NORMAL: '✅ 正常',
  NEW_SHOP: '🆕 新开店'
} as const

export const RISK_SUGGESTIONS: Record<string, string> = {
  '🚨 高风险': '建议：1) 排查物流时效问题 2) 检查尺码准确性 3) 进行质量抽检',
  '⚠️ 观察': '建议：持续监控退货原因，优化商品详情页展示',
  '✅ 正常': '保持当前运营策略，继续优化用户体验',
  '🆕 新开店': '新开店铺，暂无历史数据对比'
}

export const DATA_FILE_PATH = '/data/EC退货率变化.csv'

export const DECIMAL_PLACES = {
  return_rate: 2,
  sales_k: 1,
  yoy_pct: 2
}
