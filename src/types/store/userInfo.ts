export interface IUserInfo {
  userId: string;
  nickName: string;
  avatar: string;
}

export interface IBasicUserInfo {
  userId: string;
  nickName: string;
  avatar: string;
}

export interface IFriendUserInfo {
  /**
   * @description: 好友ID
   */  
  userId: string;
  /**
   * @description: 好友昵称
   */  
  nickName: string;
  /**
   * @description: 好友头像
   */  
  avatar: string;
  /**
   * @description: 好友备注
   */
  remark?: string;

  /**
   * @description: 是否是好友
   */
  isFriend?: boolean;
}