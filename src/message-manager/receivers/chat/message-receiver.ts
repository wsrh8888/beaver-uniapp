/**
 * @description: 消息接收器
 * 处理消息相关的WebSocket消息
 */

import Logger from '@/logger/logger';
import cacheManager from '@/cache';

const logger = new Logger('MessageReceiver');

/**
 * @description: 消息接收器
 */
class MessageReceiver {
  /**
   * @description: 处理新消息
   */
  async handleNewMessage(data: any): Promise<void> {
    logger.info({
      text: '接收到新消息',
      data: { messageId: data.messageId, conversationId: data.conversationId }
    });

    try {
      // 保存消息到缓存
      await cacheManager.saveMessage(data);

      // 通知前端更新
      this.notifyFrontend('new_message', data);

      // 更新会话的最后消息
      await cacheManager.updateConversationLastMessage(data.conversationId, {
        messageId: data.messageId,
        content: data.msgPreview,
        timestamp: data.createdAt
      });

    } catch (error) {
      logger.error({
        text: '处理新消息失败',
        data: {
          messageId: data.messageId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 处理消息撤回
   */
  async handleMessageRecall(data: any): Promise<void> {
    logger.info({
      text: '接收到消息撤回',
      data: { messageId: data.messageId }
    });

    try {
      // 标记消息为已撤回
      await cacheManager.recallMessage(data.messageId);

      // 通知前端更新
      this.notifyFrontend('message_recall', data);

    } catch (error) {
      logger.error({
        text: '处理消息撤回失败',
        data: {
          messageId: data.messageId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 处理消息编辑
   */
  async handleMessageEdit(data: any): Promise<void> {
    logger.info({
      text: '接收到消息编辑',
      data: { messageId: data.messageId }
    });

    try {
      // 更新消息内容
      await cacheManager.editMessage(data.messageId, {
        content: data.newContent,
        preview: data.newPreview,
        editTime: data.editTime
      });

      // 通知前端更新
      this.notifyFrontend('message_edit', data);

    } catch (error) {
      logger.error({
        text: '处理消息编辑失败',
        data: {
          messageId: data.messageId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 通知前端更新
   */
  private notifyFrontend(eventType: string, data: any): void {
    // 通过全局事件通知
    uni.$emit('chat_message_update', {
      type: eventType,
      data: data,
      timestamp: Date.now()
    });

    // 如果有全局app实例，也可以存储到globalData
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app && app.globalData) {
        // 存储最新消息到全局状态
        if (!app.globalData.messageUpdates) {
          app.globalData.messageUpdates = [];
        }
        app.globalData.messageUpdates.push({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });

        // 只保留最近的20条更新
        if (app.globalData.messageUpdates.length > 20) {
          app.globalData.messageUpdates = app.globalData.messageUpdates.slice(-20);
        }
      }
    }
  }
}

// 导出单例实例
const messageReceiver = new MessageReceiver();
export default messageReceiver;
