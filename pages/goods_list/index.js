/*
1.用户上滑 滚动条触底  开始加载下一页数据
  1找到滚动条触底事件
  2判断还有没有下一页数据
    1获取到总页数 只有总条数
      总条数 = Math.ceil(总条数 / 页容量 pagesize)
      总页数   = Math。ceil(23 / 10) = 3
    2获取到当前的页码   pagenum
    3判断一下 当前的页码是否大于等于  总页数
      表示  没有下一页数据
  3加入没有下一页数据 弹出一个提示
  4加入还有下一页数据  来加载下一页数据
    1当前的页码 ++
    2重新发送请求
    3数据请求回来 要对data中的数组进行拼接 而不是全部替换！！，否则前面请求的数据会丢失

2.下拉刷新页面
  1触发下拉刷新事件    需要在页面的json页面文件中开启一个配置项
    找到 触发下拉刷新的事件
  2重置 数据 数组
  3重置页码 设置为1
  4重新发送请求
  5数据请求回来  需要手动的关闭  等待效果

   
*/

import { request } from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: '综合',
        isActive: true,
      },
      {
        id: 1,
        value: '销量',
        isActive: false,
      },
      {
        id: 2,
        value: '价格',
        isActive: false,
      },
    ],
    goodsList: [],
  },
  // 接口要的参数
  QueryParams: {
    query: '',
    cid: '',
    pagenum: 1,
    pagesize: 10,
  },
  totalPages: 1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.QueryParams.cid = options.cid || ''
    this.QueryParams.query = options.query || ''
    this.getGoodList()

    setTimeout(function () {
      wx.hideLoading()
    }, 5000)
  },

  //获取商品列表数据
  async getGoodList() {
    const res = await request({ url: '/goods/search', data: this.QueryParams })
    // 获取 总条数
    const total = res.total
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize)
    // console.log(this.totalPages)
    this.setData({
      //拼接数组
      goodsList: [...this.data.goodsList, ...res.goods],
    })
    // 关闭下拉刷新的窗口 如果没有调用下拉刷新的窗口 直接关闭也不会报错
    wx.stopPullDownRefresh()
  },

  handleTabsItemChange(e) {
    const { index } = e.detail
    let { tabs } = this.data
    tabs.forEach((v, i) => (i === index ? (v.isActive = true) : (v.isActive = false)))
    this.setData({
      tabs,
    })
  },
  // 页面上滑  滚动条触底事件
  onReachBottom() {
    if (this.QueryParams.pagenum >= this.totalPages) {
      //没有下一页数据了
      // console.log('无')
      wx.showToast({
        title: '没有下一页数据了',
      })
    } else {
      //还有下一页数据
      // console.log('还有')
      this.QueryParams.pagenum++
      this.getGoodList()
    }
  },
  //下拉刷新
  onPullDownRefresh() {
    // 1.重置数组
    this.setData({
      goodsList: [],
    })
    // 2.重置页码
    this.QueryParams.pagenum = 1
    // 3.发送请求
    this.getGoodList()
  },
})
