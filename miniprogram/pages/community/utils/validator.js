const {
  SENSITIVE_WORDS,
  PHONE_REGEX,
  WECHAT_REGEX,
  QQ_REGEX,
  EMAIL_REGEX,
  LANDLINE_REGEX,
  CHINESE_PHONE_REGEX,
} = require('./sensitiveWords');

/**
 * 第一层：前端内容校验
 * @param {string} text
 * @returns {{ valid: boolean, reason: string }}
 */
function validateContent(text) {
  if (!text || !text.trim()) {
    return { valid: false, reason: '内容不能为空' };
  }
  const t = text;

  if (PHONE_REGEX.test(t))
    return { valid: false, reason: '社区禁止发布手机号码，请删除后重试' };
  if (WECHAT_REGEX.test(t))
    return { valid: false, reason: '社区禁止发布微信号，请删除后重试' };
  if (QQ_REGEX.test(t))
    return { valid: false, reason: '社区禁止发布QQ号，请删除后重试' };
  if (EMAIL_REGEX.test(t))
    return { valid: false, reason: '社区禁止发布邮箱地址，请删除后重试' };
  if (LANDLINE_REGEX.test(t))
    return { valid: false, reason: '社区禁止发布电话号码，请删除后重试' };
  if (CHINESE_PHONE_REGEX.test(t))
    return { valid: false, reason: '检测到联系方式变体写法，请删除后重试' };

  for (const word of SENSITIVE_WORDS) {
    if (t.includes(word)) {
      return { valid: false, reason: '内容包含违规词汇，请修改后重试' };
    }
  }

  return { valid: true, reason: '' };
}

/**
 * 第二层：后端二次校验（服务端用 access_token 调用微信 msgSecCheck）
 * 请将 url 替换为实际后端接口
 * @param {string} content
 * @returns {Promise<{ valid: boolean, reason: string }>}
 */
function secMsgCheck(content) {
  return new Promise((resolve) => {
    wx.request({
      // ⚠️ 替换为实际后端接口，后端负责携带 access_token 调用微信 msgSecCheck
      url: 'https://your-server.com/api/sec-msg-check',
      method: 'POST',
      data: { content },
      success(res) {
        if (res.statusCode === 200 && res.data && res.data.pass) {
          resolve({ valid: true, reason: '' });
        } else {
          resolve({ valid: false, reason: '内容未通过安全检测，请修改后重试' });
        }
      },
      fail() {
        // 网络异常时降级放行，可根据业务需要改为拦截
        console.warn('[secMsgCheck] 服务端校验失败，已降级放行');
        resolve({ valid: true, reason: '' });
      },
    });
  });
}

/**
 * 全链路校验：前端 → 后端
 * @param {string} content
 * @returns {Promise<{ valid: boolean, reason: string }>}
 */
async function fullCheck(content) {
  const frontResult = validateContent(content);
  if (!frontResult.valid) return frontResult;
  const secResult = await secMsgCheck(content);
  return secResult;
}

module.exports = { validateContent, secMsgCheck, fullCheck };
