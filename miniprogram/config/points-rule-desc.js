/**
 * 积分规则说明文案配置
 * 用于"积分规则说明"页面/弹窗的文案渲染，与 points.js 同步维护
 */

const POINTS_RULE_DESC = {

  // 顶部说明
  header: {
    title: '积分规则说明',
    subtitle: '平江生活积分',
  },

  // 基础规则说明
  baseRules: [
    '积分不可提现、不可转让',
    '积分自获得之日起，有效期12个月',
    '每个账号每日获取积分上限为200积分',
  ],

  // 获取积分明细
  earnList: [
    {
      scene: '每日签到',
      reward: '+5积分/天',
      limit: '每日1次',
      remark: '连续签到满7天，当日额外+10积分',
    },
    {
      scene: '新用户注册',
      reward: '+100积分',
      limit: '仅首次',
      remark: '',
    },
    {
      scene: '完善手机号+实名认证',
      reward: '+50积分',
      limit: '仅首次',
      remark: '',
    },
    {
      scene: '【贴吧】发布帖子',
      reward: '+10积分/条',
      limit: '每日上限2条',
      remark: '贴吧永久免费发帖，发就送积分',
    },
    {
      scene: '【孝亲守护】发布备忘录/用药提醒',
      reward: '+10积分/条',
      limit: '每日上限2条',
      remark: '孝亲发帖纳入积分',
    },
    {
      scene: '帖子被点赞/被评论',
      reward: '+1~2积分/次',
      limit: '每日合计上限50积分',
      remark: '全平台通用：贴吧+孝亲+招聘租房',
    },
    {
      scene: '帖子分享微信/朋友圈',
      reward: '+30积分/次',
      limit: '每日上限3次',
      remark: '全平台通用',
    },
    {
      scene: '招聘/租房发帖',
      reward: '不赠送积分',
      limit: '—',
      remark: '发布须消耗积分或现金，无发帖得积分规则',
      isConsume: true,            // 标记为消耗项（非获得项）
    },
  ],

  // 消耗积分明细（发布套餐）
  consumeList: {
    title: '招聘/租房发布套餐（积分/现金二选一）',
    publishPackages: [
      { name: '30天基础曝光', cash: '60元', points: '6000积分' },
      { name: '60天基础曝光', cash: '90元', points: '9000积分' },
      { name: '30天+社群推广', cash: '180元', points: '18000积分' },
      { name: '60天+社群推广', cash: '300元', points: '30000积分' },
    ],
    topPackages: [
      { name: '置顶一周', cash: '60元', points: '6000积分' },
      { name: '置顶一月', cash: '180元', points: '18000积分' },
      { name: '置顶两月', cash: '300元', points: '30000积分' },
      { name: '置顶全年', cash: '1680元', points: '168000积分' },
    ],
    couponTip: '前期活动：招聘租房可使用优惠券抵扣现金/积分',
  },
};

module.exports = { POINTS_RULE_DESC };
