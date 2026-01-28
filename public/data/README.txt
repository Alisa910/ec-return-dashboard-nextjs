数据目录说明
====================

此目录用于存放处理后的JSON数据文件。

使用步骤：
---------

1. 确保CSV文件存在：
   D:\HQ文件夹data\EC退货率\EC退货率变化.csv

2. 运行数据处理脚本：
   python scripts/convertData.py
   
   或双击运行：📊处理数据.bat

3. 生成的文件：
   processed_data.json

⚠️ 注意：
- 必须先运行Python脚本生成数据，Dashboard才能正常显示
- 每次更新CSV后，需要重新运行数据处理脚本
- processed_data.json 需要提交到Git，否则部署后无数据

文件格式：
----------
processed_data.json 包含所有店铺的处理后数据，格式为JSON数组。

如有问题，请查看项目根目录的 README.md
