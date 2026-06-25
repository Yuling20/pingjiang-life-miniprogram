// pages/services/convenience/familytree/mentaltest/index.js
// ============================================================
// 心理测试页
// 功能：
//   1. 根据 testId 加载对应量表题目
//   2. 封面介绍展示
//   3. 逐题答题（emoji选项 / 文字选项 / 图片选项）
//   4. 支持上一题/下一题/跳过
//   5. 提交 → 本地评分 → 跳转结果页
//
// 支持量表：
//   sas           → 焦虑自评量表（SAS）
//   phq9          → 抑郁筛查量表（PHQ-9）
//   child-emotion → 儿童情绪自查
//   left-behind   → 留守儿童专项
//   family        → 家庭关系健康度
//   elder-lonely  → 老年孤独感评估
//   stress        → 压力感知评估（PSS）
// ============================================================

const KEY_TEST_RECORDS = 'ftree_test_records'; // 本地测试记录存储

const DEBUG = false;
const log   = (...args) => DEBUG && console.log('[MentalTest]', ...args);

// ============================================================
// 量表配置总表（本地模拟数据，生产环境改为接口获取）
// ============================================================
const TEST_CONFIG = {

  // ─── SAS 焦虑自评量表 ───────────────────────────
  'sas': {
    id:         'sas',
    title:      '焦虑状态自评',
    emoji:      '😟',
    scaleName:  'SAS 标准量表',
    minutes:    5,
    free:       true,
    audience:   '适用于有焦虑症状的成年人，用于了解自身焦虑程度',
    introList: [
      '共 10 道题目，每题 4 个选项',
      '请根据最近一周的实际感受选择',
      '没有对错之分，请如实作答',
      '测试结果完全保密，仅供您个人参考',
      '正式诊断请咨询专业心理医生'
    ],
    scoreRule: 'sum',          // 计分规则：sum（累加）
    dimensions: ['焦虑程度'],
    questions: [
      {
        id: 'sas_1', category: '情绪感受', optionType: 'text',
        text: '最近一周，您是否感到比平常更加紧张或不安？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_2', category: '身体感受', optionType: 'text',
        text: '最近一周，您是否无缘无故地感到害怕或恐惧？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_3', category: '情绪感受', optionType: 'text',
        text: '最近一周，您是否容易心烦意乱或感到惊慌失措？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_4', category: '身体感受', optionType: 'text',
        text: '最近一周，您是否感到全身乏力、容易疲倦？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_5', category: '睡眠状态', optionType: 'text',
        text: '最近一周，您是否难以安静下来，坐立不安？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_6', category: '身体感受', optionType: 'text',
        text: '最近一周，您是否有手脚发抖的感觉？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_7', category: '睡眠状态', optionType: 'text',
        text: '最近一周，您是否因为头痛、颈痛或腰背痛而困扰？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_8', category: '情绪感受', optionType: 'text',
        text: '最近一周，您是否感到容易疲倦或总是感到虚弱无力？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_9', category: '睡眠状态', optionType: 'text',
        text: '最近一周，您是否很难入睡或睡眠质量很差？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      },
      {
        id: 'sas_10', category: '情绪感受', optionType: 'text',
        text: '最近一周，您是否有将来会有不好的事情发生的恐惧感？',
        options: [
          { label: '从没有', value: 1, freq: '从未'   },
          { label: '有时有', value: 2, freq: '少部分时间' },
          { label: '常常有', value: 3, freq: '相当多时间' },
          { label: '总是有', value: 4, freq: '绝大多数时间' }
        ]
      }
    ]
  },

  // ─── 留守儿童专项量表 ─────────────────────────
  'left-behind': {
    id:         'left-behind',
    title:      '留守儿童专项心理评估',
    emoji:      '🌟',
    scaleName:  '适龄专项量表',
    minutes:    5,
    free:       true,
    audience:   '8-15岁在家留守的孩子，或家长代替孩子填写',
    introList: [
      '共 8 道题目，用表情图片来选择',
      '选最接近自己感受的表情',
      '没有对错，怎么想就怎么选',
      '你的答案只有你自己和爸爸妈妈能看到',
      '做完测试会收到家人的爱心留言 ❤️'
    ],
    scoreRule: 'sum',
    dimensions: ['情感连接', '孤独感', '安全感', '情绪状态'],
    questions: [
      {
        id: 'lb_1', category: '想念家人', optionType: 'emoji',
        text: '你想念爸爸妈妈的时候，心里是什么感觉？',
        childHint: '就是那种特别想见到他们、但又见不到的感觉',
        options: [
          { emoji: '😊', label: '没什么感觉', value: 1 },
          { emoji: '😐', label: '有点想念',   value: 2 },
          { emoji: '😔', label: '很想念',     value: 3 },
          { emoji: '😢', label: '超级想念',   value: 4 }
        ]
      },
      {
        id: 'lb_2', category: '情绪状态', optionType: 'emoji',
        text: '当你一个人在家或在学校的时候，你感觉怎么样？',
        childHint: '比如放学后、睡觉前，那些安静的时刻',
        options: [
          { emoji: '😄', label: '很开心',   value: 1 },
          { emoji: '🙂', label: '还可以',   value: 2 },
          { emoji: '😕', label: '有点孤单', value: 3 },
          { emoji: '😭', label: '很孤单',   value: 4 }
        ]
      },
      {
        id: 'lb_3', category: '安全感', optionType: 'emoji',
        text: '当你遇到困难或者心里难受的时候，你会怎么做？',
        childHint: '比如和同学吵架了、功课不会做了',
        options: [
          { emoji: '💪', label: '自己解决',   value: 1 },
          { emoji: '📞', label: '打电话问家人', value: 2 },
          { emoji: '🤐', label: '闷在心里',   value: 3 },
          { emoji: '😿', label: '不知道找谁', value: 4 }
        ]
      },
      {
        id: 'lb_4', category: '情绪状态', optionType: 'emoji',
        text: '最近这段时间，你愿意和小朋友们一起玩吗？',
        childHint: '和同学、邻居小朋友在一起玩耍',
        options: [
          { emoji: '🎉', label: '很喜欢玩', value: 1 },
          { emoji: '😊', label: '还行，会玩', value: 2 },
          { emoji: '😶', label: '不太想玩', value: 3 },
          { emoji: '🙈', label: '不想和别人玩', value: 4 }
        ]
      },
      {
        id: 'lb_5', category: '情感连接', optionType: 'emoji',
        text: '你和爸爸妈妈通话或视频的时候，感觉怎么样？',
        childHint: '就是你们打电话、发视频的那个感觉',
        options: [
          { emoji: '🥰', label: '很开心，很爱他们', value: 1 },
          { emoji: '😊', label: '挺好的',          value: 2 },
          { emoji: '😐', label: '说不出什么感觉',   value: 3 },
          { emoji: '😤', label: '有时候会生气',     value: 4 }
        ]
      },
      {
        id: 'lb_6', category: '情绪状态', optionType: 'emoji',
        text: '你会不会在半夜睡不着，或者做噩梦？',
        childHint: '就是睡着很难、或者梦到可怕的东西',
        options: [
          { emoji: '😴', label: '睡得很好',     value: 1 },
          { emoji: '🌙', label: '偶尔睡不好',   value: 2 },
          { emoji: '😰', label: '经常睡不好',   value: 3 },
          { emoji: '😱', label: '总是睡不好',   value: 4 }
        ]
      },
      {
        id: 'lb_7', category: '孤独感', optionType: 'emoji',
        text: '你会不会觉得别人不关心你、不喜欢你？',
        childHint: '就是感觉自己一个人，没人在意你的感受',
        options: [
          { emoji: '😄', label: '从来不会',   value: 1 },
          { emoji: '😌', label: '很少这样想', value: 2 },
          { emoji: '😔', label: '有时候这样想', value: 3 },
          { emoji: '😞', label: '经常这样想', value: 4 }
        ]
      },
      {
        id: 'lb_8', category: '情感连接', optionType: 'emoji',
        text: '如果爸爸妈妈明天就能回家，你最想对他们说什么？',
        childHint: '选一个最接近你心里话的选项',
        options: [
          { emoji: '🤗', label: '好想抱抱你们', value: 4 },
          { emoji: '😊', label: '想和你们说说话', value: 3 },
          { emoji: '🙂', label: '没什么特别想说的', value: 2 },
          { emoji: '😶', label: '不知道说什么', value: 1 }
        ]
      }
    ]
  },

  // ─── 儿童情绪自查 ─────────────────────────────
  'child-emotion': {
    id:         'child-emotion',
    title:      '儿童情绪自查',
    emoji:      '👶',
    scaleName:  '适龄情绪量表',
    minutes:    3,
    free:       true,
    audience:   '6-12岁儿童，也可由家长引导孩子共同完成',
    introList: [
      '共 6 道题目，用表情选择',
      '选最像自己感受的那个表情',
      '没有对错，随心选择',
      '做完后爸爸妈妈可以看到你的状态'
    ],
    scoreRule:  'sum',
    dimensions: ['情绪状态', '社交意愿'],
    questions: [
      {
        id: 'ce_1', category: '情绪状态', optionType: 'emoji',
        text: '今天你的心情是什么样子的？',
        childHint: '选一个最像你现在感受的表情',
        options: [
          { emoji: '😄', label: '超开心！', value: 1 },
          { emoji: '🙂', label: '还不错',   value: 2 },
          { emoji: '😐', label: '一般般',   value: 3 },
          { emoji: '😔', label: '有点难过', value: 4 }
        ]
      },
      {
        id: 'ce_2', category: '社交意愿', optionType: 'emoji',
        text: '今天你想和小朋友一起玩吗？',
        childHint: '和好朋友或同学在一起玩的感觉',
        options: [
          { emoji: '🎈', label: '超想玩！',   value: 1 },
          { emoji: '😊', label: '想玩',       value: 2 },
          { emoji: '😶', label: '不太想玩',   value: 3 },
          { emoji: '🙈', label: '不想和人玩', value: 4 }
        ]
      },
      {
        id: 'ce_3', category: '情绪状态', optionType: 'emoji',
        text: '你有没有因为什么事情感到担心或害怕？',
        childHint: '比如怕黑、怕考试、怕被人说',
        options: [
          { emoji: '😊', label: '没有担心', value: 1 },
          { emoji: '😐', label: '有一点点', value: 2 },
          { emoji: '😰', label: '比较担心', value: 3 },
          { emoji: '😱', label: '很害怕',   value: 4 }
        ]
      },
      {
        id: 'ce_4', category: '社交意愿', optionType: 'emoji',
        text: '当你难过的时候，你愿意告诉大人吗？',
        childHint: '比如告诉爸爸妈妈、老师或者爷爷奶奶',
        options: [
          { emoji: '🗣️', label: '愿意！马上告诉', value: 1 },
          { emoji: '🤔', label: '有时候愿意',    value: 2 },
          { emoji: '🤐', label: '不太愿意',      value: 3 },
          { emoji: '🙅', label: '不愿意说',      value: 4 }
        ]
      },
      {
        id: 'ce_5', category: '情绪状态', optionType: 'emoji',
        text: '今天你有没有笑过？',
        childHint: '真正开心的那种笑',
        options: [
          { emoji: '😂', label: '笑了好多次！', value: 1 },
          { emoji: '😊', label: '笑了',         value: 2 },
          { emoji: '🙁', label: '没怎么笑',     value: 3 },
          { emoji: '😢', label: '完全没笑',     value: 4 }
        ]
      },
      {
        id: 'ce_6', category: '情绪状态', optionType: 'emoji',
        text: '昨晚你睡得好吗？',
        childHint: '睡觉的感觉好不好',
        options: [
          { emoji: '😴', label: '睡得很好！', value: 1 },
          { emoji: '🛌', label: '还行',       value: 2 },
          { emoji: '😪', label: '不太好',     value: 3 },
          { emoji: '😩', label: '很不好',     value: 4 }
        ]
      }
    ]
  },

  // ─── 家庭关系健康度 ───────────────────────────
  'family': {
    id:         'family',
    title:      '家庭关系健康度',
    emoji:      '🤝',
    scaleName:  '家庭功能量表（FAD改编）',
    minutes:    6,
    free:       true,
    audience:   '18岁以上家庭成员，了解家庭关系的整体状态',
    introList: [
      '共 8 道题目，每题 4 个选项',
      '请根据您家庭目前的真实状态选择',
      '结果将从沟通、情感、亲密度等维度分析',
      '答案完全保密，建议所有家庭成员分别填写',
      '可将结果分享到家庭树，促进家庭了解'
    ],
    scoreRule:  'sum',
    dimensions: ['沟通质量', '情感支持', '家庭凝聚力', '问题解决'],
    questions: [
      {
        id: 'fam_1', category: '沟通质量', optionType: 'text',
        text: '当家里有事情需要解决时，家人之间能够坦诚地交流吗？',
        options: [
          { label: '总是能够坦诚交流',   value: 4, freq: '非常同意' },
          { label: '大多数时候可以',      value: 3, freq: '比较同意' },
          { label: '偶尔能够沟通',        value: 2, freq: '不太同意' },
          { label: '很少能够坦诚沟通',   value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_2', category: '情感支持', optionType: 'text',
        text: '当您遇到困难或情绪低落时，家人会主动关心和支持您吗？',
        options: [
          { label: '总是会关心支持',     value: 4, freq: '非常同意' },
          { label: '大多数情况会',        value: 3, freq: '比较同意' },
          { label: '偶尔会',              value: 2, freq: '不太同意' },
          { label: '很少关心支持',        value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_3', category: '家庭凝聚力', optionType: 'text',
        text: '您的家人是否会把彼此的事情放在心上，关注对方的变化？',
        options: [
          { label: '很关注，常常提到',   value: 4, freq: '非常同意' },
          { label: '比较关注',            value: 3, freq: '比较同意' },
          { label: '偶尔关注',            value: 2, freq: '不太同意' },
          { label: '各自过各自的生活',   value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_4', category: '问题解决', optionType: 'text',
        text: '家庭发生矛盾或争吵后，家人通常能够和解并解决问题吗？',
        options: [
          { label: '总是能够和解',       value: 4, freq: '非常同意' },
          { label: '大多数时候可以',     value: 3, freq: '比较同意' },
          { label: '需要很久才能和解',   value: 2, freq: '不太同意' },
          { label: '矛盾常常无法解决',   value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_5', category: '情感支持', optionType: 'text',
        text: '您是否觉得家人真的理解您、在乎您的感受？',
        options: [
          { label: '非常理解我',         value: 4, freq: '非常同意' },
          { label: '比较理解',           value: 3, freq: '比较同意' },
          { label: '不太了解我的感受',   value: 2, freq: '不太同意' },
          { label: '感觉家人不理解我',   value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_6', category: '沟通质量', optionType: 'text',
        text: '在您家里，长辈和晚辈之间能够平等地对话、表达各自意见吗？',
        options: [
          { label: '完全可以，非常平等', value: 4, freq: '非常同意' },
          { label: '大多数时候可以',     value: 3, freq: '比较同意' },
          { label: '有时候不平等',       value: 2, freq: '不太同意' },
          { label: '很难平等对话',       value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_7', category: '家庭凝聚力', optionType: 'text',
        text: '即使距离很远，您是否仍然感受到家庭的温暖和存在感？',
        options: [
          { label: '总是感受得到',       value: 4, freq: '非常同意' },
          { label: '大多数时候能感受到', value: 3, freq: '比较同意' },
          { label: '偶尔能感受到',       value: 2, freq: '不太同意' },
          { label: '感受不到',           value: 1, freq: '不同意'   }
        ]
      },
      {
        id: 'fam_8', category: '问题解决', optionType: 'text',
        text: '您对目前家庭关系的整体满意程度如何？',
        options: [
          { label: '非常满意',           value: 4, freq: '非常好'   },
          { label: '比较满意',           value: 3, freq: '比较好'   },
          { label: '有些不满意',         value: 2, freq: '一般'     },
          { label: '不满意',             value: 1, freq: '需要改善' }
        ]
      }
    ]
  },

  // ─── 老年孤独感 UCLA 量表 ─────────────────────
  'elder-lonely': {
    id:         'elder-lonely',
    title:      '老年孤独感评估',
    emoji:      '👴',
    scaleName:  'UCLA 孤独量表（简版）',
    minutes:    6,
    free:       true,
    audience:   '60岁以上老年人，或子女代为了解长辈的心理状态',
    introList: [
      '共 8 道题目，可选图片和文字选项',
      '请根据您最近一个月的实际感受选择',
      '没有好坏之分，请诚实作答',
      '结果将为您提供专属关爱建议',
      '子女可查看结果，更好地陪伴您'
    ],
    scoreRule:  'sum',
    dimensions: ['孤独感', '社会联结', '情绪状态'],
    questions: [
      {
        id: 'el_1', category: '孤独感', optionType: 'image',
        text: '最近，您是否经常感到孤独？',
        options: [
          { emoji: '😄', label: '从不孤独',   desc: '每天都很充实', value: 1 },
          { emoji: '🙂', label: '偶尔孤独',   desc: '有时候会想人', value: 2 },
          { emoji: '😔', label: '经常孤独',   desc: '常常感到冷清', value: 3 },
          { emoji: '😢', label: '总是孤独',   desc: '很少有人陪伴', value: 4 }
        ]
      },
      {
        id: 'el_2', category: '社会联结', optionType: 'image',
        text: '最近，您觉得身边有关心您的人吗？',
        options: [
          { emoji: '🥰', label: '有很多人关心', desc: '家人子女常联系', value: 1 },
          { emoji: '😊', label: '有人关心',     desc: '偶尔有人问候',   value: 2 },
          { emoji: '😐', label: '很少有人关心', desc: '联系比较少',     value: 3 },
          { emoji: '😔', label: '没人关心',     desc: '感觉被忽视',     value: 4 }
        ]
      },
      {
        id: 'el_3', category: '情绪状态', optionType: 'image',
        text: '最近，您的心情是否经常感到沉闷或不开心？',
        options: [
          { emoji: '😄', label: '心情愉快',   desc: '每天都挺开心',   value: 1 },
          { emoji: '🙂', label: '心情一般',   desc: '还过得去',       value: 2 },
          { emoji: '😕', label: '经常沉闷',   desc: '提不起精神',     value: 3 },
          { emoji: '😞', label: '总是不开心', desc: '心里空落落的',   value: 4 }
        ]
      },
      {
        id: 'el_4', category: '社会联结', optionType: 'image',
        text: '最近，您是否有机会与子女或亲朋好友交流？',
        options: [
          { emoji: '📞', label: '每天都联系',   desc: '视频电话常打',   value: 1 },
          { emoji: '📱', label: '经常联系',     desc: '每周有联系',     value: 2 },
          { emoji: '📮', label: '偶尔联系',     desc: '一个月才联系',   value: 3 },
          { emoji: '📵', label: '很少联系',     desc: '很少有人打来',   value: 4 }
        ]
      },
      {
        id: 'el_5', category: '孤独感', optionType: 'image',
        text: '最近，您是否觉得日子过得没什么意思？',
        options: [
          { emoji: '🌞', label: '很有意思',   desc: '每天都有事情做', value: 1 },
          { emoji: '😊', label: '还行',       desc: '平平淡淡也好',   value: 2 },
          { emoji: '😶', label: '有时没意思', desc: '偶尔感到空虚',   value: 3 },
          { emoji: '😔', label: '没什么意思', desc: '感觉日子很单调', value: 4 }
        ]
      }
    ]
  },

  // ─── PHQ-9 抑郁倾向筛查 ───────────────────────
  'phq9': {
    id:         'phq9',
    title:      '抑郁倾向筛查',
    emoji:      '😔',
    scaleName:  'PHQ-9 标准量表',
    minutes:    8,
    free:       true,
    audience:   '18岁以上成年人，用于筛查是否存在抑郁倾向',
    introList: [
      '共 9 道题目，每题 4 个频率选项',
      '请根据过去两周的实际情况选择',
      '请认真如实填写，这对您的健康很重要',
      '测试结果完全保密',
      '若分数偏高，我们将提供专业建议和资源'
    ],
    scoreRule:  'sum',
    dimensions: ['情绪', '兴趣', '睡眠', '精力', '自我评价'],
    questions: [
      {
        id: 'phq_1', category: '情绪', optionType: 'text',
        text: '过去两周，您有多少时间感到情绪低落、沮丧或绝望？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_2', category: '兴趣', optionType: 'text',
        text: '过去两周，您对于做事几乎提不起劲或没有兴趣有多频繁？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_3', category: '睡眠', optionType: 'text',
        text: '过去两周，您有多频繁出现入睡困难、睡不安稳或睡眠过多？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_4', category: '精力', optionType: 'text',
        text: '过去两周，您有多频繁感到疲倦或精力不足？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_5', category: '饮食', optionType: 'text',
        text: '过去两周，您有多频繁感到食欲不振或进食过多？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_6', category: '自我评价', optionType: 'text',
        text: '过去两周，您有多频繁觉得自己很糟糕，或觉得自己很失败，或让自己或家人失望？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_7', category: '专注力', optionType: 'text',
        text: '过去两周，您有多频繁难以专注于事情，例如阅读或看电视？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_8', category: '行为', optionType: 'text',
        text: '过去两周，您有多频繁出现行动或说话速度变慢，或者相反地烦躁、坐立不安？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      },
      {
        id: 'phq_9', category: '自伤意念', optionType: 'text',
        text: '过去两周，您有多频繁有不如死掉或用某种方式伤害自己的念头？',
        options: [
          { label: '完全没有',     value: 0, freq: '0天'    },
          { label: '少数几天',     value: 1, freq: '1-6天'  },
          { label: '超过一半天数', value: 2, freq: '7-11天' },
          { label: '几乎每天',     value: 3, freq: '12-14天'}
        ]
      }
    ]
  },

  // ─── 压力感知量表（PSS）──────────────────────
  'stress': {
    id:         'stress',
    title:      '压力感知评估',
    emoji:      '💭',
    scaleName:  'PSS 压力感知量表（简版）',
    minutes:    4,
    free:       true,
    audience:   '适用于所有成年人，了解近期的压力状态',
    introList: [
      '共 8 道题目，每题 5 个频率选项',
      '根据过去一个月的实际感受选择',
      '答案无对错，请尽量如实填写',
      '测试完成后将提供个性化的减压建议'
    ],
    scoreRule:  'sum',
    dimensions: ['压力感知', '失控感', '应对能力'],
    questions: [
      {
        id: 'pss_1', category: '压力感知', optionType: 'text',
        text: '过去一个月，您有多频繁感到因为发生了意外事件而感到不安？',
        options: [
          { label: '从不',   value: 0, freq: '0次'   },
          { label: '几乎不', value: 1, freq: '很少'   },
          { label: '有时',   value: 2, freq: '偶尔'   },
          { label: '较常',   value: 3, freq: '经常'   },
          { label: '经常',   value: 4, freq: '非常频繁'}
        ]
      },
      {
        id: 'pss_2', category: '失控感', optionType: 'text',
        text: '过去一个月，您有多频繁感到无法控制生活中重要的事情？',
        options: [
          { label: '从不',   value: 0, freq: '0次'   },
          { label: '几乎不', value: 1, freq: '很少'   },
          { label: '有时',   value: 2, freq: '偶尔'   },
          { label: '较常',   value: 3, freq: '经常'   },
          { label: '经常',   value: 4, freq: '非常频繁'}
        ]
      },
      {
        id: 'pss_3', category: '应对能力', optionType: 'text',
        text: '过去一个月，您有多频繁感到紧张和有压力？',
        options: [
          { label: '从不',   value: 0, freq: '0次'   },
          { label: '几乎不', value: 1, freq: '很少'   },
          { label: '有时',   value: 2, freq: '偶尔'   },
          { label: '较常',   value: 3, freq: '经常'   },
          { label: '经常',   value: 4, freq: '非常频繁'}
        ]
      },
      {
        id: 'pss_4', category: '应对能力', optionType: 'text',
        text: '过去一个月，您有多频繁感到困难积累到无法克服的地步？',
        options: [
          { label: '从不',   value: 0, freq: '0次'   },
          { label: '几乎不', value: 1, freq: '很少'   },
          { label: '有时',   value: 2, freq: '偶尔'   },
          { label: '较常',   value: 3, freq: '经常'   },
          { label: '经常',   value: 4, freq: '非常频繁'}
        ]
      }
    ]
  }
};

// ============================================================
// 评分规则函数
// ============================================================
function calcScore(questions, answers) {
  let total = 0;
  questions.forEach((q, idx) => {
    const val = answers[idx];
    if (val !== undefined && val !== null) {
      total += Number(val);
    }
  });
  return total;
}

// ============================================================
// Page
// ============================================================
Page({

  data: {
    pageReady:       false,
    phase:           'intro',   // 'intro' | 'testing' | 'submitting'

    testId:          '',
    testInfo:        null,
    questions:       [],
    answers:         [],        // 每题答案，null 表示未作答

    currentIndex:    0,
    currentQ:        null,
    progressPercent: 0,
    dotList:         [],        // 进度点阵数据

    isChildMode:     false,

    // 提交动画
    submitStep:      0
  },

  // ─── 生命周期 ───────────────────────────────
  onLoad(options) {
    const testId = options.testId || 'sas';
    const config = TEST_CONFIG[testId];

    if (!config) {
      wx.showToast({ title: '测试不存在', icon: 'error' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    // 判断是否儿童模式
    const savedRole  = wx.getStorageSync('ftree_user_role') || {};
    const isChildMode = savedRole.uiMode === 'child'
      || testId === 'left-behind'
      || testId === 'child-emotion';

    const answers = new Array(config.questions.length).fill(null);

    this.setData({
      testId,
      testInfo:    config,
      questions:   config.questions,
      answers,
      isChildMode,
      pageReady:   true
    });

    log('测试加载：', testId, config.title);
  },

  // ─── INTRO 封面操作 ──────────────────────────
  onStartTest() {
    this.setData({
      phase:        'testing',
      currentIndex: 0,
      currentQ:     this.data.questions[0]
    });
    this._updateProgress(0);
  },

  // ─── 答题逻辑 ────────────────────────────────
  onSelectOption(e) {
    const { value, index } = e.currentTarget.dataset;
    const answers = [...this.data.answers];
    answers[index] = value;

    this.setData({ answers });
    this._updateDotList(answers);

    log('选择答案：', index, value);

    // 自动推进到下一题（短暂延迟，体验更好）
    setTimeout(() => {
      const { currentIndex, questions } = this.data;
      if (currentIndex < questions.length - 1) {
        this._goToQuestion(currentIndex + 1);
      }
    }, 350);
  },

  onPrevQuestion() {
    const { currentIndex } = this.data;
    if (currentIndex === 0) return;
    this._goToQuestion(currentIndex - 1);
  },

  onNextQuestion() {
    const { currentIndex, questions, answers } = this.data;

    // 未选择时不允许继续
    if (answers[currentIndex] === null || answers[currentIndex] === undefined) {
      wx.showToast({ title: '请先选择一个选项', icon: 'none' });
      return;
    }

    if (currentIndex < questions.length - 1) {
      this._goToQuestion(currentIndex + 1);
    } else {
      // 最后一题 → 提交
      this._onSubmit();
    }
  },

  onSkipQuestion() {
    const { currentIndex, questions } = this.data;
    const answers = [...this.data.answers];
    answers[currentIndex] = null;   // 标记为跳过

    this.setData({ answers });

    if (currentIndex < questions.length - 1) {
      this._goToQuestion(currentIndex + 1);
    } else {
      this._onSubmit();
    }
  },

  // ─── 内部：跳转到指定题 ─────────────────────
  _goToQuestion(idx) {
    const { questions } = this.data;
    this.setData({
      currentIndex: idx,
      currentQ:     questions[idx]
    });
    this._updateProgress(idx);
    this._updateDotList(this.data.answers);
  },

  _updateProgress(idx) {
    const total   = this.data.questions.length;
    const percent = Math.round(((idx + 1) / total) * 100);
    this.setData({ progressPercent: percent });
  },

  // 更新进度点阵（最多显示12个点，超过时省略显示）
  _updateDotList(answers) {
    const { questions, currentIndex } = this.data;
    const maxDots  = 12;
    const total    = questions.length;
    const showAll  = total <= maxDots;

    let dotList = [];
    if (showAll) {
      dotList = questions.map((_, i) => ({
        index:    i,
        answered: answers[i] !== null && answers[i] !== undefined,
        current:  i === currentIndex
      }));
    } else {
      // 超过12题，只显示当前附近的点
      const start = Math.max(0, currentIndex - 5);
      const end   = Math.min(total, start + maxDots);
      for (let i = start; i < end; i++) {
        dotList.push({
          index:    i,
          answered: answers[i] !== null && answers[i] !== undefined,
          current:  i === currentIndex
        });
      }
    }
    this.setData({ dotList });
  },

  // ─── 提交逻辑 ────────────────────────────────
  _onSubmit() {
    const { answers, questions } = this.data;

    // 检查是否有未答题目
    const unanswered = answers.filter(a => a === null || a === undefined).length;

    if (unanswered > 0) {
      wx.showModal({
        title:       '还有题目未作答',
        content:     `您有 ${unanswered} 道题目未选择，跳过的题目将不计入评分，是否继续提交？`,
        confirmText: '继续提交',
        cancelText:  '返回补答',
        success: (res) => {
          if (res.confirm) this._doSubmit();
        }
      });
    } else {
      this._doSubmit();
    }
  },

  _doSubmit() {
    const { testInfo, questions, answers } = this.data;

    this.setData({ phase: 'submitting', submitStep: 0 });

    // ── 模拟分析动画（3步，每步 800ms）──
    const steps = [1, 2, 3];
    steps.forEach((step, idx) => {
      setTimeout(() => {
        this.setData({ submitStep: step });
      }, idx * 800 + 300);
    });

    // ── 800ms 后计算结果，跳转到结果页 ──
    setTimeout(() => {
      const score = calcScore(questions, answers);

      // 存储本次测试记录
      const record = {
        id:          `test_${Date.now()}`,
        testId:      testInfo.id,
        testTitle:   testInfo.title,
        scaleName:   testInfo.scaleName,
        score,
        totalQuestions: questions.length,
        answeredCount:  answers.filter(a => a !== null).length,
        answers:     [...answers],
        date:        this._getTodayStr(),
        timestamp:   Date.now()
      };

      const records = [record, ...(wx.getStorageSync(KEY_TEST_RECORDS) || [])].slice(0, 20);
      wx.setStorageSync(KEY_TEST_RECORDS, records);

      log('测试提交，得分：', score, '跳转结果页');

      // 跳转结果页，传递分数和测试ID
      wx.redirectTo({
        url: `../mentaltestresult/index?testId=${testInfo.id}&score=${score}&recordId=${record.id}`
      });

    }, 2800);
  },

  // ─── 工具 ────────────────────────────────────
  _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  onNavBack() {
    const { phase } = this.data;
    if (phase === 'testing') {
      wx.showModal({
        title:       '退出测试',
        content:     '退出后本次作答记录不会保存，确认退出吗？',
        confirmText: '退出',
        cancelText:  '继续测试',
        success: (res) => {
          if (res.confirm) wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  }

});
