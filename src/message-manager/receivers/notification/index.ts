/**
 * @description: 通知消息路由器
 */

import Logger from '@/logger/logger';

const logger = new Logger('NotificationMessageRouter');

/**
 * @description: 通知消息路由器
 */
class NotificationMessageRouter {
  /**
   * @description: 处理通知消息
   */
  async processNotificationMessage(messageContent: any): Promise<void> {
    const { data } = messageContent;

    if (!data?.type) {
      logger.warn({
        text: '通知消息缺少type字段',
        data: { messageContent }
      });
      return;
    }

    logger.info({
      text: `处理通知消息: ${data.type}`
    });

    // TODO: 根据消息类型路由到具体的处理器
    switch (data.type) {
      case 'system_notification':
        // 处理系统通知
        break;
      case 'friend_request':
        // 处理好友请求通知
        break;
      case 'group_invitation':
        // 处理群组邀请通知
        break;
      default:
        logger.warn({
          text: '未知的通知消息类型',
          data: { type: data.type }
        });
    }
  }
}

// 导出单例实例
const notificationMessageRouter = new NotificationMessageRouter();
export default notificationMessageRouter;
