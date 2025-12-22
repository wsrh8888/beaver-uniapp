export interface IAddFriend {
  friendId: string;
  verify: string;
}
export interface ISearchUser {
  email: string;
}
export interface IResSearchUserInfo {
  Abstract: string;
  fileKey: string;
  conversationId: string;
  isFriend: boolean;
  nickName: string;
  notice: string;
  userId: string;
}
