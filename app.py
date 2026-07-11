"""
ModelScope Studio 入口文件
启动 FastAPI 应用
"""
import os
import sys
import uvicorn

# 确保当前目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入主应用
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
