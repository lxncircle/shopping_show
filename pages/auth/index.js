import { login } from '../../utils/asyncWx'
import regeneratorRuntime, { async } from '../../lib/runtime/runtime'
import { request } from '../../request/index.js'

Page({
  // 获取用户信息
  async handeleGetUserInfo(e) {
    try {
      // 1获取用户信息
      const { encryptedData, rawData, iv, signature } = e.detail
      // 2获取小程序登录成功后的code
      const { code } = await login()
      const loginParams = { encryptedData, rawData, iv, signature, code }
      // 3发送请求 获取用户的token值
      const { token } = await request({ url: '/users/wxlogin', data: loginParams, method: 'post' })
      // 4把token存入缓存中  同时跳转回上一个页面
      wx.setStorageSync('token', token)
      wx.navigateBack({
        delta: 1,
      })
    } catch (error) {
      console.log(error)
    }
  },
})
