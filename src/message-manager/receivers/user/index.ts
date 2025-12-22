/**
 * @description: 用户消息路由器
 */

import Logger from '@/logger/logger';

const logger = new Logger('UserMessageRouter');

/**
 * @description: 用户消息路由器
 */
class UserMessageRouter {
  /**
   * @description: 处理用户消息
   */
  async processUserMessage(messageContent: any): Promise<void> {
    const { data } = messageContent;

    if (!data?.type) {
      logger.warn({
        text: '用户消息缺少type字段',
        data: { messageContent }
      });
      return;
    }

    logger.info({
      text: `处理用户消息: ${data.type}`
    });

    // TODO: 根据消息类型路由到具体的处理器
    switch (data.type) {
      case 'user_profile_update':
        // 处理用户信息更新
        break;
      case 'user_online_status':
        // 处理用户在线状态
        break;
      default:
        logger.warn({
          text: '未知的用户消息类型',
          data: { type: data.type }
        });
    }
  }
}

// 导出单例实例
const userMessageRouter = new UserMessageRouter();
export default userMessageRouter;
