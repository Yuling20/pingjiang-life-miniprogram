const SENSITIVE_WORDS = [
  '加我','私聊','私信我','联系我','加微','扫我','滴我','V我','V',
  '有需要找我','需要加','加一下','加个wx','加个微',
  '刷单','兼职日赚','月入万元','稳赚不亏','无本万利',
  '快速致富','躺赚','代理招募','低价出售','高利贷',
  '套现','代办证件','假证','发票代开','走私',
  '赌博','博彩','诈骗','传销','洗钱',
  '毒品','大麻','冰毒','海洛因','摇头丸',
  '枪支','弹药','爆炸物','管制刀具',
  '色情','裸聊','援交','约炮','一夜情','成人服务',
  '傻逼','操你','去死','滚出','妈的','草泥马',
];

const PHONE_REGEX = /(\+?86[-\s]?)?1[3-9]\d{9}/;
const WECHAT_REGEX = /(微信|wechat|wx号?|v信|V信|薇信)[：:\s\-—_]*[a-zA-Z][a-zA-Z0-9_\-]{4,19}/i;
const QQ_REGEX = /[Qq]{2}[号]?[：:\s\-—]*[1-9]\d{4,10}/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const LANDLINE_REGEX = /0\d{2,3}[\s\-—]?\d{7,8}/;
const CHINESE_PHONE_REGEX = /[一二三四五六七八九零○〇]{7,11}/;

module.exports = {
  SENSITIVE_WORDS,
  PHONE_REGEX,
  WECHAT_REGEX,
  QQ_REGEX,
  EMAIL_REGEX,
  LANDLINE_REGEX,
  CHINESE_PHONE_REGEX,
};
