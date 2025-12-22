import { MessageType, MessageStatus } from '@/types/store/message';
import type { IMessage } from '@/types/ajax/chat';
import type { IWsMessage } from '@/types/ws/command';
import { WsCommand, WsType } from '@/types/ws/command';
import { useMessageStore } from '@/pinia/message/message';
import { useUserStore } from '@/pinia/user/user';
import wsManager from '@/ws-manager/ws';

/**
 * @description: 聊天消息发送器
 */
export class ChatSender {
  private messageIdCounter = 0;

  /**
   * @description: 获取消息 store
   */
  private get messageStore() {
    return useMessageStore();
  }

  /**
   * @description: 获取用户 store
   */
  private get userStore() {
    return useUserStore();
  }

  /**
   * @description: 发送消息
   * @param {string} conversationId - 会话ID
   * @param {any} content - 消息内容
   * @param {MessageType} type - 消息类型
   * @param {Map<string, IMessage>} pendingMessages - 待确认消息列表
   * @return {Promise<string>} 消息ID
   */
  async sendMessage(
    conversationId: string, 
    content: any, 
    type: MessageType,
    pendingMessages: Map<string, IMessage>
  ): Promise<string> {
    const messageId = this.generateMessageId();
    
    // 构建消息对象
    const message: IMessage = {
      id: 0, // 临时ID，服务器会分配真实ID
      messageId: messageId,
      conversationId: conversationId,
      msg: this.buildMessageContent(content, type),
      sender: {
        userId: this.userStore.getUserId,
        fileKey: this.userStore.userInfo.fileKey,
        nickName: this.userStore.userInfo.nickName
      },
      created_at: new Date().toISOString(),
      status: 0 // 使用数字状态
    };

    // 添加到本地消息列表
    this.addLocalMessage(message, messageId, MessageStatus.SENDING, pendingMessages);
    
    // 通过 WebSocket 发送消息
    this.sendToWebSocket(message, messageId);
    
    return messageId;
  }

  /**
   * @description: 重发消息
   * @param {string} messageId - 消息ID
   * @param {Map<string, IMessage>} pendingMessages - 待确认消息列表
   */
  async resendMessage(messageId: string, pendingMessages: Map<string, IMessage>): Promise<void> {
    const message = pendingMessages.get(messageId);
    if (!message) {
      throw new Error('Message not found in pending list');
    }

    // 重新发送
    this.sendToWebSocket(message, messageId);
  }

  /**
   * @description: 构建消息内容
   * @param {any} content - 消息内容
   * @param {MessageType} type - 消息类型
   * @return {any} 消息内容对象
   */
  private buildMessageContent(content: any, type: MessageType): any {
    switch (type) {
      case MessageType.TEXT:
        return {
          type: MessageType.TEXT,
          textMsg: { content }
        };
      case MessageType.IMAGE:
        return {
          type: MessageType.IMAGE,
          imageMsg: content
        };
      case MessageType.VOICE:
        return {
          type: MessageType.VOICE,
          voiceMsg: content
        };
      case MessageType.VIDEO:
        return {
          type: MessageType.VIDEO,
          videoMsg: content
        };
      case MessageType.FILE:
        return {
          type: MessageType.FILE,
          fileMsg: content
        };
      case MessageType.EMOJI:
        return {
          type: MessageType.EMOJI,
          emojiMsg: { fileKey: content.fileKey, emojiId: content.emojiId, packageId: content.packageId }
        };
      default:
        return {
          type: MessageType.TEXT,
          textMsg: { content: String(content) }
        };
    }
  }

  /**
   * @description: 添加本地消息
   * @param {IMessage} message - 消息对象
   * @param {string} messageId - 消息ID
   * @param {MessageStatus} status - 消息状态
   * @param {Map<string, IMessage>} pendingMessages - 待确认消息列表
   */
  private addLocalMessage(
    message: IMessage, 
    messageId: string, 
    status: MessageStatus,
    pendingMessages: Map<string, IMessage>
  ) {
    // 添加到消息store
    this.messageStore.addMessage(message.conversationId, message);
    
    // 添加到待确认列表
    pendingMessages.set(messageId, message);
    
    // 更新消息状态
    this.messageStore.updateMessageStatus(message.id, status);
  }

  /**
   * @description: 通过 WebSocket 发送消息
   * @param {IMessage} message - 消息对象
   * @param {string} messageId - 消息ID
   */
  private sendToWebSocket(message: IMessage, messageId: string) {
    try {
      // 构建 WebSocket 消息格式
      const wsMessage: IWsMessage = {
        command: WsCommand.CHAT_MESSAGE,
        content: {
          timestamp: Date.now(),
          messageId: messageId,
          data: {
            type: this.getMessageType(message.conversationId),
            conversationId: message.conversationId,
            body: {
              conversationId: message.conversationId,
              messageId: messageId,
              msg: message.msg
            }
          }
        }
      };

      // 通过 WebSocket 发送
      wsManager.sendMessage(wsMessage);
      
      console.log('消息已发送到 WebSocket:', {
        messageId,
        conversationId: message.conversationId,
        content: message.msg.textMsg?.content
      });
    } catch (error) {
      // 发送失败
      this.messageStore.updateMessageStatus(message.id, MessageStatus.FAILED);
      console.error('WebSocket 发送消息异常:', error);
    }
  }

  /**
   * @description: 获取消息类型
   * @param {string} conversationId - 会话ID
   * @return {WsType} 消息类型
   */
  private getMessageType(conversationId: string): WsType {
    return conversationId.includes('_') ? WsType.PRIVATE_MESSAGE_SEND : WsType.GROUP_MESSAGE_SEND;
  }

  /**
   * @description: 生成消息ID
   * @return {string} 消息ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${++this.messageIdCounter}`;
  }
} 