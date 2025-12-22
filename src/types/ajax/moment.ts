// 文件信息
export interface IFileInfo {
  /**
   * @description: 文件名
   */
  fileKey: string;
}

// 动态模型
export interface IMomentModel {
  /**
   * @description: 动态ID
   */
  id: number;
  /**
   * @description: 用户ID
   */
  userId: string;
  /**
   * @description: 用户名
   */
  userName: string;
  /**
   * @description: 用户头像文件ID
   */
  fileKey: string;
  /**
   * @description: 动态内容
   */
  content: string;
  /**
   * @description: 文件信息列表
   */
  files: IFileInfo[];
  /**
   * @description: 评论列表
   */
  comments: IMomentCommentModel[];
  /**
   * @description: 点赞列表
   */
  likes: IMomentLikeModel[];
  /**
   * @description: 动态创建时间
   */
  createdAt: string;
}

// 点赞模型
export interface IMomentLikeModel {
  /**
   * @description: 点赞ID
   */
  id: number;
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 用户ID
   */
  userId: string;
  /**
   * @description: 点赞时间
   */
  createdAt: string;
  /**
   * @description: 用户名
   */
  userName: string;
  /**
   * @description: 用户头像文件ID
   */
  fileKey: string;
}

// 评论模型
export interface IMomentCommentModel {
  /**
   * @description: 评论ID
   */
  id: number;
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 用户ID
   */
  userId: string;
  /**
   * @description: 评论内容
   */
  content: string;
  /**
   * @description: 评论时间
   */
  createdAt: string;
}

// 创建动态请求
export interface ICreateMomentReq {
  /**
   * @description: 动态内容
   */
  content: string;
  /**
   * @description: 文件信息列表
   */
  files: IFileInfo[];
}

// 创建动态响应
export interface ICreateMomentRes {}

// 获取动态列表请求
export interface IGetMomentsReq {
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  limit: number;
}

// 获取动态列表响应
export interface IGetMomentsRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 动态列表
   */
  list: IMomentModel[];
}

// 点赞动态请求
export interface ILikeMomentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 点赞状态 true: 点赞 false: 取消点赞
   */
  status: boolean;
}

// 点赞动态响应
export interface ILikeMomentRes {}

// 获取单个动态详情请求
export interface IGetMomentInfoReq {
  /**
   * @description: 动态ID
   */
  momentId: string;
}

// 获取单个动态详情响应
export interface IGetMomentInfoRes {
  /**
   * @description: 动态信息
   */
  moment: IMomentModel;
}

// 删除动态请求
export interface IDeleteMomentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
}

// 删除动态响应
export interface IDeleteMomentRes {}

// 添加评论请求
export interface IAddCommentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 评论内容
   */
  content: string;
  /**
   * @description: 回复的评论ID，可选
   */
  replyTo?: number;
}

// 添加评论响应
export interface IAddCommentRes {
  /**
   * @description: 评论ID
   */
  commentId: number;
}

// 删除评论请求
export interface IDeleteCommentReq {
  /**
   * @description: 评论ID
   */
  commentId: number;
}

// 删除评论响应
export interface IDeleteCommentRes {}

// 更新动态可见性请求
export interface IMomentVisibilityReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 可见性设置：0-公开 1-仅好友可见 2-部分可见 3-不给谁看
   */
  visibility: number;
  /**
   * @description: 允许查看的用户列表，当visibility=2时使用
   */
  allowList?: string[];
  /**
   * @description: 禁止查看的用户列表，当visibility=3时使用
   */
  blockList?: string[];
}

// 更新动态可见性响应
export interface IMomentVisibilityRes {}

// 获取动态评论列表请求
export interface IMomentCommentListReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 页码，可选
   */
  page?: number;
  /**
   * @description: 每页数量，可选
   */
  limit?: number;
}

// 获取动态评论列表响应
export interface IMomentCommentListRes {
  /**
   * @description: 评论列表
   */
  list: IMomentCommentModel[];
  /**
   * @description: 总数
   */
  count: number;
}

// 更新动态请求
export interface IUpdateMomentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 动态内容
   */
  content: string;
  /**
   * @description: 文件信息列表，可选
   */
  files?: IFileInfo[];
}

// 更新动态响应
export interface IUpdateMomentRes {}

// 获取我的动态列表请求
export interface IGetMyMomentsReq {
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  limit: number;
}

// 获取我的动态列表响应
export interface IGetMyMomentsRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 动态列表
   */
  list: IMomentModel[];
}

// 获取好友动态列表请求
export interface IGetFriendsMomentsReq {
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  limit: number;
}

// 获取好友动态列表响应
export interface IGetFriendsMomentsRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 动态列表
   */
  list: IMomentModel[];
}

// 更新评论请求
export interface IUpdateCommentReq {
  /**
   * @description: 评论ID
   */
  commentId: number;
  /**
   * @description: 评论内容
   */
  content: string;
}

// 更新评论响应
export interface IUpdateCommentRes {}

// 获取评论详情请求
export interface IGetCommentInfoReq {
  /**
   * @description: 评论ID
   */
  commentId: number;
}

// 获取评论详情响应
export interface IGetCommentInfoRes {
  /**
   * @description: 评论信息
   */
  comment: IMomentCommentModel;
}

// 获取点赞列表请求
export interface IGetLikesListReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 页码，可选
   */
  page?: number;
  /**
   * @description: 每页数量，可选
   */
  limit?: number;
}

// 获取点赞列表响应
export interface IGetLikesListRes {
  /**
   * @description: 点赞列表
   */
  list: IMomentLikeModel[];
  /**
   * @description: 总数
   */
  count: number;
}

// 举报动态请求
export interface IReportMomentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 举报原因
   */
  reason: string;
  /**
   * @description: 举报图片，可选
   */
  images?: IFileInfo[];
}

// 举报动态响应
export interface IReportMomentRes {}

// 收藏动态请求
export interface IFavoriteMomentReq {
  /**
   * @description: 动态ID
   */
  momentId: number;
  /**
   * @description: 收藏状态 true: 收藏 false: 取消收藏
   */
  status: boolean;
}

// 收藏动态响应
export interface IFavoriteMomentRes {}
