/**
 * @description: 聊天消息路由器
 * 根据消息类型路由到对应的接收器处理
 */

import Logger from '@/logger/logger';
import messageReceiver from './message-receiver';
import conversationReceiver from './conversation-receiver';
import userConversationReceiver from './user-conversation-receiver';

const logger = new Logger('ChatMessageRouter');

/**
 * @description: 聊天消息路由器
 */
class ChatMessageRouter {
  /**
   * @description: 处理聊天消息
   */
  async processChatMessage(messageContent: any): Promise<void> {
    const { data } = messageContent;

    if (!data?.type) {
      logger.warn({
        text: '聊天消息缺少type字段',
        data: { messageContent }
      });
      return;
    }

    logger.info({
      text: `处理聊天消息: ${data.type}`
    });

    try {
      switch (data.type) {
        // 新消息接收
        case 'chat_message_receive':
          await messageReceiver.handleNewMessage(data.body);
          break;

        // 消息撤回
        case 'chat_message_recall':
          await messageReceiver.handleMessageRecall(data.body);
          break;

        // 消息编辑
        case 'chat_message_edit':
          await messageReceiver.handleMessageEdit(data.body);
          break;

        // 会话更新
        case 'chat_conversation_update':
          await conversationReceiver.handleConversationUpdate(data.body);
          break;

        // 用户会话更新
        case 'chat_user_conversation_update':
          await userConversationReceiver.handleUserConversationUpdate(data.body);
          break;

        default:
          logger.warn({
            text: '未知的聊天消息类型',
            data: { type: data.type }
          });
      }
    } catch (error) {
      logger.error({
        text: '处理聊天消息失败',
        data: {
          type: data.type,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }
}

// 导出单例实例
const chatMessageRouter = new ChatMessageRouter();
export default chatMessageRouter;
