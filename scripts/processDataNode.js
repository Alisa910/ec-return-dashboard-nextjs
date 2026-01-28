/**
 * Node.js版本的数据处理脚本
 * 功能：读取CSV -> 品牌映射 -> YOY计算 -> 风险评估 -> 输出JSON
 */

const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================
const CSV_PATH = 'D:\\HQ文件夹data\\EC退货率\\EC退货率变化.csv';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'processed_data.json');

// 品牌映射规则（剔除DV\SP店铺）
const BRAND_MAPPING = {
  'MLB': ['MLB', 'MM', 'ML '],
  'MLB KIDS': ['MK', 'MLBKIDS'],
  'Discovery': ['DX']
  // 已剔除: '经营支援': ['SP', 'DV']
};

// ==================== 工具函数 ====================

function mapBrand(shopName) {
  if (!shopName) return null;
  
  const shopUpper = shopName.toUpperCase();
  
  for (const [brand, keywords] of Object.entries(BRAND_MAPPING)) {
    if (keywords.some(kw => shopUpper.includes(kw.toUpperCase()))) {
      return brand;
    }
  }
  
  return null;
}

function cleanNumber(val) {
  if (!val || val === '-' || val === ' -   ') return null;
  
  if (typeof val === 'number') return val;
  
  if (typeof val === 'string') {
    val = val.replace(/,/g, '').replace(/\s/g, '').trim();
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }
  
  return null;
}

function cleanPercentage(val) {
  if (!val || val === '-') return null;
  
  if (typeof val === 'string') {
    val = val.replace('%', '').trim();
  }
  
  const num = parseFloat(val);
  return isNaN(num) ? null : num / 100;
}

function assessRisk(salesYoyPct, salesYoyAmount, returnRateYoy, isNewStore) {
  if (isNewStore) {
    return ['新开店｜不可比', '关注新店铺运营质量和退货率趋势'];
  }
  
  if (salesYoyAmount === null || returnRateYoy === null || salesYoyPct === null) {
    return ['数据不全', '需补充数据'];
  }
  
  // 🚨 高风险：销售下降 且 退货率上升
  if (salesYoyAmount < 0 && returnRateYoy > 0) {
    return ['🚨 高风险', '建议检查：商品质量、物流时效、尺码准确性、退货政策'];
  }
  
  // 🔴 风险：销售上升 但 退货率上升幅度大于销售增长幅度
  if (salesYoyPct > 0 && returnRateYoy > 0 && returnRateYoy > salesYoyPct) {
    return ['🔴 风险', '退货率增长超过销售增长，建议优化：商品质量、物流服务、售后政策'];
  }
  
  // ⚠️ 观察：销售上升 退货率也增长但增幅小于销售增长幅度
  if (salesYoyPct > 0 && returnRateYoy > 0 && returnRateYoy <= salesYoyPct) {
    return ['⚠️ 观察', '销售增长快于退货率增长，持续监控退货率变化趋势'];
  }
  
  // ✅ 正常：其他情形
  return ['✅ 正常', '保持当前运营策略'];
}

function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// ==================== 主处理流程 ====================

function processData() {
  console.log('============================================================');
  console.log('🚀 开始处理数据...');
  console.log('============================================================\n');
  
  // 1. 读取CSV
  console.log(`📂 读取文件: ${CSV_PATH}`);
  
  let csvContent;
  try {
    csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  } catch (error) {
    console.error(`❌ 读取文件失败: ${error.message}`);
    return;
  }
  
  const rawData = parseCSV(csvContent);
  console.log(`✅ 成功读取 ${rawData.length} 行数据\n`);
  
  // 3. 处理每一行数据
  const processedData = [];
  let skippedCount = 0;
  
  for (const row of rawData) {
    const channel = (row['渠道'] || '').trim();
    const shopName = (row['店铺'] || '').trim();
    
    if (!channel || !shopName) continue;
    
    // 品牌映射
    const brand = mapBrand(shopName);
    if (brand === null) {
      skippedCount++;
      continue;
    }
    
    // 清洗数据
    const sales2025 = cleanNumber(row['2025年净销售']);
    const sales2024 = cleanNumber(row['2024年净销售']);
    const returnRate2025 = cleanPercentage(row['2025年YTD-退货率']);
    const returnRate2024 = cleanPercentage(row['2024年YTD-退货率']);
    
    // 判断新开店
    const isNewStore = (sales2024 === null || sales2024 === 0);
    
    // 计算YOY
    let salesYoyPct = null;
    let salesYoyAmount = null;
    let returnRateYoy = null;
    
    if (!isNewStore) {
      salesYoyAmount = sales2025 !== null && sales2024 !== null ? sales2025 - sales2024 : null;
      salesYoyPct = salesYoyAmount !== null && sales2024 !== 0 ? (salesYoyAmount / sales2024 * 100) : null;
      returnRateYoy = returnRate2025 !== null && returnRate2024 !== null ? ((returnRate2025 - returnRate2024) * 100) : null;
    }
    
    // 风险评估
    const [riskLevel, suggestion] = assessRisk(salesYoyPct, salesYoyAmount, returnRateYoy, isNewStore);
    
    // 构建数据项
    processedData.push({
      channel,
      shop_name: shopName,
      brand,
      year_2025: {
        net_sales: sales2025,
        return_rate: returnRate2025
      },
      year_2024: {
        net_sales: sales2024,
        return_rate: returnRate2024
      },
      yoy: {
        sales_amount: salesYoyAmount,
        sales_pct: salesYoyPct,
        return_rate: returnRateYoy
      },
      risk_level: riskLevel,
      suggestion,
      is_new_store: isNewStore
    });
  }
  
  console.log(`\n✅ 处理完成！共处理 ${processedData.length} 家店铺`);
  console.log(`❌ 跳过 ${skippedCount} 家未映射品牌的店铺\n`);
  
  // 统计风险分布
  const riskStats = {};
  processedData.forEach(item => {
    riskStats[item.risk_level] = (riskStats[item.risk_level] || 0) + 1;
  });
  
  console.log('📊 风险分布:');
  Object.entries(riskStats).forEach(([level, count]) => {
    console.log(`   ${level}: ${count} 家`);
  });
  
  // 5. 输出JSON
  try {
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedData, null, 2), 'utf-8');
    console.log(`\n💾 数据已保存到: ${OUTPUT_PATH}`);
    console.log('✅ 数据处理完成！');
  } catch (error) {
    console.error(`❌ 保存文件失败: ${error.message}`);
  }
  
  console.log('\n============================================================');
}

// 执行处理
processData();
