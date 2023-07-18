/* 
1 页面加载的时候
    1从缓存中获取购物车数据  渲染到页面中  这些数据checked = true
2 微信支付
    1哪些人 哪些账号 可以实现微信支付
      1 企业账号 
      2企业账号中的小程序后台中 必须给开发者 添加上白名单
        1一个appid可以同时绑定多个开发者
        2这些开发者就可以公用这个appid和它的开发权限
3支付按钮
    1先判断缓存中有没有token
    2没有 跳转到授权页面 进行获取token
    3有token
    4创建订单  获取订单编号
    5已完成微信支付
    6手动删除缓存中已经被选中的商品
    7删除后的购物车数据  填充回缓存
    8在跳转页面

 */
import { getSetting, chooseAddress, openSetting, showModal, showToast, requestPayment } from '../../utils/asyncWx'
import regeneratorRuntime, { async } from '../../lib/runtime/runtime'
import { request } from '../../request/index.js'

Page({
  data: {
    address: {},
    cart: [],
    totalPrice: 0,
    totalNum: 0,
  },
  onShow() {
    // 1获取缓存中的收货地址信息
    const address = wx.getStorageSync('address')
    // 1获取缓存中的购物车数据
    let cart = wx.getStorageSync('cart') || []
    // 过滤后的购物车数组
    cart = cart.filter((v) => v.checked)
    let totalPrice = 0
    let totalNum = 0
    cart.forEach((v) => {
      totalPrice += v.goods_price * v.num
      totalNum += v.num
    })
    // 判断数组是否为空
    this.setData({
      cart,
      address,
      totalPrice,
      totalNum,
    })
  },
  // 点击 支付
  async handleOrderPay() {
    try {
      // 1判断缓存中有没有token
      const token = wx.getStorageSync('token')
      // 2判断
      if (!token) {
        wx.navigateTo({
          url: '/pages/auth/index',
        })
        return
      }
      // 3创建订单
      // 3.1准备  请求头参数
      // const header = { Authorization: token }   //在request封装好
      // 3.2准备  请求体参数
      const order_price = this.data.totalPrice
      const consignee_addr = this.data.address.all
      const cart = this.data.cart
      let goods = []
      cart.forEach((v) =>
        goods.push({
          goods_id: v.goods_id,
          goods_number: v.num,
          goods_price: v.goods_price,
        })
      )
      const orderParams = { order_price, consignee_addr, goods }
      // 4准备发送请求  创建订单  获取订单编号
      const order_number = await request({
        url: '/my/orders/create',
        method: 'post',
        data: orderParams,
        // header,
      })
      console.log(order_number)
      // 5发起 预支付接口
      const pay = await request({
        url: '/my/orders/req_unifiedorder',
        method: 'post',
        // header,
        data: { order_number },
      })

      // 6发起微信支付
      await requestPayment(pay)
      // 7查询后台 订单状态
      const res = await request({
        url: '/my/orders/chkOrder',
        method: 'post',
        // header,
        data: { order_number },
      })
      await showToast({ title: '支付成功' })
      // 8手动删除缓存中 已经支付的商品
      let newCart = wx.getStorageSync('cart')
      newCart = newCart.filter((v) => !v.checked)
      wx.setStorageSync('cart', newCart)

      // 8跳转到订单页面
      wx.navigateTo({
        url: '/pages/order/index',
      })
    } catch (error) {
      console.log(error)
      await showToast({ title: '支付成功' })
    }
  },
})
