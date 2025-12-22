// 好友验证信息
export interface IFriendValidInfo {
  userId: string; // 用户Id
  nickName: string; // 昵称
  avatar: string; // 头像
  message: string; // 附加消息
  source: string; // 添加好友来源：email/qrcode
  id: number; // 验证记录Id
  flag: string; // send 发送者 receive 接收者
  status: number; // 状态 0 未处理 1 同意 2 拒绝
  createdAt: string; // 验证时间
}

// 好友验证列表响应
export interface IValidListRes {
  list: IFriendValidInfo[];
  count: number;
}

// 好友列表响应
export interface IavatarRes {
  list: IFriendInfo[];
}

// 好友信息
export interface IFriendInfo {
  userId: string;
  nickName: string;
  avatar: string;
  abstract: string;
  notice: string;
  isFriend: boolean;
  conversationId: string;
  email: string;
  source?: string; // 好友关系来源：email/qrcode
}

// 好友列表请求
export interface IavatarReq {
  page?: number;
  limit?: number;
}

// 好友信息请求
export interface IFriendInfoReq {
  friendId: string;
}

// 添加好友请求
export interface IAddFriendReq {
  friendId: string;
  verify?: string;
  source: string; // 添加好友来源：email(邮箱搜索)/qrcode(扫码)
}

// 添加好友响应
export interface IAddFriendRes {}

// 删除好友请求
export interface IFriendDeleteReq {
  friendId: string;
}

// 删除好友响应
export interface IFriendDeleteRes {}

// 搜索请求
export interface ISearchReq {
  email: string;
}

// 搜索响应
export interface ISearchRes {
  userId: string;
  nickName: string;
  avatar: string;
  abstract: string;
  notice: string;
  isFriend: boolean;
  conversationId: string;
  email: string;
}

// 好友验证状态请求
export interface IFriendValidStatusReq {
  verifyId: number;
  status: number;
}

// 好友验证状态响应
export interface IFriendValidStatusRes {}

// 验证列表请求
export interface IValidListReq {
  page?: number;
  limit?: number;
}

// 修改备注请求
export interface INoticeUpdateReq {
  notice: string;
  friendId: string;
}

// 修改备注响应
export interface INoticeUpdateRes {}

// 搜索验证信息请求
export interface ISearchValidInfoReq {
  friendId: string;
}

// 搜索验证信息响应
export interface ISearchValidInfoRes {
  validId: number;
}

// 兼容旧版本的接口名称
export interface IValidInfo extends IFriendValidInfo {}
export interface IValidStatusReq extends IFriendValidStatusReq {}
export interface IValidStatusRes extends IFriendValidStatusRes {}
export interface IDeleteFriendReq extends IFriendDeleteReq {}
export interface IDeleteFriendRes extends IFriendDeleteRes {}
export interface IResSearchUserInfo extends ISearchRes {}