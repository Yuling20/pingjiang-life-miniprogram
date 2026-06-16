// pages/services/convenience/convenience.js
Page({
  data: {
    currentType: '',
    pageTitle: '',

    // 找工作数据（原样保留）
    jobList: [
      { id: 1, name: '超市收银员', salary: '3000-4000元/月', company: '平江县联华超市', tags: '五险 · 包午餐 · 双休' },
      { id: 2, name: '保安', salary: '2800-3500元/月', company: '平江县物业管理公司', tags: '包住 · 统一制服' },
      { id: 3, name: '家政阿姨', salary: '150-200元/天', company: '居民个人招聘', tags: '灵活上班 · 按天结算' },
      { id: 4, name: '厂务工人', salary: '4000-6000元/月', company: '平江县纺织厂', tags: '计件 · 包三餐 · 有宿舍' }
    ],

    // 房屋租售（原样保留）
    houseList: [
      { id: 1, title: '3室2厅 精装出租', price: '1500元/月', desc: '平江县城区，近菜市场，家电齐全', contact: '138xxxx1234' },
      { id: 2, title: '2室1厅 出售', price: '28万元', desc: '城区老小区，步梯4楼，采光好', contact: '139xxxx5678' },
      { id: 3, title: '门面出租', price: '3000元/月', desc: '步行街旁，适合餐饮小吃', contact: '136xxxx9012' }
    ],

    // 停水停电（原样保留）
    waterList: [
      { id: 1, type: 'water', typeName: '停水', title: '城区检修停水通知', time: '5月26日 8:00-18:00', area: '建设路、文明路沿线' },
      { id: 2, type: 'electric', typeName: '停电', title: '线路维护停电通知', time: '5月27日 9:00-15:00', area: '南江路、河西小区' },
      { id: 3, type: 'water', typeName: '停水', title: '管网改造停水通知', time: '5月30日 全天', area: '城东新区' }
    ],

    // 医院（原样保留）
    hospitalList: [
      { id: 1, name: '平江县人民医院', address: '平江县城关镇长寿路', phone: '0730-6822120' },
      { id: 2, name: '平江县中医医院', address: '平江县城关镇胜利街', phone: '0730-6822456' },
      { id: 3, name: '平江县妇幼保健院', address: '平江县城关镇建设路', phone: '0730-6822789' }
    ],

    // ★ 办事指南：换成真实电话，移除底部不可点击的"平江县政务服务大厅" ★
    govList: [
      { id: 1, name: '补办身份证',       desc: '身份证挂失、补办业务',       phone: '0730-6288038' },
      { id: 2, name: '驾驶证业务管理',   desc: '驾驶证办理、考试预约',       phone: '0730-6260068' },
      { id: 3, name: '社会保险查询',     desc: '参保缴费、社保记录查询',     phone: '0730-6296626' },
      { id: 4, name: '住房公积金查询',   desc: '公积金账户、贷款查询',       phone: '0730-6667389' },
      { id: 5, name: '医疗保障查询',     desc: '医保参保、报销政策查询',     phone: '0730-6667543' },
      { id: 6, name: '不动产登记查询',   desc: '房产证办理、过户手续',       phone: '0730-6286245' },
      { id: 7, name: '平江县人民政府政务网', desc: '政务信息、网上办事大厅', phone: '0730-6266878' }
    ],

    // 家政维修（原样保留）
    repairList: [
      { id: 1, name: '李师傅', score: '4.9', skill: '水电维修、管道疏通', phone: '138xxxx1111' },
      { id: 2, name: '王阿姨', score: '4.8', skill: '家政保洁、月嫂服务', phone: '139xxxx2222' },
      { id: 3, name: '张师傅', score: '4.7', skill: '家电维修、空调安装', phone: '136xxxx3333' }
    ]
  },

  onLoad(options) {
    const type = options.type || 'job'
    const titleMap = {
      job:      '找工作',
      house:    '房屋租售',
      repair:   '家政维修',
      water:    '停水停电',
      gov:      '办事指南',
      hospital: '医院专区',
      bus:      '公交查询',
      market:   '集市信息'
    }
    this.setData({
      currentType: type,
      pageTitle:   titleMap[type] || '便民服务'
    })
  },

  // 拨打电话（原样保留）
  makeCall(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  }
})
