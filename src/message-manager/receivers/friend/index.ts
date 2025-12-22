/**
 * @description: 好友消息路由器
 */

import Logger from '@/logger/logger';
import friendReceiver from './friend-receiver';
import friendVerifyReceiver from './friend-verify-receiver';

const logger = new Logger('FriendMessageRouter');

const logger = new Logger('FriendMessageRouter');

/**
 * @description: 好友消息路由器
 */
class FriendMessageRouter {
  /**
   * @description: 处理好友消息
   */
  async processFriendMessage(messageContent: any): Promise<void> {
    const { data } = messageContent;

    if (!data?.type) {
      logger.warn({
        text: '好友消息缺少type字段',
        data: { messageContent }
      });
      return;
    }

    logger.info({
      text: `处理好友消息: ${data.type}`
    });

    try {
      switch (data.type) {
        // 好友添加
        case 'friend_add':
          await friendReceiver.handleFriendAdd(data.body);
          break;

        // 好友删除
        case 'friend_delete':
          await friendReceiver.handleFriendDelete(data.body);
          break;

        // 好友信息更新
        case 'friend_update':
          await friendReceiver.handleFriendUpdate(data.body);
          break;

        // 好友验证请求
        case 'friend_verify_request':
          await friendVerifyReceiver.handleVerifyRequest(data.body);
          break;

        // 好友验证响应
        case 'friend_verify_response':
          await friendVerifyReceiver.handleVerifyResponse(data.body);
          break;

        default:
          logger.warn({
            text: '未知的好友消息类型',
            data: { type: data.type }
          });
      }
    } catch (error) {
      logger.error({
        text: '处理好友消息失败',
        data: {
          type: data.type,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }
}

// 导出单例实例
const friendMessageRouter = new FriendMessageRouter();
export default friendMessageRouter;
