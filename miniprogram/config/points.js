/**
 * 全局积分配置
 * 本地配置版本 v1.0
 * 规则：不可提现、不可转让，有效期12个月，单账号单日获取上限200积分
 */

const POINTS_CONFIG = {

  // ─────────────────────────────────────────
  // 一、基础规则
  // ─────────────────────────────────────────
  BASE_RULES: {
    canWithdraw: false,           // 不可提现
    canTransfer: false,           // 不可转让
    validityMonths: 12,           // 有效期12个月
    dailyEarnLimit: 200,          // 单账号单日获取上限（积分）
  },

  // ─────────────────────────────────────────
  // 二、积分获取规则
  // ─────────────────────────────────────────
  EARN_RULES: {

    // 1. 每日签到
    DAILY_SIGN: {
      key: 'daily_sign',
      label: '每日签到',
      points: 5,                  // 每次签到积分
      dailyLimit: 1,              // 每日次数上限
      bonusRule: {
        consecutiveDays: 7,       // 连续签到满N天
        bonusPoints: 10,          // 当日额外奖励积分
      },
      desc: '每日签到+5积分，连续签到满7天当日额外+10积分',
    },

    // 2. 新用户注册
    NEW_USER_REGISTER: {
      key: 'new_user_register',
      label: '新用户注册',
      points: 100,                // 一次性奖励积分
      onlyOnce: true,             // 仅首次
      dailyLimit: null,           // 无每日限制
      desc: '新用户注册一次性奖励100积分',
    },

    // 3. 完善手机号+实名认证
    PROFILE_COMPLETE: {
      key: 'profile_complete',
      label: '完善手机号+实名认证',
      points: 50,                 // 一次性奖励积分
      onlyOnce: true,             // 仅首次
      dailyLimit: null,
      desc: '完善手机号及实名认证一次性奖励50积分',
    },

    // 4. 贴吧板块发布帖子
    COMMUNITY_PUBLISH: {
      key: 'community_publish',
      label: '贴吧发布帖子',
      points: 10,                 // 每条积分
      dailyLimit: 2,              // 单日上限条数
      onlyOnce: false,
      module: 'community',        // 所属板块
      desc: '贴吧发布帖子+10积分/条，单日上限2条',
    },

    // 5. 孝亲守护板块发布备忘录/用药提醒
    ELDER_PUBLISH: {
      key: 'elder_publish',
      label: '孝亲守护发布备忘录/用药提醒',
      points: 10,                 // 每条积分
      dailyLimit: 2,              // 单日上限条数
      onlyOnce: false,
      module: 'elder',
      desc: '孝亲守护发布备忘录/用药提醒+10积分/条，单日上限2条',
    },

    // 6. 帖子被点赞/被评论（全平台通用）
    POST_LIKED_OR_COMMENTED: {
      key: 'post_liked_or_commented',
      label: '帖子被点赞/被评论',
      pointsMin: 1,               // 最低积分
      pointsMax: 2,               // 最高积分
      dailyTotalLimit: 50,        // 单日合计上限（积分）
      onlyOnce: false,
      modules: ['community', 'elder', 'job', 'rental'], // 全平台通用
      desc: '帖子被点赞/评论1~2积分/次，单日合计上限50积分（全平台通用）',
    },

    // 7. 帖子分享（全平台通用）
    POST_SHARE: {
      key: 'post_share',
      label: '帖子分享微信/朋友圈',
      points: 30,                 // 每次积分
      dailyLimit: 3,              // 单日上限次数
      onlyOnce: false,
      modules: ['community', 'elder', 'job', 'rental'],
      desc: '帖子分享微信/朋友圈+10积分/次，单日上限3次（全平台通用）',
    },

    // 8. 招聘/租房发帖（不得积分，仅消耗）
    JOB_RENTAL_PUBLISH: {
      key: 'job_rental_publish',
      label: '招聘/租房发布',
      points: 0,                  // 不奖励积分
      canEarn: false,             // 明确标识：不可获得积分
      mustPay: true,              // 必须付费（现金或积分）
      modules: ['job', 'rental'],
      desc: '招聘/租房发帖不赠送积分，发布须消耗积分或现金',
    },
  },

  // ─────────────────────────────────────────
  // 三、商业化定价配置
  // 现金=竞品6折；积分=现金×100
  // ─────────────────────────────────────────
  PRICING: {

    // 招聘/租房发布套餐
    PUBLISH_PACKAGES: [
      {
        id: 'publish_30d_basic',
        name: '30天基础曝光',
        durationDays: 30,
        type: 'basic',
        cashPrice: 6000,          // 单位：分（60元）
        pointsPrice: 6000,        // 积分
        desc: '帖子基础展示30天',
        tag: '',
      },
      {
        id: 'publish_60d_basic',
        name: '60天基础曝光',
        durationDays: 60,
        type: 'basic',
        cashPrice: 9000,          // 单位：分（90元）
        pointsPrice: 9000,
        desc: '帖子基础展示60天',
        tag: '推荐',
      },
      {
        id: 'publish_30d_social',
        name: '30天+社群推广',
        durationDays: 30,
        type: 'social',
        cashPrice: 18000,         // 单位：分（180元）
        pointsPrice: 18000,
        desc: '帖子基础展示30天+社群渠道推广',
        tag: '热门',
      },
      {
        id: 'publish_60d_social',
        name: '60天+社群推广',
        durationDays: 60,
        type: 'social',
        cashPrice: 30000,         // 单位：分（300元）
        pointsPrice: 30000,
        desc: '帖子基础展示60天+社群渠道推广',
        tag: '超值',
      },
    ],

    // 置顶套餐
    TOP_PACKAGES: [
      {
        id: 'top_1w',
        name: '置顶一周',
        durationDays: 7,
        cashPrice: 6000,          // 单位：分（60元）
        pointsPrice: 6000,
        desc: '帖子置顶展示7天',
        tag: '',
      },
      {
        id: 'top_1m',
        name: '置顶一月',
        durationDays: 30,
        cashPrice: 18000,         // 单位：分（180元）
        pointsPrice: 18000,
        desc: '帖子置顶展示30天',
        tag: '推荐',
      },
      {
        id: 'top_2m',
        name: '置顶两月',
        durationDays: 60,
        cashPrice: 30000,         // 单位：分（300元）
        pointsPrice: 30000,
        desc: '帖子置顶展示60天',
        tag: '热门',
      },
      {
        id: 'top_1y',
        name: '置顶全年',
        durationDays: 365,
        cashPrice: 168000,        // 单位：分（1680元）
        pointsPrice: 168000,
        desc: '帖子置顶展示365天',
        tag: '最优惠',
      },
    ],

    // 优惠券配置（预留，前端入口保留）
    COUPON: {
      enabled: true,              // 是否启用优惠券功能入口
      supportCashDeduct: true,    // 支持抵扣现金
      supportPointsDeduct: true,  // 支持抵扣积分
      desc: '前期活动：招聘租房可使用优惠券抵扣现金/积分，前端已预留优惠券选择入口',
    },

    // 计价工具方法说明
    // cashPrice 单位为"分"，展示时除以100转为"元"
    // pointsPrice 单位为"积分"，积分=现金(元)×100
  },

};

// ─────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────

/**
 * 元转分
 * @param {number} yuan
 * @returns {number}
 */
function yuanToFen(yuan) {
  return Math.round(yuan * 100);
}

/**
 * 分转元展示字符串
 * @param {number} fen
 * @returns {string}
 */
function fenToYuanStr(fen) {
  return (fen / 100).toFixed(0) + '元';
}

/**
 * 积分转展示字符串
 * @param {number} points
 * @returns {string}
 */
function pointsToStr(points) {
  return points.toLocaleString() + '积分';
}

/**
 * 获取某套餐的完整展示信息
 * @param {Object} pkg
 * @returns {Object}
 */
function getPackageDisplay(pkg) {
  return {
    ...pkg,
    cashPriceStr: fenToYuanStr(pkg.cashPrice),
    pointsPriceStr: pointsToStr(pkg.pointsPrice),
  };
}

/**
 * 获取所有发布套餐（含展示字段）
 * @returns {Array}
 */
function getPublishPackages() {
  return POINTS_CONFIG.PRICING.PUBLISH_PACKAGES.map(getPackageDisplay);
}

/**
 * 获取所有置顶套餐（含展示字段）
 * @returns {Array}
 */
function getTopPackages() {
  return POINTS_CONFIG.PRICING.TOP_PACKAGES.map(getPackageDisplay);
}

/**
 * 根据套餐id查找套餐
 * @param {string} id
 * @returns {Object|null}
 */
function getPackageById(id) {
  const all = [
    ...POINTS_CONFIG.PRICING.PUBLISH_PACKAGES,
    ...POINTS_CONFIG.PRICING.TOP_PACKAGES,
  ];
  const found = all.find(p => p.id === id);
  return found ? getPackageDisplay(found) : null;
}

/**
 * 获取某积分规则配置
 * @param {string} key  对应 EARN_RULES 中的 key 字段
 * @returns {Object|null}
 */
function getEarnRule(key) {
  const rules = POINTS_CONFIG.EARN_RULES;
  return Object.values(rules).find(r => r.key === key) || null;
}

/**
 * 判断当日积分是否已达上限
 * @param {number} todayEarned  今日已获积分
 * @returns {boolean}
 */
function isDailyLimitReached(todayEarned) {
  return todayEarned >= POINTS_CONFIG.BASE_RULES.dailyEarnLimit;
}

/**
 * 计算实际可获积分（考虑每日总上限）
 * @param {number} todayEarned  今日已获积分
 * @param {number} toAdd        本次拟加积分
 * @returns {number}            实际可加积分
 */
function calcActualPoints(todayEarned, toAdd) {
  const limit = POINTS_CONFIG.BASE_RULES.dailyEarnLimit;
  const remaining = limit - todayEarned;
  if (remaining <= 0) return 0;
  return Math.min(toAdd, remaining);
}

module.exports = {
  POINTS_CONFIG,
  yuanToFen,
  fenToYuanStr,
  pointsToStr,
  getPackageDisplay,
  getPublishPackages,
  getTopPackages,
  getPackageById,
  getEarnRule,
  isDailyLimitReached,
  calcActualPoints,
};
