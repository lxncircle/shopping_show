/* 
1获取用户的收获地址
    1 绑定点击事件
    2 调用小程序内置的 api  获取用户的收获地址
2获取地址...将获取到的收货地址存到本地存储中
3页面加载完毕
    1获取本地存储的地址数据
    2把数据 设置给data 的变量
4onShow
    0回到了商品详情页面  第一次添加商品的时候 手动添加了属性
        1num = 1;
        2checked = true;
    1获取缓存中的地址数据
    2把购物车数据 填充到data中
5全选的实现  数据的展示
    1.onShow获取缓存中的购物车数组
    2.根据购物车中的商品数据  所有的商品都被选中  checked=true  全选就被选中
6总价格和总数量
    1都需要商品被选中  我们才拿它来计算
    2获取购物车数组
    3遍历
    4判断商品是否被选中 总价格 += 商品的单价 * 数量   总数量 += 商品的数量
    5把计算后的价格和数量  设置回data中即可
7商品选中
    1绑定change事件
    2获取到被修改的商品对象
    3商品对象的选中对象  取反
    4重新填充回data中和缓存中
    5重新计算全选、总价格、总数量
8全选和反选
    1全选复选框绑定事件   change
    2获取data中的全选变量  allChecked
    3直接取反
    4遍历购物车数组 让里面商品选中状态跟随 allChecked 改变而改变
    5把购物车数组和allChecked设置回data，购物车设置回缓存中
9商品数量的编辑
    1 "+" "-"按钮  绑定同一个点击事件 区分关键 自定义属性
      1 "+" +1
      2 "-" -1
    2传递被点击的商品id  goods_id
    3获取data中购物车数组，来获取需要被修改的商品对象
    4 当购物车的数量 = 1 同时用户点击"-"
      弹窗询问(showModal)是否删除
      1确定  直接删除
      2取消  什么都不做
    4修改商品对象的数量 num
    5把cart数组设置回缓存和data中 重新计算价格：this.setCart()
10点击结算
    1判断有无收货地址信息
    2判断有无选购商品
    3经过以上验证  跳转到支付页面
 */

import { getSetting, chooseAddress, openSetting, showModal, showToast } from '../../utils/asyncWx'
import regeneratorRuntime, { async } from '../../lib/runtime/runtime'

Page({
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0,
  },
  onShow() {
    // 1获取缓存中的收货地址信息
    const address = wx.getStorageSync('address')
    this.setData({
      address,
    })
    // 1获取缓存中的购物车数据
    const cart = wx.getStorageSync('cart') || []
    this.setCart(cart)
    this.setData({
      address,
    })
  },
  // 点击 收货地址
  async handChooseAddress() {
    try {
      // 1获取 权限状态
      const res1 = await getSetting()
      const scopeAddress = res1.authSetting['scope.address']
      // 2 判断 权限状态
      if (scopeAddress === false) {
        // 3先诱导用户打开授权页面
        await openSetting()
      }
      // 4调用获取收获地址的api
      let address = await chooseAddress()
      address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo
      // 5 存入到缓存中
      wx.setStorageSync('address', address)
    } catch (error) {
      console.log(error)
    }
  },
  // 商品选中
  handleItemChange(e) {
    // 1获取被修改的商品的id
    const goods_id = e.currentTarget.dataset.id
    // 2获取购物车数组
    let { cart } = this.data
    // 3找到被修改的商品对象
    let index = cart.findIndex((v) => v.goods_id === goods_id)
    // 4选中状态取反
    cart[index].checked = !cart[index].checked
    // 5 6 把购物车数据重新设置回data中和缓存中
    this.setCart(cart)
  },
  // 设置购物车状态同时  重新计算  底部工具栏的数据  全选  总价格 购买数量
  setCart(cart) {
    let allChecked = true
    let totalPrice = 0
    let totalNum = 0
    cart.forEach((v) => {
      if (v.checked) {
        totalPrice += v.goods_price * v.num
        totalNum += v.num
      } else {
        allChecked = false
      }
    })
    // 判断数组是否为空
    allChecked = cart.length != 0 ? allChecked : false
    this.setData({
      cart,
      allChecked,
      totalPrice,
      totalNum,
    })
    wx.setStorageSync('cart', cart)
  },
  // 商品的全选功能
  handleItemAllCheck(e) {
    // 1获取data中的数据
    let { cart, allChecked } = this.data
    // 2修改值
    allChecked = !allChecked
    // 3循环修改cart数组 中的商品选中状态
    cart.forEach((v) => (v.checked = allChecked))
    // 4把修改后的值 填充回data或缓存中
    this.setCart(cart)
  },
  // 商品数量编辑功能
  async handleItemNumEdit(e) {
    // 1获取传递过来的参数
    const { operation, id } = e.currentTarget.dataset
    // 2获取购物车数组
    let { cart } = this.data
    // 3找到需要修改的索引
    const index = cart.findIndex((v) => v.goods_id === id)
    // 4判断是否需要删除
    if (cart[index].num === 1 && operation === -1) {
      // 4.1弹窗提示
      const res = await showModal({ content: '您是否删除？' })
      if (res.confirm) {
        cart.splice(index, 1)
        this.setCart(cart)
      }
    } else {
      // 4修改数量
      cart[index].num += operation
      // 5设置回缓存和data
      this.setCart(cart)
    }
  },
  // 点击结算
  async handlePay() {
    // 验证地址
    const { address, totalNum } = this.data
    if (!address.userName) {
      await showToast({ title: '您还没有选择收获地址' })
      return
    }
    // 验证商品
    if (totalNum === 0) {
      await showToast({ title: '您还没有选购商品' })
      return
    }
    // 验证成功 跳转支付页面
    wx.navigateTo({
      url: '/pages/pay/index',
    })
  },
})
