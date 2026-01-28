"""
EC退货率数据处理脚本
功能：读取CSV -> 品牌映射 -> YOY计算 -> 风险评估 -> 输出JSON
"""

import pandas as pd
import json
import re
from pathlib import Path

# ==================== 配置 ====================
CSV_PATH = r'D:\HQ文件夹data\EC退货率\EC退货率变化.csv'
OUTPUT_PATH = Path(__file__).parent.parent / 'public' / 'data' / 'processed_data.json'

# 品牌映射规则（剔除DV\SP店铺）
BRAND_MAPPING = {
    'MLB': ['MLB', 'MM', 'ML '],
    'MLB KIDS': ['MK', 'MLBKIDS'],
    'Discovery': ['DX']
    # 已剔除: '经营支援': ['SP', 'DV']
}

# ==================== 工具函数 ====================

def map_brand(shop_name):
    """根据店铺名称映射品牌"""
    if pd.isna(shop_name):
        return None
    
    shop_upper = str(shop_name).upper()
    
    for brand, keywords in BRAND_MAPPING.items():
        if any(kw.upper() in shop_upper for kw in keywords):
            return brand
    
    return None  # 不匹配任何品牌则剔除


def clean_number(val):
    """清洗数字格式（去除逗号、空格）"""
    if pd.isna(val) or val == '-' or val == ' -   ':
        return None
    
    if isinstance(val, (int, float)):
        return float(val)
    
    if isinstance(val, str):
        val = val.replace(',', '').replace(' ', '').strip()
        try:
            return float(val)
        except:
            return None
    
    return None


def clean_percentage(val):
    """清洗百分比格式"""
    if pd.isna(val) or val == '-':
        return None
    
    if isinstance(val, str):
        val = val.replace('%', '').strip()
    
    try:
        return float(val) / 100  # 转换为小数
    except:
        return None


def assess_risk(sales_yoy_pct, sales_yoy_amount, return_rate_yoy, is_new_store):
    """
    风险评估逻辑（修订版）
    - 高风险: 销售下降 且 退货率上升
    - 风险: 销售上升 但 退货率上升幅度大于销售增长幅度
    - 观察: 销售上升 退货率也增长但增幅小于销售增长幅度
    - 正常: 其他情形
    """
    if is_new_store:
        return '新开店｜不可比', '关注新店铺运营质量和退货率趋势'
    
    if sales_yoy_amount is None or return_rate_yoy is None or sales_yoy_pct is None:
        return '数据不全', '需补充数据'
    
    # 🚨 高风险：销售下降 且 退货率上升
    if sales_yoy_amount < 0 and return_rate_yoy > 0:
        suggestion = '建议检查：商品质量、物流时效、尺码准确性、退货政策'
        return '🚨 高风险', suggestion
    
    # 🔴 风险：销售上升 但 退货率上升幅度大于销售增长幅度
    if sales_yoy_pct > 0 and return_rate_yoy > 0 and return_rate_yoy > sales_yoy_pct:
        suggestion = '退货率增长超过销售增长，建议优化：商品质量、物流服务、售后政策'
        return '🔴 风险', suggestion
    
    # ⚠️ 观察：销售上升 退货率也增长但增幅小于销售增长幅度
    if sales_yoy_pct > 0 and return_rate_yoy > 0 and return_rate_yoy <= sales_yoy_pct:
        suggestion = '销售增长快于退货率增长，持续监控退货率变化趋势'
        return '⚠️ 观察', suggestion
    
    # ✅ 正常：其他情形
    return '✅ 正常', '保持当前运营策略'


# ==================== 主处理流程 ====================

def process_data():
    """主数据处理函数"""
    
    print('='*60)
    print('🚀 开始处理数据...')
    print('='*60)
    
    # 1. 读取CSV
    print(f'\n📂 读取文件: {CSV_PATH}')
    try:
        df = pd.read_csv(CSV_PATH, encoding='utf-8')
    except Exception as e:
        print(f'❌ 读取文件失败: {e}')
        return
    
    print(f'✅ 成功读取 {len(df)} 行数据')
    
    # 2. 清洗列名
    df.columns = df.columns.str.strip()
    print(f'\n📋 列名: {list(df.columns)}')
    
    # 3. 处理每一行数据
    processed_data = []
    skipped_count = 0
    
    for idx, row in df.iterrows():
        # 跳过空行
        if pd.isna(row['渠道']) or str(row['渠道']).strip() == '':
            continue
        
        channel = str(row['渠道']).strip()
        shop_name = str(row['店铺']).strip()
        
        # 品牌映射
        brand = map_brand(shop_name)
        if brand is None:
            skipped_count += 1
            continue  # 剔除未映射的店铺
        
        # 清洗数据
        sales_2025 = clean_number(row['2025年净销售'])
        sales_2024 = clean_number(row['2024年净销售'])
        return_rate_2025 = clean_percentage(row['2025年YTD-退货率'])
        return_rate_2024 = clean_percentage(row['2024年YTD-退货率'])
        
        # 判断新开店
        is_new_store = (sales_2024 is None or sales_2024 == 0)
        
        # 计算YOY
        if is_new_store:
            sales_yoy_pct = None
            sales_yoy_amount = None
            return_rate_yoy = None
        else:
            sales_yoy_amount = sales_2025 - sales_2024 if sales_2025 and sales_2024 else None
            sales_yoy_pct = (sales_yoy_amount / sales_2024 * 100) if sales_2024 != 0 else None
            return_rate_yoy = ((return_rate_2025 - return_rate_2024) * 100) if (return_rate_2025 is not None and return_rate_2024 is not None) else None
        
        # 风险评估（传入sales_yoy_pct参数）
        risk_level, suggestion = assess_risk(sales_yoy_pct, sales_yoy_amount, return_rate_yoy, is_new_store)
        
        # 构建数据项
        processed_data.append({
            'channel': channel,
            'shop_name': shop_name,
            'brand': brand,
            'year_2025': {
                'net_sales': sales_2025,
                'return_rate': return_rate_2025
            },
            'year_2024': {
                'net_sales': sales_2024,
                'return_rate': return_rate_2024
            },
            'yoy': {
                'sales_amount': sales_yoy_amount,
                'sales_pct': sales_yoy_pct,
                'return_rate': return_rate_yoy
            },
            'risk_level': risk_level,
            'suggestion': suggestion,
            'is_new_store': is_new_store
        })
    
    # 4. 统计信息
    print(f'\n📊 处理结果:')
    print(f'   ✅ 成功处理: {len(processed_data)} 家店铺')
    print(f'   ❌ 剔除店铺: {skipped_count} 家（未匹配品牌规则）')
    
    # 按品牌统计
    brand_stats = {}
    for item in processed_data:
        brand = item['brand']
        if brand not in brand_stats:
            brand_stats[brand] = 0
        brand_stats[brand] += 1
    
    print(f'\n🏷️  品牌分布:')
    for brand, count in brand_stats.items():
        print(f'   - {brand}: {count} 家店铺')
    
    # 风险店铺统计
    risk_stats = {}
    for item in processed_data:
        risk = item['risk_level']
        risk_stats[risk] = risk_stats.get(risk, 0) + 1
    
    print(f'\n⚠️  风险统计:')
    for risk, count in risk_stats.items():
        print(f'   - {risk}: {count} 家')
    
    # 5. 保存JSON
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=2)
    
    print(f'\n✅ 数据已保存至: {OUTPUT_PATH}')
    print('='*60)
    print('🎉 处理完成！')
    print('='*60)


# ==================== 执行 ====================

if __name__ == '__main__':
    process_data()
