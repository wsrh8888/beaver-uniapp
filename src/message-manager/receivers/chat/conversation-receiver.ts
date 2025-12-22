/**
 * @description: 会话接收器
 * 处理会话相关的WebSocket消息
 */

import Logger from '@/logger/logger';
import cacheManager from '@/cache';

const logger = new Logger('ConversationReceiver');

/**
 * @description: 会话接收器
 */
class ConversationReceiver {
  /**
   * @description: 处理会话更新
   */
  async handleConversationUpdate(data: any): Promise<void> {
    logger.info({
      text: '接收到会话更新',
      data: { conversationId: data.conversationId }
    });

    try {
      // 更新会话信息
      await cacheManager.updateConversation(data.conversationId, {
        maxSeq: data.maxSeq,
        lastMessage: data.lastMessage,
        version: data.version,
        updatedAt: Math.floor(Date.now() / 1000)
      });

      // 通知前端更新
      this.notifyFrontend('conversation_update', data);

    } catch (error) {
      logger.error({
        text: '处理会话更新失败',
        data: {
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
    uni.$emit('conversation_update', {
      type: eventType,
      data: data,
      timestamp: Date.now()
    });

    // 存储到全局状态
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app && app.globalData) {
        if (!app.globalData.conversationUpdates) {
          app.globalData.conversationUpdates = [];
        }
        app.globalData.conversationUpdates.push({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });

        // 只保留最近的10条更新
        if (app.globalData.conversationUpdates.length > 10) {
          app.globalData.conversationUpdates = app.globalData.conversationUpdates.slice(-10);
        }
      }
    }
  }
}

// 导出单例实例
const conversationReceiver = new ConversationReceiver();
export default conversationReceiver;
