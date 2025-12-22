/**
 * @description: 移动端数据库类型定义
 * 适配uni-app SQLite API
 */

// ========== 基础类型 ==========

/**
 * @description: 数据库操作结果
 */
export interface DatabaseResult {
  rowsAffected?: number;
  insertId?: number;
  rows?: any[];
}

/**
 * @description: 数据库查询结果
 */
export interface QueryResult {
  rows: {
    length: number;
    item(index: number): any;
  };
}

/**
 * @description: 数据库事务
 */
export interface DatabaseTransaction {
  executeSql(sql: string, params?: any[], successCallback?: (tx: DatabaseTransaction, result: QueryResult) => void, errorCallback?: (tx: DatabaseTransaction, error: any) => void): void;
}

/**
 * @description: SQLite数据库实例
 */
export interface SQLiteDatabase {
  transaction(callback: (tx: DatabaseTransaction) => void): void;
  readTransaction?(callback: (tx: DatabaseTransaction) => void): void;
  close?(): void;
}

// ========== 表结构定义 ==========

/**
 * @description: 会话表
 */
export interface ConversationTable {
  id: number;
  conversation_id: string;
  type: number; // 1:私聊 2:群聊
  max_seq: number;
  last_message: string;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 用户会话关系表
 */
export interface UserConversationTable {
  id: number;
  user_id: string;
  conversation_id: string;
  is_hidden: boolean;
  is_pinned: boolean;
  is_muted: boolean;
  user_read_seq: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 消息表
 */
export interface MessageTable {
  id: number;
  message_id: string;
  conversation_id: string;
  conversation_type: number;
  seq: number;
  send_user_id: string;
  msg_type: number;
  msg_preview: string;
  msg: string; // JSON字符串
  status: number; // 1:正常 2:撤回 3:编辑 4:删除
  created_at: number;
  updated_at: number;
}

/**
 * @description: 用户表
 */
export interface UserTable {
  id: number;
  user_id: string;
  nick_name: string;
  avatar: string;
  abstract: string;
  email: string;
  gender: number;
  phone: string;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 好友表
 */
export interface FriendTable {
  id: number;
  user_id: string;
  friend_user_id: string;
  nick_name: string;
  avatar: string;
  abstract: string;
  notice: string;
  source: string;
  status: number; // 1:正常 2:已删除 3:已屏蔽
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 好友验证表
 */
export interface FriendVerifyTable {
  id: number;
  verify_id: string;
  send_user_id: string;
  rev_user_id: string;
  send_status: number;
  rev_status: number;
  message: string;
  source: string;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 聊天同步状态表
 */
export interface ChatSyncStatusTable {
  id: number;
  conversation_id: string;
  module: string;
  seq: number;
  version: number;
  updated_at: number;
}

/**
 * @description: 用户同步状态表
 */
export interface UserSyncStatusTable {
  id: number;
  user_id: string;
  user_version: number;
  last_sync_time: number;
  updated_at: number;
}

/**
 * @description: 数据同步状态表
 */
export interface DatasyncTable {
  id: number;
  module: string;
  version: number;
  updated_at: number;
}

/**
 * @description: 表情表
 */
export interface EmojiTable {
  id: number;
  emoji_id: string;
  file_key: string;
  title: string;
  emoji_info: string;
  status: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 表情包表
 */
export interface EmojiPackageTable {
  id: number;
  package_id: string;
  title: string;
  cover_file: string;
  user_id: string;
  description: string;
  type: string;
  status: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 用户收藏表情表
 */
export interface EmojiCollectTable {
  id: number;
  emoji_collect_id: string;
  user_id: string;
  emoji_id: string;
  package_id: string;
  is_deleted: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 表情包与表情关联表
 */
export interface EmojiPackageEmojiTable {
  id: number;
  relation_id: string;
  package_id: string;
  emoji_id: string;
  sort_order: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 用户收藏表情包表
 */
export interface EmojiPackageCollectTable {
  id: number;
  package_collect_id: string;
  user_id: string;
  package_id: string;
  is_deleted: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 群组表
 */
export interface GroupTable {
  id: number;
  group_id: string;
  type: number;
  title: string;
  avatar: string;
  creator_id: string;
  notice: string;
  join_type: number;
  status: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 群成员表
 */
export interface GroupMemberTable {
  id: number;
  group_id: string;
  user_id: string;
  role: number;
  status: number;
  join_time: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 入群申请表
 */
export interface GroupJoinRequestTable {
  id: number;
  group_id: string;
  applicant_user_id: string;
  message: string;
  status: number;
  handled_by: string;
  handled_at: number;
  version: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 群组同步状态表
 */
export interface GroupSyncStatusTable {
  id: number;
  group_id: string;
  module: string;
  version: number;
  updated_at: number;
}

/**
 * @description: 媒体表
 */
export interface MediaTable {
  id: number;
  file_key: string;
  path: string;
  type: string;
  size: number;
  created_at: number;
  updated_at: number;
  is_deleted: number;
}

/**
 * @description: 通知事件主表
 */
export interface NotificationEventTable {
  id: number;
  event_id: string;
  event_type: string;
  category: string;
  version: number;
  from_user_id: string;
  target_id: string;
  target_type: string;
  payload: string;
  priority: number;
  status: number;
  dedup_hash: string;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 通知收件箱表
 */
export interface NotificationInboxTable {
  id: number;
  user_id: string;
  event_id: string;
  event_type: string;
  category: string;
  version: number;
  is_read: number;
  read_at: number;
  status: number;
  is_deleted: number;
  silent: number;
  created_at: number;
  updated_at: number;
}

/**
 * @description: 通知已读游标表
 */
export interface NotificationReadCursorTable {
  id: number;
  user_id: string;
  category: string;
  version: number;
  last_read_at: number;
  created_at: number;
  updated_at: number;
}

// ========== 服务接口定义 ==========

/**
 * @description: 会话服务接口
 */
export interface ConversationService {
  getUserConversations(userId: string): Promise<any[]>;
  saveConversation(conversation: any): Promise<void>;
  updateConversation(conversationId: string, updates: Partial<ConversationTable>): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
}

/**
 * @description: 消息服务接口
 */
export interface MessageService {
  getConversationMessages(conversationId: string, limit?: number): Promise<any[]>;
  saveMessage(message: any): Promise<void>;
  updateMessage(messageId: string, updates: Partial<MessageTable>): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  getLatestMessage(conversationId: string): Promise<any>;
}

/**
 * @description: 好友服务接口
 */
export interface FriendService {
  getFriends(userId: string): Promise<any[]>;
  saveFriend(friend: any): Promise<void>;
  updateFriend(userId: string, friendUserId: string, updates: Partial<FriendTable>): Promise<void>;
  deleteFriend(userId: string, friendUserId: string): Promise<void>;
}

/**
 * @description: 用户服务接口
 */
export interface UserService {
  getUser(userId: string): Promise<any>;
  saveUser(user: any): Promise<void>;
  updateUser(userId: string, updates: Partial<UserTable>): Promise<void>;
}

// ========== 数据库配置 ==========

/**
 * @description: 数据库配置
 */
export interface DatabaseConfig {
  name: string;
  version: string;
  description: string;
  size: number;
}

/**
 * @description: 数据库状态
 */
export interface DatabaseStatus {
  isInitialized: boolean;
  useFallbackStorage: boolean;
  config: DatabaseConfig;
  platform: string;
}

// ========== 枚举定义 ==========

/**
 * @description: 消息状态枚举
 */
export enum MessageStatus {
  NORMAL = 1,     // 正常
  RECALLED = 2,   // 撤回
  EDITED = 3,     // 编辑
  DELETED = 4,    // 删除
}

/**
 * @description: 消息类型枚举
 */
export enum MessageType {
  TEXT = 1,       // 文本消息
  IMAGE = 2,      // 图片消息
  VOICE = 3,      // 语音消息
  VIDEO = 4,      // 视频消息
  FILE = 5,       // 文件消息
  SYSTEM = 6,     // 系统消息
}

/**
 * @description: 会话类型枚举
 */
export enum ConversationType {
  PRIVATE = 1,    // 私聊
  GROUP = 2,      // 群聊
}

/**
 * @description: 好友状态枚举
 */
export enum FriendStatus {
  NORMAL = 1,     // 正常
  DELETED = 2,    // 已删除
  BLOCKED = 3,    // 已屏蔽
}

/**
 * @description: 好友验证发送状态枚举
 */
export enum FriendVerifySendStatus {
  PENDING = 0,    // 待发送
  SENT = 1,       // 已发送
  FAILED = 2,     // 发送失败
}

/**
 * @description: 好友验证接收状态枚举
 */
export enum FriendVerifyReceiveStatus {
  PENDING = 0,    // 待处理
  ACCEPTED = 1,   // 已同意
  REJECTED = 2,   // 已拒绝
}

/**
 * @description: 用户同步状态枚举
 */
export enum UserSyncStatus {
  OFFLINE = 0,    // 离线
  ONLINE = 1,     // 在线
  BUSY = 2,       // 忙碌
  AWAY = 3,       // 离开
}

/**
 * @description: 同步模块枚举
 */
export enum SyncModule {
  USERS = 'users',
  FRIENDS = 'friends',
  GROUPS = 'groups',
  CHAT_CONVERSATIONS = 'chat_conversations',
  CHAT_MESSAGES = 'chat_messages',
  EMOJIS = 'emojis',
  EMOJI_PACKAGES = 'emoji_packages',
}

/**
 * @description: 表情状态枚举
 */
export enum EmojiStatus {
  NORMAL = 1,      // 正常
  PENDING = 2,     // 审核中
  DISABLED = 3,    // 违规禁用
}

/**
 * @description: 表情包类型枚举
 */
export enum EmojiPackageType {
  OFFICIAL = 'official',  // 官方
  USER = 'user',          // 用户自定义
}

/**
 * @description: 表情包状态枚举
 */
export enum EmojiPackageStatus {
  NORMAL = 1,      // 正常
  PENDING = 2,     // 审核中
  DISABLED = 3,    // 违规禁用
}

/**
 * @description: 群组状态枚举
 */
export enum GroupStatus {
  NORMAL = 1,    // 正常
  DISSOLVED = 2, // 已解散
}

/**
 * @description: 加入方式枚举
 */
export enum JoinType {
  FREE = 0,      // 自由加入
  APPROVAL = 1,  // 需要审批
  INVITE = 2,    // 仅邀请
}

/**
 * @description: 群成员角色枚举
 */
export enum GroupMemberRole {
  OWNER = 1,     // 群主
  ADMIN = 2,     // 管理员
  MEMBER = 3,    // 普通成员
}

/**
 * @description: 群成员状态枚举
 */
export enum GroupMemberStatus {
  NORMAL = 1,    // 正常
  LEFT = 2,      // 已退出
  KICKED = 3,    // 被踢出
}

/**
 * @description: 入群申请状态枚举
 */
export enum GroupJoinRequestStatus {
  PENDING = 0,   // 待审核
  APPROVED = 1,  // 已同意
  REJECTED = 2,  // 已拒绝
}

/**
 * @description: 群组同步模块枚举
 */
export enum GroupSyncModule {
  INFO = 'info',       // 群组信息
  MEMBERS = 'members', // 群成员
  REQUESTS = 'requests', // 入群申请
}

/**
 * @description: 媒体类型枚举
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  VOICE = 'voice',
  FILE = 'file',
  AVATAR = 'avatar',
  EMOTICON = 'emoticon',
  TEMP = 'temp',
  THUMBNAIL = 'thumbnail',
}

/**
 * @description: 通知事件状态枚举
 */
export enum NotificationEventStatus {
  VALID = 1,     // 有效
  RECALLED = 2,  // 撤回
  INVALID = 3,   // 失效
}

/**
 * @description: 通知收件箱状态枚举
 */
export enum NotificationInboxStatus {
  NORMAL = 1,    // 正常
  HIDDEN = 2,    // 隐藏/撤回
  EXPIRED = 3,   // 过期
}

/**
 * @description: 用户性别枚举
 */
export enum UserGender {
  UNKNOWN = 0,
  MALE = 1,
  FEMALE = 2,
}

// ========== 工具类型 ==========

/**
 * @description: 表创建SQL
 */
export interface TableSQL {
  sql: string;
  params: any[];
}

/**
 * @description: 索引创建SQL
 */
export interface IndexSQL {
  sql: string;
  params: any[];
}
