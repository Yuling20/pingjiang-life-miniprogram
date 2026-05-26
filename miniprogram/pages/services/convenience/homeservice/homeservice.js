// miniprogram/pages/services/convenience/homeservice/homeservice.js
Page({
  data: {
    // 服务分类
    categoryList: [
      { id: 0, name: '全部' },
      { id: 1, name: '家政保洁' },
      { id: 2, name: '水电维修' },
      { id: 3, name: '家电维修' },
      { id: 4, name: '搬家服务' },
      { id: 5, name: '其他' }
    ],
    currentCategory: 0,

    // 区域筛选
    areaList: ['全部区域', '城关镇', '三阳乡', '安定镇', '嘉义镇'],
    currentArea: 0,

    // 服务列表
    allServiceList: [
      {
        id: 1,
        name: '刘师傅专业水电维修',
        category: 2,
        categoryName: '水电维修',
        area: '城关镇',
        areaIndex: 1,
        avatar: '',
        intro: '水管漏水、电路改造、插座安装、灯具更换，专业上门，当天可到。',
        price: '50元起/次',
        phone: '13812345678',
        tags: ['当天上门', '持证上岗', '价格透明'],
        experience: '8年经验',
        rating: 4.9,
        orderCount: 236,
        publishTime: '今天'
      },
      {
        id: 2,
        name: '洁美家政保洁服务',
        category: 1,
        categoryName: '家政保洁',
        area: '城关镇',
        areaIndex: 1,
        avatar: '',
        intro: '日常保洁、深度清洁、开荒保洁、厨卫专项清洁，团队作业效率高。',
        price: '80元/次起',
        phone: '13987654321',
        tags: ['专业团队', '放心入户', '按时到达'],
        experience: '5年经验',
        rating: 4.8,
        orderCount: 158,
        publishTime: '今天'
      },
      {
        id: 3,
        name: '老王家电维修',
        category: 3,
        categoryName: '家电维修',
        area: '三阳乡',
        areaIndex: 2,
        avatar: '',
        intro: '空调、冰箱、洗衣机、热水器维修，原装配件，不修不收费。',
        price: '上门费30元',
        phone: '15012345678',
        tags: ['不修不收费', '原装配件', '免费检测'],
        experience: '12年经验',
        rating: 4.7,
        orderCount: 412,
        publishTime: '昨天'
      },
      {
        id: 4,
        name: '平江快捷搬家公司',
        category: 4,
        categoryName: '搬家服务',
        area: '城关镇',
        areaIndex: 1,
        avatar: '',
        intro: '小件搬运、整房搬迁、钢琴搬运，车辆齐全，轻拿轻放，支持预约。',
        price: '200元起',
        phone: '18812345678',
        tags: ['车辆多', '轻拿轻放', '可预约'],
        experience: '6年经验',
        rating: 4.6,
        orderCount: 89,
        publishTime: '2天前'
      }
    ],

    filteredList: [],
    showList: []
  },

  onLoad() {
    this.filterList();
  },

  // 切换分类
  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id });
    this.filterList();
  },

  // 切换区域
  switchArea(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentArea: index });
    this.filterList();
  },

  // 过滤列表
  filterList() {
    const { allServiceList, currentCategory, currentArea } = this.data;
    let list = [...allServiceList];
    if (currentCategory !== 0) {
      list = list.filter(item => item.category === currentCategory);
    }
    if (currentArea !== 0) {
      list = list.filter(item => item.areaIndex === currentArea);
    }
    this.setData({ showList: list });
  },

  // 拨打电话
  callPhone(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.showActionSheet({
      itemList: [`拨打 ${phone}`],
      success: () => {
        wx.makePhoneCall({ phoneNumber: phone });
      }
    });
  },

  // 发布需求
  publishDemand() {
    wx.showToast({ title: '发布功能即将上线', icon: 'none' });
  }
});
