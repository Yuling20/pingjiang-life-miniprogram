// pages/ai/ai.js
const SENSITIVE_WORDS = ['赌博','诈骗','色情','毒品','暴力','反动','违法']
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60000
Page({
  data: {
    messages: [],
    inputValue: '',
    loading: false,
    scrollToView: '',
    quickReplies: ['补办身份证','停电查询','找租房','找工作']
  },
  _rateLimit: {count:0,windowStart:0},
  onLoad() {this.initChat()},
  initChat(){
    const welcomeMsg={id:'welcome',role:'assistant',content:`你好！我是平江汇AI小助手"小汇" 😊\n\n我可以帮你解答：\n• 政务办事流程\n• 租房租赁查询\n• 招聘求职建议\n• 停水停电查询\n• 证件补办指引\n• 本地生活问答\n\n请问有什么需要帮助的？`,time:this.getTime()}
    this.setData({messages:[welcomeMsg]})
  },
  onInput(e){this.setData({inputValue:e.detail.value})},
  onSend(){
    const content=this.data.inputValue.trim()
    if(!content){wx.showToast({title:'请输入内容',icon:'none'})
      return}
    const hitWord=SENSITIVE_WORDS.find(w=>content.includes(w))
    if(hitWord){wx.showToast({title:'内容含敏感词，请修改后重试',icon:'none',duration:2000})
      return}
    const now=Date.now()
    if(now-this._rateLimit.windowStart>RATE_LIMIT_WINDOW){
      this._rateLimit.count=0
      this._rateLimit.windowStart=now
    }
    this._rateLimit.count++
    if(this._rateLimit.count>RATE_LIMIT_MAX){wx.showToast({title:'发送太频繁，请稍后再试',icon:'none',duration:2000})
      return}
    this.sendMessage(content)
  },
  onQuickReply(e){
    const text=e.currentTarget.dataset.text
    if(!text||this.data.loading)return
    this.setData({inputValue:text})
    this.onSend()
  },
  onClear(){
    wx.showModal({title:'提示',content:'确认清空所有聊天记录？',success:(res)=>{
      if(res.confirm){this.setData({messages:[]})
        this.initChat()}}})
  },
  sendMessage(content){
    const userMsg={id:`u_${Date.now()}`,role:'user',content,time:this.getTime()}
    const messages=[...this.data.messages,userMsg]
    this.setData({messages,inputValue:'',loading:true,scrollToView:userMsg.id})
    const historyMsgs=messages.slice(-6).map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content}))
    wx.request({
      url:'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      method:'POST',
      header:{
        'Content-Type':'application/json',
        'Authorization':'Bearer api-key-20260526230045'
      },
      data:{
        model:'ep-20260526225719-ntbpw',
        messages:[
          {role:'system',content:'你是平江汇生活小程序的AI助手"小汇"，专门服务湖南省平江县居民。请用简洁、友好的语言回答政务办事、本地生活、停水停电、房屋租赁、招聘求职等问题。不涉及的内容礼貌拒绝回答。'},
          ...historyMsgs
        ],
        max_tokens:500,
        temperature:0.7
      },
      success:(res)=>{
        if(res.statusCode===200&&res.data?.choices?.[0]?.message?.content){
          const aiContent=res.data.choices[0].message.content
          const aiMsg={id:`a_${Date.now()}`,role:'assistant',content:aiContent,time:this.getTime()}
          const newMessages=[...this.data.messages,aiMsg]
          this.setData({messages:newMessages,loading:false,scrollToView:aiMsg.id})
        }else{
          this.showError('AI响应异常，请稍后重试',res.statusCode)
        }
      },
      fail:(err)=>{
        console.error('请求失败：',err)
        this.showError('网络连接失败，请检查网络')
      }
    })
  },
  showError(text,code){
    const errMsg={id:`e_${Date.now()}`,role:'assistant',content:`⚠️ ${text}${code?`（错误码：${code}）`:''}`,time:this.getTime(),isError:true}
    this.setData({messages:[...this.data.messages,errMsg],loading:false,scrollToView:errMsg.id})
  },
  getTime(){
    const now=new Date()
    const h=String(now.getHours()).padStart(2,'0')
    const m=String(now.getMinutes()).padStart(2,'0')
    return `${h}:${m}`
  }
})