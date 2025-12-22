/**
 * @description: 缓存管理器 - 移动端本地数据管理
 * 实现本地优先的数据存储和访问策略
 */

import Logger from '@/logger/logger';
import dbManager from '@/database/db';
import { chatConversationService as conversationService } from '@/database/services/chat/conversation';
import { friendService } from '@/database/services/friend/friend';

const logger = new Logger('CacheManager');

/**
 * @description: 缓存配置
 */
interface CacheConfig {
  enableLocalStorage: boolean; // 是否启用本地存储降级
  maxMessageCache: number; // 每个会话最大缓存消息数
  maxConversationCache: number; // 最大缓存会话数
  cacheExpireTime: number; // 缓存过期时间（毫秒）
}

/**
 * @description: 缓存管理器
 */
class CacheManager {
  private config: CacheConfig;
  private isInitialized = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enableLocalStorage: true,
      maxMessageCache: 100, // 每个会话最多缓存100条消息
      maxConversationCache: 200, // 最多缓存200个会话
      cacheExpireTime: 24 * 60 * 60 * 1000, // 24小时
      ...config,
    };
  }

  /**
   * @description: 初始化缓存管理器
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 初始化数据库
      await dbManager.init();

      // 如果不是降级存储模式，创建表结构
      if (!dbManager.getStatus().useFallbackStorage) {
        // 创建表
        const tableSQLs = getAllTableSQL();
        await dbManager.batchExecuteSql(tableSQLs);

        // 创建索引
        const indexSQLs = getAllIndexSQL();
        await dbManager.batchExecuteSql(indexSQLs);

        logger.info({ text: '数据库表结构创建完成' });
      }

      this.isInitialized = true;
      logger.info({ text: '缓存管理器初始化成功' });
    } catch (error) {
      logger.error({
        text: '缓存管理器初始化失败',
        data: { error: error instanceof Error ? error.message : String(error) }
      });

      // 如果数据库不可用，启用降级存储
      if (this.config.enableLocalStorage) {
        logger.info({ text: '启用本地存储降级模式' });
        this.isInitialized = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * @description: 获取用户会话列表
   */
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      if (dbManager.getStatus().useFallbackStorage) {
        return this.getUserConversationsFromStorage(userId);
      }

      // 使用服务层获取数据
      const conversations = await conversationService.getUserConversations(userId);
      return this.formatConversations(conversations);
    } catch (error) {
      logger.error({
        text: '获取用户会话列表失败',
        data: { userId, error: error instanceof Error ? error.message : String(error) }
      });
      return [];
    }
  }

  /**
   * @description: 获取会话消息
   */
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<any[]> {
    try {
      if (dbManager.getStatus().useFallbackStorage) {
        return this.getConversationMessagesFromStorage(conversationId, limit);
      }

      // 使用服务层获取数据
      const messages = await messageService.getConversationMessages(conversationId, limit);
      return this.formatMessages(messages);
    } catch (error) {
      logger.error({
        text: '获取会话消息失败',
        data: { conversationId, error: error instanceof Error ? error.message : String(error) }
      });
      return [];
    }
  }

  /**
   * @description: 保存消息
   */
  async saveMessage(messageData: any): Promise<void> {
    try {
      if (dbManager.getStatus().useFallbackStorage) {
        return this.saveMessageToStorage(messageData);
      }

      // 使用服务层保存消息
      await messageService.saveMessage(messageData);

      // 更新会话的最后消息
      await this.updateConversationLastMessage(messageData.conversationId, {
        messageId: messageData.messageId,
        content: messageData.msgPreview,
        timestamp: messageData.createdAt
      });

      logger.info({ text: '消息保存成功', data: { messageId: messageData.messageId } });
    } catch (error) {
      logger.error({
        text: '保存消息失败',
        data: {
          messageId: messageData.messageId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      throw error;
    }
  }

  /**
   * @description: 更新会话的最后消息
   */
  async updateConversationLastMessage(conversationId: string, messageInfo: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.updateConversationLastMessageInStorage(conversationId, messageInfo);
      }

      // 更新会话的最后消息
      await dbManager.executeSql(
        `UPDATE conversations SET last_message = ?, updated_at = ? WHERE conversation_id = ?`,
        [messageInfo.content, Math.floor(Date.now() / 1000), conversationId]
      );

      logger.info({ text: '会话最后消息更新成功', data: { conversationId } });
    } catch (error) {
      logger.error({
        text: '更新会话最后消息失败',
        data: { conversationId, error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * @description: 获取好友列表
   */
  async getFriends(userId: string): Promise<any[]> {
    try {
      if (dbManager.getStatus().useFallbackStorage) {
        return this.getFriendsFromStorage(userId);
      }

      // 使用服务层获取数据
      const friends = await friendService.getFriends(userId);
      return this.formatFriends(friends);
    } catch (error) {
      logger.error({
        text: '获取好友列表失败',
        data: { userId, error: error instanceof Error ? error.message : String(error) }
      });
      return [];
    }
  }

  /**
   * @description: 添加好友
   */
  async addFriend(friendData: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.addFriendToStorage(friendData);
      }

      await dbManager.executeSql(
        `INSERT OR REPLACE INTO friends
         (user_id, friend_user_id, nick_name, avatar, abstract, notice, source, status, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          friendData.userId,
          friendData.friendUserId,
          friendData.nickName || '',
          friendData.avatar || '',
          friendData.abstract || '',
          friendData.notice || '',
          friendData.source || '',
          friendData.status || 1,
          friendData.version || 0,
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000),
        ]
      );

      logger.info({ text: '好友添加成功', data: { friendUserId: friendData.friendUserId } });
    } catch (error) {
      logger.error({
        text: '添加好友失败',
        data: { friendUserId: friendData.friendUserId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 删除好友
   */
  async removeFriend(userId: string, friendUserId: string): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.removeFriendFromStorage(userId, friendUserId);
      }

      await dbManager.executeSql(
        'UPDATE friends SET status = 2, updated_at = ? WHERE user_id = ? AND friend_user_id = ?',
        [Math.floor(Date.now() / 1000), userId, friendUserId]
      );

      logger.info({ text: '好友删除成功', data: { friendUserId } });
    } catch (error) {
      logger.error({
        text: '删除好友失败',
        data: { friendUserId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 更新好友信息
   */
  async updateFriend(userId: string, friendUserId: string, updates: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.updateFriendInStorage(userId, friendUserId, updates);
      }

      const setParts: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          setParts.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (setParts.length === 0) return;

      setParts.push('updated_at = ?');
      values.push(Math.floor(Date.now() / 1000));
      values.push(userId, friendUserId);

      const sql = `UPDATE friends SET ${setParts.join(', ')} WHERE user_id = ? AND friend_user_id = ?`;
      await dbManager.executeSql(sql, values);

      logger.info({ text: '好友信息更新成功', data: { friendUserId } });
    } catch (error) {
      logger.error({
        text: '更新好友信息失败',
        data: { friendUserId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 撤回消息
   */
  async recallMessage(messageId: string): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.recallMessageInStorage(messageId);
      }

      await dbManager.executeSql(
        'UPDATE messages SET status = 2, updated_at = ? WHERE message_id = ?',
        [Math.floor(Date.now() / 1000), messageId]
      );

      logger.info({ text: '消息撤回成功', data: { messageId } });
    } catch (error) {
      logger.error({
        text: '撤回消息失败',
        data: { messageId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 编辑消息
   */
  async editMessage(messageId: string, editData: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.editMessageInStorage(messageId, editData);
      }

      await dbManager.executeSql(
        'UPDATE messages SET msg_preview = ?, status = 3, updated_at = ? WHERE message_id = ?',
        [editData.preview, Math.floor(Date.now() / 1000), messageId]
      );

      logger.info({ text: '消息编辑成功', data: { messageId } });
    } catch (error) {
      logger.error({
        text: '编辑消息失败',
        data: { messageId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 更新会话设置
   */
  async updateConversation(conversationId: string, updates: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.updateConversationInStorage(conversationId, updates);
      }

      const setParts: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          setParts.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (setParts.length === 0) return;

      values.push(conversationId);
      const sql = `UPDATE conversations SET ${setParts.join(', ')} WHERE conversation_id = ?`;
      await dbManager.executeSql(sql, values);

      logger.info({ text: '会话更新成功', data: { conversationId } });
    } catch (error) {
      logger.error({
        text: '更新会话失败',
        data: { conversationId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  /**
   * @description: 更新用户会话设置
   */
  async updateUserConversation(userId: string, conversationId: string, updates: any): Promise<void> {
    try {
      await this.ensureInitialized();

      if (dbManager.getStatus().useFallbackStorage) {
        return this.updateUserConversationInStorage(userId, conversationId, updates);
      }

      const setParts: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          setParts.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (setParts.length === 0) return;

      values.push(userId, conversationId);
      const sql = `UPDATE user_conversations SET ${setParts.join(', ')} WHERE user_id = ? AND conversation_id = ?`;
      await dbManager.executeSql(sql, values);

      logger.info({ text: '用户会话设置更新成功', data: { userId, conversationId } });
    } catch (error) {
      logger.error({
        text: '更新用户会话设置失败',
        data: { userId, conversationId, error: error instanceof Error ? error.message : String(error) }
      });
      throw error;
    }
  }

  // ========== 私有方法 ==========

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  private formatConversations(rawData: any[]): any[] {
    return rawData.map(item => ({
      conversationId: item.conversation_id,
      nickName: item.nick_name || '未知用户',
      avatar: item.avatar || '',
      msgPreview: item.last_message || '',
      updatedAt: new Date((item.updated_at || 0) * 1000).toISOString(),
      isTop: item.is_pinned || false,
      chatType: item.type === 1 ? 1 : 2,
      notice: item.notice || ''
    }));
  }

  private formatMessages(rawMessages: any[]): any[] {
    return rawMessages.map(msg => ({
      id: msg.id,
      messageId: msg.message_id,
      conversationId: msg.conversation_id,
      msg: msg.msg ? JSON.parse(msg.msg) : {},
      sender: {
        userId: msg.send_user_id || '',
        avatar: msg.avatar || '',
        nickName: msg.nick_name || '未知用户'
      },
      createdAt: new Date((msg.created_at || 0) * 1000).toISOString(),
      msgPreview: msg.msg_preview || '',
      status: msg.status || 1,
      seq: msg.seq || 0
    }));
  }

  private formatFriends(rawFriends: any[]): any[] {
    return rawFriends.map(friend => ({
      userId: friend.friend_user_id,
      nickName: friend.nick_name || '',
      avatar: friend.avatar || '',
      abstract: friend.abstract || '',
      notice: friend.notice || '',
      source: friend.source || '',
      status: friend.status || 1
    }));
  }

  // ========== 降级存储方法 ==========

  private getUserConversationsFromStorage(userId: string): any[] {
    try {
      const key = `conversations_${userId}`;
      const data = uni.getStorageSync(key);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private getConversationMessagesFromStorage(conversationId: string, limit: number): any[] {
    try {
      const key = `messages_${conversationId}`;
      const data = uni.getStorageSync(key);
      if (Array.isArray(data)) {
        return data.slice(-limit); // 返回最新的limit条
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveMessageToStorage(messageData: any): void {
    try {
      const key = `messages_${messageData.conversationId}`;
      let messages = uni.getStorageSync(key) || [];
      if (!Array.isArray(messages)) messages = [];

      messages.push(messageData);
      if (messages.length > this.config.maxMessageCache) {
        messages = messages.slice(-this.config.maxMessageCache);
      }

      uni.setStorageSync(key, messages);
    } catch (error) {
      logger.error({ text: '降级存储消息失败', data: { error } });
    }
  }

  private getFriendsFromStorage(userId: string): any[] {
    try {
      const key = `friends_${userId}`;
      const data = uni.getStorageSync(key);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  private addFriendToStorage(friendData: any): void {
    try {
      const key = `friends_${friendData.userId}`;
      let friends = uni.getStorageSync(key) || [];
      if (!Array.isArray(friends)) friends = [];

      // 检查是否已存在
      const existingIndex = friends.findIndex((f: any) => f.friendUserId === friendData.friendUserId);
      if (existingIndex >= 0) {
        friends[existingIndex] = { ...friends[existingIndex], ...friendData };
      } else {
        friends.push(friendData);
      }

      uni.setStorageSync(key, friends);
    } catch (error) {
      logger.error({ text: '降级存储好友失败', data: { error } });
    }
  }

  private removeFriendFromStorage(userId: string, friendUserId: string): void {
    try {
      const key = `friends_${userId}`;
      let friends = uni.getStorageSync(key) || [];
      if (!Array.isArray(friends)) friends = [];

      friends = friends.filter((f: any) => f.friendUserId !== friendUserId);
      uni.setStorageSync(key, friends);
    } catch (error) {
      logger.error({ text: '降级删除好友失败', data: { error } });
    }
  }

  private updateFriendInStorage(userId: string, friendUserId: string, updates: any): void {
    try {
      const key = `friends_${userId}`;
      let friends = uni.getStorageSync(key) || [];
      if (!Array.isArray(friends)) friends = [];

      const friendIndex = friends.findIndex((f: any) => f.friendUserId === friendUserId);
      if (friendIndex >= 0) {
        friends[friendIndex] = { ...friends[friendIndex], ...updates };
        uni.setStorageSync(key, friends);
      }
    } catch (error) {
      logger.error({ text: '降级更新好友失败', data: { error } });
    }
  }

  private updateConversationLastMessageInStorage(conversationId: string, messageInfo: any): void {
    try {
      const key = `conversations_last_message_${conversationId}`;
      uni.setStorageSync(key, messageInfo);
    } catch (error) {
      logger.error({ text: '降级更新会话最后消息失败', data: { error } });
    }
  }

  private recallMessageInStorage(messageId: string): void {
    // 降级存储模式下，撤回消息比较复杂，这里简化处理
    logger.info({ text: '降级模式下消息撤回', data: { messageId } });
  }

  private editMessageInStorage(messageId: string, editData: any): void {
    // 降级存储模式下，编辑消息比较复杂，这里简化处理
    logger.info({ text: '降级模式下消息编辑', data: { messageId } });
  }

  private updateConversationInStorage(conversationId: string, updates: any): void {
    try {
      const key = `conversation_${conversationId}`;
      const existing = uni.getStorageSync(key) || {};
      uni.setStorageSync(key, { ...existing, ...updates });
    } catch (error) {
      logger.error({ text: '降级更新会话失败', data: { error } });
    }
  }

  private updateUserConversationInStorage(userId: string, conversationId: string, updates: any): void {
    try {
      const key = `user_conversation_${userId}_${conversationId}`;
      const existing = uni.getStorageSync(key) || {};
      uni.setStorageSync(key, { ...existing, ...updates });
    } catch (error) {
      logger.error({ text: '降级更新用户会话失败', data: { error } });
    }
  }
}

// 导出单例实例
const cacheManager = new CacheManager();
export default cacheManager;