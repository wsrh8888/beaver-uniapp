// 添加表情请求
export interface IAddEmojiReq {
  /**
   * @description: 表情文件ID
   */
  fileKey: string;
  /**
   * @description: 表情标题
   */
  title: string;
  /**
   * @description: 表情包ID，可选
   */
  packageId?: number;
}

// 添加表情响应
export interface IAddEmojiRes {}

// 更新表情收藏状态请求
export interface IUpdateFavoriteEmojiReq {
  /**
   * @description: 表情ID
   */
  emojiId: number;
  /**
   * @description: 操作类型 "favorite" or "unfavorite"
   */
  type: string;
}

// 更新表情收藏状态响应
export interface IUpdateFavoriteEmojiRes {}

// 获取用户收藏的表情列表请求
export interface IGetEmojisListReq {
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  size: number;
}

// 表情项
export interface IEmojiItem {
  /**
   * @description: 表情ID
   */
  emojiId: number;
  /**
   * @description: 表情文件ID
   */
  fileKey: string;
  /**
   * @description: 表情标题
   */
  title: string;
  /**
   * @description: 表情包ID
   */
  packageId?: number;
}

// 获取用户收藏的表情列表响应
export interface IGetEmojisListRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 表情列表
   */
  list: IEmojiItem[];
}

// 表情分类项
export interface IEmojiCategoryItem {
  /**
   * @description: 分类ID
   */
  categoryId: number;
  /**
   * @description: 分类名称
   */
  name: string;
  /**
   * @description: 分类描述
   */
  description: string;
  /**
   * @description: 表情包数量
   */
  packageCount: number;
}

// 获取表情包列表请求
export interface IGetEmojiPackagesReq {
  /**
   * @description: 分类ID，可选，按分类筛选
   */
  categoryId?: number;
  /**
   * @description: 类型，可选，按类型筛选：official-官方，user-用户自定义
   */
  type?: string;
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  size: number;
}

// 表情包项
export interface IEmojiPackageItem {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 表情包标题
   */
  title: string;
  /**
   * @description: 表情包封面文件
   */
  coverFile: string;
  /**
   * @description: 表情包描述
   */
  description: string;
  /**
   * @description: 类型：official-官方，user-用户自定义
   */
  type: string;
  /**
   * @description: 收藏数量
   */
  collectCount: number;
  /**
   * @description: 表情数量
   */
  emojiCount: number;
  /**
   * @description: 当前用户是否已收藏
   */
  isCollected: boolean;
  /**
   * @description: 当前用户是否是作者
   */
  isAuthor: boolean;
}

// 获取表情包列表响应
export interface IGetEmojiPackagesRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 表情包列表
   */
  list: IEmojiPackageItem[];
}

// 获取表情包详情请求
export interface IGetEmojiPackageDetailReq {
  /**
   * @description: 表情包ID
   */
  packageId: number;
}

// 获取表情包详情响应
export interface IGetEmojiPackageDetailRes {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 表情包标题
   */
  title: string;
  /**
   * @description: 表情包封面文件
   */
  coverFile: string;
  /**
   * @description: 表情包描述
   */
  description: string;
  /**
   * @description: 类型：official-官方，user-用户自定义
   */
  type: string;
  /**
   * @description: 收藏数量
   */
  collectCount: number;
  /**
   * @description: 表情数量
   */
  emojiCount: number;
  /**
   * @description: 当前用户是否已收藏
   */
  isCollected: boolean;
  /**
   * @description: 当前用户是否是作者
   */
  isAuthor: boolean;
  /**
   * @description: 表情列表
   */
  emojis: IEmojiItem[];
}

// 更新表情包收藏状态请求
export interface IUpdateFavoriteEmojiPackageReq {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 操作类型 "favorite" or "unfavorite"
   */
  type: string;
}

// 更新表情包收藏状态响应
export interface IUpdateFavoriteEmojiPackageRes {}

// 创建表情包集合请求
export interface ICreateEmojiPackageReq {
  /**
   * @description: 表情包标题
   */
  title: string;
  /**
   * @description: 表情包封面文件
   */
  coverFile: string;
  /**
   * @description: 表情包描述
   */
  description: string;
}

// 创建表情包集合响应
export interface ICreateEmojiPackageRes {
  /**
   * @description: 表情包ID
   */
  packageId: number;
}

// 添加表情到表情包请求
export interface IAddEmojiToPackageReq {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 表情文件ID
   */
  fileKey: string;
  /**
   * @description: 表情标题
   */
  title: string;
}

// 添加表情到表情包响应
export interface IAddEmojiToPackageRes {
  /**
   * @description: 表情ID
   */
  emojiId: number;
}

// 从表情包中删除表情请求
export interface IDeleteEmojiFromPackageReq {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 表情ID
   */
  emojiId: number;
}

// 从表情包中删除表情响应
export interface IDeleteEmojiFromPackageRes {}

// 表情
export interface IEmoji {
  /**
   * @description: 表情文件ID
   */
  fileKey: string;
  /**
   * @description: 表情标题
   */
  title: string;
}

// 批量添加表情到表情包请求
export interface IBatchAddEmojiToPackageReq {
  /**
   * @description: 表情包ID
   */
  packageId: number;
  /**
   * @description: 表情列表
   */
  emojis: IEmoji[];
}

// 批量添加表情到表情包响应
export interface IBatchAddEmojiToPackageRes {
  /**
   * @description: 表情ID列表
   */
  emojiIds: number[];
}

// 获取用户收藏的表情包列表请求
export interface IGetUserFavoritePackagesReq {
  /**
   * @description: 页码
   */
  page: number;
  /**
   * @description: 每页数量
   */
  size: number;
}

// 获取用户收藏的表情包列表响应
export interface IGetUserFavoritePackagesRes {
  /**
   * @description: 总数
   */
  count: number;
  /**
   * @description: 表情包列表
   */
  list: IEmojiPackageItem[];
} 