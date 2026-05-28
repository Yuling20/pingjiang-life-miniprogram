// app.js
App({
  onLaunch: function () {
    console.log('平江汇生活小程序启动');

    // 云开发初始化（如已开通云开发则保留，否则可删除这段）
    // wx.cloud.init({ env: '你的云环境ID', traceUser: true })
  },

  globalData: {
    userInfo: null,
    // 豆包API配置（临时放这里，上线前移到云函数）
    doubaoConfig: {
      apiKey: 'ark-daf061d4-f178-4bb6-83a4-d6768fd152d1-f010c',   // ⚠️ 替换成控制台复制的真实Key
      endpoint: 'ep-20260526225719-ntbpw',
      model: 'doubao-seed-2-0-mini-250428'
    }
  }
});
