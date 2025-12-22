

// 用户信息请求
export interface IUserInfoReq {}

// 用户信息响应
export interface IUserInfoRes {
  userId: string;
  nickName: string;
  fileKey: string; // 修正：服务器端是fileName不是avatar
  abstract: string;
  
  phone?: string;
  email: string;
  gender: number;
}

// 更新用户信息请求
export interface IUpdateInfoReq {
  nickName?: string;
  fileKey?: string; // 修正：服务器端是fileName不是avatar
  abstract?: string;
  gender?: number;
  email?: string;
}

// 更新用户信息响应
export interface IUpdateInfoRes {}

// 修改密码请求
export interface IUpdatePasswordReq {
  oldPassword: string;
  newPassword: string;
}

// 修改密码响应
export interface IUpdatePasswordRes {}

// 修改邮箱请求
export interface IUpdateEmailReq {
  email: string;
  code: string;
}

// 修改邮箱响应
export interface IUpdateEmailRes {}

// 找回密码请求
export interface IResetPasswordReq {
  email: string;
  code: string;
  password: string;
}

// 找回密码响应
export interface IResetPasswordRes {}

// 兼容旧版本的接口名称
export interface IRegisterReq {
  password: string;
  email: string;
  code: string;
}