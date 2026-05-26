// app.js
App({
  onLaunch: function () {
    this.globalData = {
      env: "", // 暂未配置云环境ID，云功能暂时关闭
    };

    // ✅ 修复：env为空时跳过云初始化，避免timeout报错
    if (!wx.cloud) {
      console.log("当前基础库不支持云开发，跳过初始化");
    } else if (this.globalData.env && this.globalData.env !== "") {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
      console.log("云开发初始化成功，环境ID：", this.globalData.env);
    } else {
      console.log("云环境ID未配置，跳过云初始化，不影响基础功能使用");
    }
  },
});
