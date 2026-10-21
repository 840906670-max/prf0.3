# 个人简历微信小程序壳

这个目录是当前个人简历网页的微信小程序 `web-view` 外壳。网页主体仍然由
`https://prf0-3.pages.dev/` 提供，因此现有的视觉效果和手机端互动逻辑不需要重写。

## 导入步骤

1. 安装并打开微信开发者工具。
2. 选择“导入项目”，项目目录选择当前 `wechat-miniprogram` 文件夹。
3. 将 `project.config.json` 里的 `touristappid` 替换成你自己的小程序 AppID。
4. 在微信公众平台的“开发管理 → 开发设置 → 业务域名”中添加 `prf0-3.pages.dev`。
5. 点击“编译”检查模拟器，再点击“预览”并用手机微信扫码测试。

## 发布前检查

- `https://prf0-3.pages.dev/` 必须保持可访问。
- 业务域名必须配置成功，不能使用 `localhost` 或 `127.0.0.1`。
- 真机确认图片触摸、页面滚动和网页内动画均正常后，再上传版本。

`project.private.config.json.example` 仅作参考。若需要本地保存个人 AppID，复制成
`project.private.config.json` 后填写即可；该私有文件不应提交密码或 AppSecret。
