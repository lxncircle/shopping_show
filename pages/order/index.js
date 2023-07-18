/* 
1页面被打开的时候 onShow
    0 onShow不同于onLoad无法在形参上接收 options参数
    0.5判断缓存中有无token
        1没有 直接跳转到授权页面
        2有  直接往下进行
    1获取url上的参数type
    2根据type来决定页面标题的数组元素 哪个被激活选中
    2根据type去发送请求获取订单参数
    3渲染页面
2点击不同标题  重新发送请求来获取和渲染数据
 */

import { request } from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    tabs: [
      {
        id: 0,
        value: '全部',
        isActive: true,
      },
      {
        id: 1,
        value: '待付款',
        isActive: false,
      },
      {
        id: 2,
        value: '待发货',
        isActive: false,
      },
      {
        id: 2,
        value: '退款/发货',
        isActive: false,
      },
    ],
  },

  onShow() {
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.navigateTo({
        url: '/pages/auth/index',
      })
      return
    }
    // 1 获取当前的小程序的页面栈-数组  长度最大是10页面
    let pages = getCurrentPages()
    // 2数组中  索引最大的页面就是当前页面
    let currentPage = pages[pages.length - 1]
    // 3获取url上的type参数
    const { type } = currentPage.options
    // 4激活选中页面标题
    this.changeTitleByIndex(type - 1)
    this.getOrders(type)
  },
  //获取订单列表的方法
  async getOrders(type) {
    const { res } = await request({
      url: '/my/orders/all',
      data: type,
    })
    this.setData({
      orders: res.orders.map((v) => ({ ...v, create_time_cn: new Date(v.create_time * 1000).toLocaleString() })),
    })
  },
  // 根据标题索引来激活选中  标题数组
  changeTitleByIndex(index) {
    // 2修改原数组
    let { tabs } = this.data
    tabs.forEach((v, i) => (i === index ? (v.isActive = true) : (v.isActive = false)))
    // 赋值data中
    this.setData({
      tabs,
    })
  },
  handleTabsItemChange(e) {
    // 1 获取被点击的标题索引
    const { index } = e.detail
    this.changeTitleByIndex(index)
    // 2 重新发送请求 type=1  index=0
    this.getOrders(index + 1)
  },
})
