/**
 * @description: 用户会话接收器
 * 处理用户会话相关的WebSocket消息
 */

import Logger from '@/logger/logger';
import cacheManager from '@/cache';

const logger = new Logger('UserConversationReceiver');

/**
 * @description: 用户会话接收器
 */
class UserConversationReceiver {
  /**
   * @description: 处理用户会话更新
   */
  async handleUserConversationUpdate(data: any): Promise<void> {
    logger.info({
      text: '接收到用户会话更新',
      data: {
        userId: data.userId,
        conversationId: data.conversationId
      }
    });

    try {
      // 更新用户会话设置
      await cacheManager.updateUserConversation(data.userId, data.conversationId, {
        isHidden: data.isHidden,
        isPinned: data.isPinned,
        isMuted: data.isMuted,
        userReadSeq: data.userReadSeq,
        version: data.version,
        updatedAt: Math.floor(Date.now() / 1000)
      });

      // 通知前端更新
      this.notifyFrontend('user_conversation_update', data);

    } catch (error) {
      logger.error({
        text: '处理用户会话更新失败',
        data: {
          userId: data.userId,
          conversationId: data.conversationId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 通知前端更新
   */
  private notifyFrontend(eventType: string, data: any): void {
    uni.$emit('user_conversation_update', {
      type: eventType,
      data: data,
      timestamp: Date.now()
    });

    // 存储到全局状态
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app && app.globalData) {
        if (!app.globalData.userConversationUpdates) {
          app.globalData.userConversationUpdates = [];
        }
        app.globalData.userConversationUpdates.push({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });

        // 只保留最近的10条更新
        if (app.globalData.userConversationUpdates.length > 10) {
          app.globalData.userConversationUpdates = app.globalData.userConversationUpdates.slice(-10);
        }
      }
    }
  }
}

// 导出单例实例
const userConversationReceiver = new UserConversationReceiver();
export default userConversationReceiver;
