// 数据转换脚本：将原始 CSV 格式转换为程序需要的格式
// 适配新格式：列名包含年份前缀（如 2025年YTD-退货率）

const fs = require('fs');
const path = require('path');

// 渠道代码映射
const channelMap = {
  'TM': '天猫旗舰店',
  'JD': '京东自营',
  'DY': '抖音电商',
  'WeChat': '微信商城',
  'VIP': '唯品会'
};

// 手动解析CSV行（处理带引号的字段）
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

// 读取原始数据
const inputPath = path.join(__dirname, '../public/data/EC退货率变化_原始.csv');
const outputPath = path.join(__dirname, '../public/data/EC退货率变化.csv');

console.log('========================================');
console.log('  EC退货率数据转换工具');
console.log('========================================');
console.log('');
console.log('输入文件:', inputPath);
console.log('输出文件:', outputPath);
console.log('');
console.log('开始转换数据...');
console.log('');

try {
  const content = fs.readFileSync(inputPath, 'utf-8');
  const lines = content.split('\n');
  
  // 跳过第1行表头，从第2行开始处理
  const dataLines = lines.slice(1).filter(line => line.trim() && !line.trim().startsWith('YTD'));
  
  const outputData = [];
  
  // 添加新的CSV表头
  outputData.push('Year,Channel,Shop_Name,Return_Rate_YTD,Net_Sales');
  
  let successCount = 0;
  let skipCount = 0;
  
  dataLines.forEach((line, index) => {
    const cols = parseCSVLine(line);
    
    // 跳过空行和注释行
    if (!cols[0] || !cols[1] || cols[1].includes('退货率') || cols[0].length > 10) {
      skipCount++;
      return;
    }
    
    const channelCode = cols[0];
    const shopName = cols[1];
    const channel = channelMap[channelCode] || channelCode;
    
    // 新格式：列索引
    // 列0: 渠道
    // 列1: 店铺
    // 列2: 2025年BOS发货金额
    // 列3: 2025年BOS退货金额
    // 列4: 2025年YTD-退货率
    // 列5: 2025年净销售
    // 列6: 2024年BOS发货金额
    // 列7: 2024年BOS退货金额
    // 列8: 2024年YTD-退货率
    // 列9: 2024年净销售
    
    // FY2025 数据
    const return2025Raw = cols[4] ? cols[4].replace('%', '').trim() : '';
    const sales2025Raw = cols[5] ? cols[5].replace(/,/g, '').replace(/\s/g, '') : '';
    
    const return2025 = return2025Raw ? parseFloat(return2025Raw) : 0;
    const sales2025 = sales2025Raw ? parseFloat(sales2025Raw) : 0;
    
    // FY2024 数据
    const return2024Raw = cols[8] ? cols[8].replace('%', '').trim() : '';
    const sales2024Raw = cols[9] ? cols[9].replace(/,/g, '').replace(/\s/g, '').replace(/-/g, '') : '';
    
    const return2024 = return2024Raw ? parseFloat(return2024Raw) : 0;
    const sales2024 = sales2024Raw ? parseFloat(sales2024Raw) : 0;
    
    console.log(`[${index + 1}] ${channel} - ${shopName}`);
    console.log(`    2025: 退货率=${return2025}%, 销售=¥${sales2025.toLocaleString()}`);
    console.log(`    2024: 退货率=${return2024}%, 销售=¥${sales2024.toLocaleString()}`);
    
    // 只有当2025年有数据时才添加
    if (sales2025 > 0 && return2025 > 0) {
      // 如果2024年有数据，添加2024行
      if (sales2024 > 0 && return2024 > 0) {
        outputData.push(`2024,${channel},${shopName},${return2024},${sales2024}`);
        successCount++;
      }
      
      // 添加2025行
      outputData.push(`2025,${channel},${shopName},${return2025},${sales2025}`);
      successCount++;
      console.log(`    ✅ 已转换`);
    } else {
      console.log(`    ⚠️  数据不完整，已跳过`);
      skipCount++;
    }
    console.log('');
  });
  
  // 写入转换后的文件
  fs.writeFileSync(outputPath, outputData.join('\n'), 'utf-8');
  
  console.log('========================================');
  console.log('✅ 数据转换完成！');
  console.log('========================================');
  console.log(`转换成功: ${successCount} 行`);
  console.log(`已跳过: ${skipCount} 行`);
  console.log(`总计行数: ${outputData.length - 1} 行（不含表头）`);
  console.log('');
  console.log('输出文件:', outputPath);
  console.log('========================================');
  
} catch (error) {
  console.error('');
  console.error('========================================');
  console.error('❌ 转换失败！');
  console.error('========================================');
  console.error('错误信息:', error.message);
  console.error('');
  console.error('详细堆栈:');
  console.error(error.stack);
  console.error('========================================');
  process.exit(1);
}
