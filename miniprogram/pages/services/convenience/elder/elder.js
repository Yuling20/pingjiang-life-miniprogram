// pages/services/convenience/elder/elder.js
// ============================================================
// 孝亲守护模块 — 纯本地存储版本
// 版本说明：完全移除微信云开发依赖，所有数据使用本地缓存持久化
// 数据存储：wx.setStorageSync / wx.getStorageSync
// 用药提醒：前台轮询方案（每60秒检查一次）
//
// ⚠️ 重要限制说明：
//    用药提醒依赖小程序前台运行状态，用户退出或切后台后定时器停止。
//    如需后台定时推送，需后续接入：
//    微信云开发「定时触发器云函数」+ 「微信服务通知订阅消息」
// ============================================================

// ---- 本地缓存 Key 统一定义（便于维护，不散落在代码各处） ----
const KEY_ROLE       = 'elder_user_role';       // 当前用户角色信息
const KEY_FAMILY     = 'elder_family_info';     // 家庭绑定信息
const KEY_MEDS       = 'elder_meds';            // 用药提醒清单
const KEY_MEMOS      = 'elder_memos';           // 家庭备忘录
const KEY_RECORDS    = 'elder_records';         // 用药打卡记录
const KEY_TRIGGERED  = 'elder_triggered_today'; // 今日已触发的提醒（防重复弹出）

// ---- 常量配置 ----
const CHECK_INTERVAL   = 30 * 1000; // 轮询检查间隔（30秒，比1分钟更精准）
const OVERDUE_MINUTES  = 30;        // 超时未打卡提醒阈值（分钟）

// ✅ 问题5修复：上线审核风险处理
const DEBUG = false;
const log = (...args) => DEBUG && console.log(...args);

Page({

  // ==========================================================
  // 页面数据初始化
  // ==========================================================
  data: {
    // ---- 页面状态 ----
    pageReady:         false,   // 页面是否准备完毕（避免数据未加载时闪烁）
    showIdentityModal: false,   // 是否显示身份选择弹窗

    // ---- 身份/角色 ----
    // role: 'elder'(长辈-老人视图) | 'junior'(晚辈-管理视图) | null(未选择)
    role:          null,
    selectedTitle: '',          // 选择的亲属称谓，如"爸爸"
    identityList: [
      { label: '爸爸',   value: 'elder',  icon: '👴' },
      { label: '妈妈',   value: 'elder',  icon: '👵' },
      { label: '儿子',   value: 'junior', icon: '👦' },
      { label: '女儿',   value: 'junior', icon: '👧' },
      { label: '孙子',   value: 'junior', icon: '🧒' },
      { label: '孙女',   value: 'junior', icon: '🧒' },
      { label: '其他亲属', value: 'junior', icon: '🧑' }
    ],

    // ---- 家庭绑定 ----
    isBound:       false,   // 是否已绑定家庭成员
    familyMembers: [],      // 已绑定的家庭成员列表
    bindCode:      '',      // 本人的6位数字绑定码
    showBindPanel: false,   // 是否展开绑定面板
    bindMethod:    '',      // 当前选中的绑定方式：'friend'|'qr'|'wxid'
    inputWxId:     '',      // 手动输入的微信号（微信号绑定方式用）
    inputBindCode: '',      // 输入对方发来的绑定码

    // ---- 用药提醒 ----
    medicineList:   [],     // 完整用药清单（晚辈管理端）
    todayMeds:      [],     // 今日有效用药列表（老人端展示）
    showAddMedForm: false,  // 是否显示新增用药表单弹窗
    medForm: {              // 新增/编辑用药表单数据
      name:    '',
      dose:    '',
      note:    '',
      time:    '',
      enabled: true
    },
    showMedClock: false,    // 是否显示老人端用药打卡全屏弹窗
    clockMedInfo: null,     // 当前弹窗对应的药品信息
    medRecords:   [],       // 全部打卡记录

    // ---- 家庭备忘录 ----
    memoList:       [],     // 全部备忘录列表
    showAddMemo:    false,  // 是否显示新增/编辑备忘录弹窗
    memoForm: {             // 新增/编辑备忘录表单数据
      id:          '',
      title:       '',
      content:     '',
      date:        '',
      advanceDays: 1,
      images:      []       // 图片列表（本地临时路径）
    },
    todayMemos:      [],    // 今日重要事项（老人端用）
    showMemoDetail:  false, // 老人端备忘录详情弹窗
    currentMemo:     null,  // 当前查看的备忘录对象

    // ---- 工具 ----
    currentDate: '',        // 今日日期字符串，格式 "YYYY-MM-DD"
  },

  // ==========================================================
  // 内部变量（非响应式，不放入 data）
  // ==========================================================
  _checkTimer: null,        // 用药提醒轮询定时器句柄
  _overdueTimers: {},       // 超时检测定时器集合 { trigKey: timerId }

  // ==========================================================
  // ✅ 问题1修复：新增缺失的绑定码分享方法
  // ==========================================================
  _chooseWxFriend() {
    this._showShareBindCode();
  },

  // ==========================================================
  // ✅ 问题2修复：清理过期的触发记录，防止本地存储膨胀
  // ==========================================================
  _cleanExpiredTriggered() {
    const today = this.data.currentDate;
    const triggered = wx.getStorageSync(KEY_TRIGGERED) || {};
    const cleaned = {};
    Object.keys(triggered).forEach(key => {
      if (key.startsWith(today)) {
        cleaned[key] = triggered[key];
      }
    });
    wx.setStorageSync(KEY_TRIGGERED, cleaned);
  },

  // ==========================================================
  // 生命周期：页面加载
  // ==========================================================
  onLoad() {
    // ✅ 问题3修复：移除冗余的初始值setData，仅保留必要动态逻辑
    const today = this._getTodayStr();
    this.setData({ currentDate: today });

    const savedRole   = wx.getStorageSync(KEY_ROLE);
    const savedFamily = wx.getStorageSync(KEY_FAMILY);

    if (savedRole && savedRole.role) {
      const members = (savedFamily && savedFamily.members) || [];
      const myCode  = (savedFamily && savedFamily.myCode) || this._genBindCode();
      this.setData({
        role:          savedRole.role,
        selectedTitle: savedRole.title,
        isBound:       members.length > 0,
        familyMembers: members,
        bindCode:      myCode,
        pageReady:     true
      });
      this._loadLocalData();
    } else {
      this.setData({
        showIdentityModal: true,
        bindCode:          this._genBindCode(),
        pageReady:         true
      });
    }

    // ✅ 问题2修复：onLoad 末尾调用清理逻辑
    this._cleanExpiredTriggered();
  },

  // ==========================================================
  // 生命周期：页面进入前台（每次 show 都刷新数据并启动轮询）
  // ==========================================================
  onShow() {
    if (this.data.role) {
      this._loadLocalData();
      // 启动用药提醒前台轮询
      // ⚠️ 注意：onShow 触发时小程序在前台，轮询有效
      this._startMedCheckTimer();
    }
  },

  // ==========================================================
  // 生命周期：页面切到后台/隐藏（停止轮询，避免资源占用）
  // ==========================================================
  onHide() {
    // ⚠️ 当前提醒依赖前台运行，此处停止定时器
    // 用户退出小程序或切换到其他页面后提醒失效
    // 如需后台定时推送，需接入微信云开发定时触发器+服务通知
    this._stopMedCheckTimer();
  },

  onUnload() {
    this._stopMedCheckTimer();
    // 清理所有超时检测定时器
    Object.values(this._overdueTimers).forEach(t => clearTimeout(t));
    this._overdueTimers = {};
  },

  // ==========================================================
  // 【核心】从本地存储读取所有数据，按角色分发
  // 【本地存储】所有数据来源：wx.getStorageSync
  // ==========================================================
  _loadLocalData() {
    const { role, currentDate } = this.data;

    // 读取本地缓存数据
    const allMeds    = wx.getStorageSync(KEY_MEDS)    || [];
    const allMemos   = wx.getStorageSync(KEY_MEMOS)   || [];
    const allRecords = wx.getStorageSync(KEY_RECORDS) || [];

    if (role === 'elder') {
      // 老人视图：只展示已开启的用药提醒 + 今日重要备忘录
      const todayMeds  = allMeds.filter(m => m.enabled);
      const todayMemos = allMemos.filter(m => m.date === currentDate);

      this.setData({
        todayMeds,
        memoList:   allMemos,   // 完整列表供详情弹窗读取
        todayMemos,
        medRecords: allRecords
      });
    } else {
      // 晚辈视图：展示完整数据，可增删改
      this.setData({
        medicineList: allMeds,
        memoList:     allMemos,
        medRecords:   allRecords
      });
    }
  },

  // ==========================================================
  // 【身份选择逻辑】
  // 流程：点击身份项 → 确认 → 写入本地存储 → 渲染对应视图
  // ==========================================================

  /** 点击选择某一身份 */
  onSelectIdentity(e) {
    const item = e.currentTarget.dataset.item;
    // 仅更新选中状态，不立即生效，等待用户点击确认
    this.setData({
      role:          item.value,
      selectedTitle: item.label
    });
  },

  /** 确认身份，写入本地存储并进入对应视图 */
  onConfirmIdentity() {
    const { role, selectedTitle, bindCode } = this.data;
    if (!role) {
      wx.showToast({ title: '请先选择您的身份', icon: 'none' });
      return;
    }

    // 【本地存储】持久化角色信息
    wx.setStorageSync(KEY_ROLE, { role, title: selectedTitle });

    // 初始化家庭信息（写入我的绑定码）
    const savedFamily = wx.getStorageSync(KEY_FAMILY) || {};
    if (!savedFamily.myCode) {
      savedFamily.myCode  = bindCode;
      savedFamily.members = savedFamily.members || [];
      wx.setStorageSync(KEY_FAMILY, savedFamily);
    }

    this.setData({ showIdentityModal: false });
    this._loadLocalData();
    this._startMedCheckTimer();
  },

  /** 重置身份（清除本地角色缓存，回到身份选择页） */
  onResetIdentity() {
    wx.showModal({
      title:   '确认重置身份',
      content: '重置后需重新选择身份，用药记录和备忘录数据不会丢失，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync(KEY_ROLE);
          this._stopMedCheckTimer();
          this.setData({
            role:              null,
            selectedTitle:     '',
            showIdentityModal: true
          });
        }
      }
    });
  },

  // ==========================================================
  // 【家庭绑定逻辑】
  // 说明：当前为本地模拟绑定，实际跨账号同步需接入云开发
  // ==========================================================

  /** 展开/收起绑定面板 */
  toggleBindPanel() {
    this.setData({ showBindPanel: !this.data.showBindPanel });
  },

  /** 选择绑定方式 */
  onSelectBindMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ bindMethod: method });

    if (method === 'qr' || method === 'friend') {
      // 二维码/好友方式：提示复制绑定码分享给家人
      this._showShareBindCode();
    }
    // 'wxid' 方式由 wxml 表单处理，此处不额外操作
  },

  /**
   * 【绑定方式1&2：好友绑定/二维码绑定】
   * 本地版本：将绑定码复制到剪贴板，手动分享给家人
   * 家人输入绑定码后在"输入家人绑定码"处确认完成本地绑定
   * 注：真正跨账号同步需接入云开发数据库
   */
  _showShareBindCode() {
    const { bindCode } = this.data;
    wx.showModal({
      title:       '分享绑定码给家人',
      content:     `您的绑定码是【${bindCode}】\n\n请将此码告知家人，家人在"孝亲守护"页面输入此码即可完成绑定。`,
      confirmText: '复制绑定码',
      cancelText:  '知道了',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data:    bindCode,
            success: () => wx.showToast({ title: '绑定码已复制', icon: 'success' })
          });
        }
      }
    });
  },

  /** 输入微信号 */
  onInputWxId(e) {
    this.setData({ inputWxId: e.detail.value });
  },

  /**
   * 【绑定方式3：微信号绑定】
   * 本地版本：记录对方微信号为"待绑定"成员，模拟发送申请
   * 注：真正需对方确认需接入云开发推送
   */
  onSubmitWxIdBind() {
    const { inputWxId } = this.data;
    if (!inputWxId.trim()) {
      wx.showToast({ title: '请输入对方微信号', icon: 'none' });
      return;
    }
    wx.showModal({
      title:      '申请已发送（本地模拟）',
      content:    `已记录向微信号【${inputWxId}】发起绑定邀请。\n\n注意：当前为本地模拟，实际跨账号绑定需双方在同一设备或接入云开发。`,
      showCancel: false
    });
    this.setData({ inputWxId: '' });
  },

  /** 输入对方的绑定码 */
  onInputBindCode(e) {
    this.setData({ inputBindCode: e.detail.value });
  },

  /**
   * 确认绑定码绑定
   * 【本地存储】将新成员写入 KEY_FAMILY 缓存
   */
  onConfirmBindCode() {
    const { inputBindCode, familyMembers, role, bindCode } = this.data;

    if (!inputBindCode || inputBindCode.length < 6) {
      wx.showToast({ title: '请输入完整的6位绑定码', icon: 'none' });
      return;
    }

    // 防止重复绑定
    if (familyMembers.some(m => m.code === inputBindCode)) {
      wx.showToast({ title: '该成员已绑定，无需重复操作', icon: 'none' });
      return;
    }

    // 根据自身角色推断对方角色
    const peerRole   = role === 'elder' ? 'junior' : 'elder';
    const peerName   = peerRole === 'elder' ? '长辈家人' : '晚辈家人';
    const newMember  = {
      name:       peerName,
      code:       inputBindCode,
      role:       peerRole,
      bindTime:   new Date().toLocaleString()
    };

    const members    = [...familyMembers, newMember];
    const familyInfo = {
      myCode:  bindCode,
      members
    };

    // 【本地存储】更新家庭绑定信息
    wx.setStorageSync(KEY_FAMILY, familyInfo);

    this.setData({
      familyMembers:  members,
      isBound:        true,
      inputBindCode:  '',
      showBindPanel:  false
    });

    wx.showToast({ title: '绑定成功！', icon: 'success', duration: 2000 });
  },

  // ==========================================================
  // 【用药提醒 — 晚辈管理端】
  // ==========================================================

  /** 打开新增用药表单 */
  onShowAddMed() {
    this.setData({
      showAddMedForm: true,
      medForm: { name: '', dose: '', note: '', time: '', enabled: true }
    });
  },

  /** 关闭新增用药表单 */
  onCloseAddMed() {
    this.setData({ showAddMedForm: false });
  },

  /** 表单字段输入处理 */
  onMedInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`medForm.${field}`]: e.detail.value });
  },

  /** 选择提醒时间 */
  onPickMedTime(e) {
    this.setData({ 'medForm.time': e.detail.value });
  },

  /**
   * 保存用药提醒
   * 【本地存储】新增条目后写入 KEY_MEDS
   */
  onSaveMed() {
    const { medForm, medicineList } = this.data;

    if (!medForm.name || !medForm.name.trim()) {
      wx.showToast({ title: '请填写药品名称', icon: 'none' });
      return;
    }
    if (!medForm.time) {
      wx.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    // ✅ 问题6修复：药品名称长度校验
    if (medForm.name.length > 20) {
      wx.showToast({ title: '药品名称不超过20字', icon: 'none' });
      return;
    }

    const newMed = {
      id:         Date.now().toString(),
      name:       medForm.name.trim(),
      dose:       medForm.dose.trim(),
      note:       medForm.note.trim(),
      time:       medForm.time,
      enabled:    true,
      createTime: new Date().toLocaleString()
    };

    const updatedList = [...medicineList, newMed];

    // 【本地存储】写入用药清单
    wx.setStorageSync(KEY_MEDS, updatedList);

    this.setData({
      medicineList:   updatedList,
      showAddMedForm: false
    });

    wx.showToast({ title: '用药提醒已添加', icon: 'success' });
  },

  /**
   * 删除用药提醒
   * 【本地存储】过滤后重新写入 KEY_MEDS
   */
  onDeleteMed(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title:   '确认删除',
      content: '删除后将停止该药品的提醒，打卡记录保留',
      success: (res) => {
        if (res.confirm) {
          const updatedList = this.data.medicineList.filter(m => m.id !== id);
          wx.setStorageSync(KEY_MEDS, updatedList);
          this.setData({ medicineList: updatedList });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  /**
   * 切换用药提醒开关
   * 【本地存储】toggle 后重新写入 KEY_MEDS
   */
  onToggleMedSwitch(e) {
    const id          = e.currentTarget.dataset.id;
    const updatedList = this.data.medicineList.map(m =>
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    wx.setStorageSync(KEY_MEDS, updatedList);
    this.setData({ medicineList: updatedList });
  },

  // ==========================================================
  // 【用药提醒闹钟 — 前台轮询方案】
  //
  // 实现原理：每 CHECK_INTERVAL 毫秒检查一次当前时间，
  //           与用药提醒列表的 time 字段（HH:mm）精确匹配，
  //           匹配到且未触发过（今日同一药品同一时间只触发一次）
  //           → 弹出老人端打卡弹窗 + 震动提醒
  //
  // ⚠️ 前台限制说明：
  //    此方案依赖小程序在屏幕前台运行，一旦用户退出小程序、
  //    手机熄屏或切换到其他 App，定时器随即停止，提醒失效。
  //    如需真正后台提醒，需后续接入：
  //    1. 微信云开发「定时触发器」云函数（每分钟扫描提醒时间）
  //    2. 微信「订阅消息」服务通知推送到用户微信
  // ==========================================================

  /** 启动用药提醒轮询定时器 */
  _startMedCheckTimer() {
    this._stopMedCheckTimer(); // 先清除旧定时器，防止重复
    this._checkMedReminder();  // 立即执行一次（onShow 时及时响应）
    this._checkTimer = setInterval(() => {
      this._checkMedReminder();
    }, CHECK_INTERVAL);

    log('[用药提醒] 前台轮询已启动，间隔：', CHECK_INTERVAL / 1000, '秒');
  },

  /** 停止轮询定时器 */
  _stopMedCheckTimer() {
    if (this._checkTimer) {
      clearInterval(this._checkTimer);
      this._checkTimer = null;
      log('[用药提醒] 前台轮询已停止');
    }
  },

  /**
   * 用药提醒核心检测逻辑
   * 仅在 role === 'elder' 时触发闹钟弹窗（老人端操作打卡）
   * 晚辈端不弹窗（避免干扰管理操作）
   */
  _checkMedReminder() {
    const { role, currentDate } = this.data;

    // 只有老人视图才触发本地打卡弹窗
    if (role !== 'elder') return;

    // 获取当前时分（格式 "HH:mm"，与 medForm.time 保持一致）
    const now  = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 【本地存储】读取用药清单和今日已触发记录
    const meds      = wx.getStorageSync(KEY_MEDS)        || [];
    const triggered = wx.getStorageSync(KEY_TRIGGERED)   || {};

    for (const med of meds) {
      if (!med.enabled)       continue; // 跳过已关闭的提醒
      if (med.time !== hhmm)  continue; // 时间不匹配，跳过

      // 今日唯一 key：日期_药品ID_时间（防止重复触发）
      const trigKey = `${currentDate}_${med.id}_${hhmm}`;
      if (triggered[trigKey]) continue; // 今天此时间已触发过，跳过

      // ---- 触发提醒 ----
      // 标记已触发，【本地存储】写回
      triggered[trigKey] = { time: hhmm, medId: med.id };
      wx.setStorageSync(KEY_TRIGGERED, triggered);

      // 弹出老人端打卡全屏弹窗
      this.setData({ showMedClock: true, clockMedInfo: med });

      // 震动提醒（连续两次，增强感知）
      wx.vibrateShort({ type: 'heavy' });
      setTimeout(() => wx.vibrateShort({ type: 'heavy' }), 400);

      log('[用药提醒] 触发弹窗：', med.name, hhmm);

      // 启动超时检测（30分钟内未打卡 → 本地记录超时状态）
      this._startOverdueCheck(med, trigKey);
    }
  },

  /**
   * 超时未打卡检测
   * 【本地存储】超时后在打卡记录中写入"超时未确认"标记
   * 注：当前为本地方案，实际推送晚辈需接入云开发
   */
  _startOverdueCheck(med, trigKey) {
    // 避免重复设置超时定时器
    if (this._overdueTimers[trigKey]) return;

    this._overdueTimers[trigKey] = setTimeout(() => {
      // ✅ 问题4修复：页面已卸载则跳过 setData
      if (!this.data) return;

      const records   = wx.getStorageSync(KEY_RECORDS) || [];
      const hasRecord = records.some(r => r.trigKey === trigKey);

      if (!hasRecord) {
        // 未打卡：写入"超时未确认"记录
        const overdueRecord = {
          id:         `overdue_${trigKey}`,
          trigKey,
          medId:      med.id,
          medName:    med.name,
          dose:       med.dose,
          status:     'overdue',        // 超时未确认
          time:       med.time,
          date:       this.data.currentDate,
          recordTime: new Date().toLocaleString()
        };

        const updatedRecords = [overdueRecord, ...records];
        wx.setStorageSync(KEY_RECORDS, updatedRecords);
        this.setData({ medRecords: updatedRecords });

        // 本地提示（晚辈端可查看）
        wx.showToast({
          title: `⚠️ ${med.name} 超时未打卡`,
          icon:  'none',
          duration: 3000
        });

        log('[超时提醒] 长辈未在', OVERDUE_MINUTES, '分钟内打卡：', med.name);
        // TODO：接入云开发后，此处调用云函数推送服务通知给晚辈
      }

      // 清理定时器记录
      delete this._overdueTimers[trigKey];
    }, OVERDUE_MINUTES * 60 * 1000);
  },

  // ==========================================================
  // 【用药打卡 — 老人端】
  // ==========================================================

  /**
   * 老人点击「已吃」或「未吃」打卡
   * status: 'taken'(已吃) | 'skipped'(未吃/跳过)
   * 【本地存储】打卡记录写入 KEY_RECORDS
   */
  onMedClock(e) {
    const status       = e.currentTarget.dataset.status;
    const { clockMedInfo, currentDate } = this.data;

    const record = {
      id:         Date.now().toString(),
      trigKey:    `${currentDate}_${clockMedInfo.id}_${clockMedInfo.time}`,
      medId:      clockMedInfo.id,
      medName:    clockMedInfo.name,
      dose:       clockMedInfo.dose,
      status,                             // 'taken' | 'skipped'
      time:       clockMedInfo.time,
      date:       currentDate,
      recordTime: new Date().toLocaleString()
    };

    // 【本地存储】读取记录列表，头部插入新记录，写回
    const records        = wx.getStorageSync(KEY_RECORDS) || [];
    const updatedRecords = [record, ...records];
    wx.setStorageSync(KEY_RECORDS, updatedRecords);

    this.setData({
      showMedClock: false,
      clockMedInfo: null,
      medRecords:   updatedRecords
    });

    const tips = {
      taken:   '✅ 已记录，按时服药很重要！',
      skipped: '已记录，请尽快补充服用'
    };
    wx.showToast({
      title:    tips[status] || '已记录',
      icon:     'none',
      duration: 2500
    });

    log('[打卡]', clockMedInfo.name, '-', status);
    // TODO：接入云开发后，此处调用云函数同步打卡状态给绑定晚辈
  },

  // ==========================================================
  // 【家庭备忘录 — 晚辈管理端】
  // ==========================================================

  /** 打开新增备忘录弹窗 */
  onShowAddMemo() {
    this.setData({
      showAddMemo: true,
      memoForm: { id: '', title: '', content: '', date: '', advanceDays: 1, images: [] }
    });
  },

  /** 关闭备忘录弹窗 */
  onCloseAddMemo() {
    this.setData({ showAddMemo: false });
  },

  /** 备忘录表单字段输入 */
  onMemoInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`memoForm.${field}`]: e.detail.value });
  },

  /** 选择重要日期 */
  onPickMemoDate(e) {
    this.setData({ 'memoForm.date': e.detail.value });
  },

  /**
   * 添加备忘录图片
   * 使用 wx.chooseMedia 选择图片，存储本地临时路径
   * 注：本地临时路径在小程序重启后失效，建议后续接入云存储持久化
   */
  onAddMemoImage() {
    const current = this.data.memoForm.images || [];
    const remain  = 3 - current.length;

    if (remain <= 0) {
      wx.showToast({ title: '最多上传3张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count:      remain,
      mediaType:  ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPaths    = res.tempFiles.map(f => f.tempFilePath);
        const updatedImgs = [...current, ...newPaths].slice(0, 3);
        this.setData({ 'memoForm.images': updatedImgs });

        // 注：此处为本地临时路径，退出小程序后路径失效
        // TODO：接入云开发后，在此处上传至云存储并替换为 fileID
        log('[图片上传] 本地临时路径（重启后失效）：', newPaths);
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '图片选择失败，请重试', icon: 'none' });
        }
      }
    });
  },

  /** 删除备忘录中的某张图片 */
  onDeleteMemoImage(e) {
    const idx         = e.currentTarget.dataset.index;
    const updatedImgs = [...this.data.memoForm.images];
    updatedImgs.splice(idx, 1);
    this.setData({ 'memoForm.images': updatedImgs });
  },

  /** 预览图片 */
  onPreviewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({ current, urls });
  },

  /**
   * 保存备忘录（新增或编辑）
   * 【本地存储】更新后写入 KEY_MEMOS
   */
  onSaveMemo() {
    const { memoForm, memoList } = this.data;

    if (!memoForm.title || !memoForm.title.trim()) {
      wx.showToast({ title: '请填写事项标题', icon: 'none' });
      return;
    }
    if (!memoForm.content || !memoForm.content.trim()) {
      wx.showToast({ title: '请填写事项内容', icon: 'none' });
      return;
    }

    // ✅ 问题6修复：备忘录标题和内容长度校验
    if (memoForm.title.length > 30) {
      wx.showToast({ title: '标题不超过30字', icon: 'none' });
      return;
    }
    if (memoForm.content.length > 200) {
      wx.showToast({ title: '内容不超过200字', icon: 'none' });
      return;
    }

    const isEdit = !!memoForm.id;
    const memo   = {
      id:          isEdit ? memoForm.id : Date.now().toString(),
      title:       memoForm.title.trim(),
      content:     memoForm.content.trim(),
      date:        memoForm.date,
      advanceDays: memoForm.advanceDays,
      images:      memoForm.images || [],
      createTime:  isEdit ? memoForm.createTime : new Date().toLocaleString(),
      updateTime:  new Date().toLocaleString()
    };

    let updatedList;
    if (isEdit) {
      updatedList = memoList.map(m => m.id === memo.id ? memo : m);
    } else {
      updatedList = [memo, ...memoList]; // 新增的放在最前面
    }

    // 【本地存储】写回备忘录列表
    wx.setStorageSync(KEY_MEMOS, updatedList);
    this.setData({ memoList: updatedList, showAddMemo: false });

    wx.showToast({
      title:    isEdit ? '备忘录已更新' : '备忘录已添加',
      icon:     'success'
    });

    log('[备忘录]', isEdit ? '编辑：' : '新增：', memo.title);
    // TODO：接入云开发后，此处同步数据到云数据库，供绑定家人实时查看
  },

  /** 编辑备忘录（填充表单后打开弹窗） */
  onEditMemo(e) {
    const id   = e.currentTarget.dataset.id;
    const memo = this.data.memoList.find(m => m.id === id);
    if (!memo) return;

    this.setData({
      showAddMemo: true,
      memoForm:    { ...memo, images: memo.images || [] }
    });
  },

  /**
   * 删除备忘录
   * 【本地存储】过滤后写入 KEY_MEMOS
   */
  onDeleteMemo(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title:   '确认删除',
      content: '删除后所有绑定家人将无法查看此备忘录，是否继续？',
      success: (res) => {
        if (res.confirm) {
          const updatedList = this.data.memoList.filter(m => m.id !== id);
          wx.setStorageSync(KEY_MEMOS, updatedList);
          this.setData({ memoList: updatedList });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  // ==========================================================
  // 【老人端 — 备忘录查看】
  // ==========================================================

  /** 老人点击查看今日重要事项 */
  onViewTodayMemo() {
    const { todayMemos, memoList } = this.data;
    const target = todayMemos.length > 0 ? todayMemos[0] : memoList[0];

    if (!target) {
      wx.showToast({ title: '暂无备忘事项', icon: 'none' });
      return;
    }

    this.setData({ showMemoDetail: true, currentMemo: target });
  },

  /** 关闭备忘录详情弹窗 */
  onCloseMemoDetail() {
    this.setData({ showMemoDetail: false, currentMemo: null });
  },

  // ==========================================================
  // 【工具方法】
  // ==========================================================

  /** 获取今日日期字符串，格式 "YYYY-MM-DD" */
  _getTodayStr() {
    const d   = new Date();
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  /** 生成6位随机数字绑定码 */
  _genBindCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
  },

  /** 阻止弹窗下层页面滚动穿透 */
  onModalStop() {},

  /** 返回上级页面 */
  onNavBack() {
    wx.navigateBack();
  }

});