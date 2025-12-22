import { MessageStatus } from '@/types/store/message';
import type { IMessage } from '@/types/ajax/chat';
import type { IWsMessage } from '@/types/ws/command';
import { WsType } from '@/types/ws/command';
import { useMessageStore } from '@/pinia/message/message';

/**
 * @description: 聊天消息接收器
 */
export class ChatReceiver {
  /**
   * @description: 获取消息 store
   */
  private get messageStore() {
    return useMessageStore();
  }

  /**
   * @description: 处理聊天消息
   * @param {IWsMessage} wsMessage - WebSocket 消息
   * @param {Function} onMessageReceived - 消息接收回调
   * @param {Map<string, IMessage>} pendingMessages - 待确认消息列表
   */
  handleChatMessage(
    wsMessage: IWsMessage, 
    onMessageReceived: ((message: IMessage) => void) | null,
    pendingMessages: Map<string, IMessage>
  ) {
    const { data } = wsMessage.content;
    
    switch (data.type) {
      case WsType.PRIVATE_MESSAGE_RECEIVE:
      case WsType.GROUP_MESSAGE_RECEIVE:
        this.handleIncomingMessage(data.body, onMessageReceived, pendingMessages);
        break;
      case WsType.PRIVATE_MESSAGE_SYNC:
      case WsType.GROUP_MESSAGE_SYNC:
        this.handleMessageSync(data.body);
        break;
      case WsType.MESSAGE_READ_RECEIPT:
        this.handleReadReceipt(data.body);
        break;
      case WsType.MESSAGE_RECALL:
        this.handleMessageRecall(data.body);
        break;
      default:
        console.warn('未处理的聊天消息类型:', data.type);
    }
  }

  /**
   * @description: 处理接收到的消息
   * @param {any} messageData - 消息数据
   * @param {Function} onMessageReceived - 消息接收回调
   * @param {Map<string, IMessage>} pendingMessages - 待确认消息列表
   */
  private handleIncomingMessage(
    messageData: any, 
    onMessageReceived: ((message: IMessage) => void) | null,
    pendingMessages: Map<string, IMessage>
  ) {
    // 检查是否是我们发送的消息的回显
    if (messageData.messageId && pendingMessages.has(messageData.messageId)) {
      // 是我们发送的消息回显，只更新状态，不重复添加
      const localMessage = pendingMessages.get(messageData.messageId)!;
      pendingMessages.delete(messageData.messageId);
      this.messageStore.updateMessageStatus(localMessage.id, MessageStatus.SENT);
      console.log('✅ 检测到自己发送的消息回显，已去重，messageId:', messageData.messageId);
      return;
    }
    
    // 是其他人发送的消息，正常添加
    const message: IMessage = {
      id: messageData.id || Date.now(),
      messageId: messageData.messageId || '',
      conversationId: messageData.conversationId,
      msg: messageData.msg,
      sender: messageData.sender,
      created_at: messageData.created_at,
      status: messageData.status || 0
    };
    
    this.messageStore.addMessage(message.conversationId, message);
    
    // 触发接收回调
    if (onMessageReceived) {
      onMessageReceived(message);
    }
  }

  /**
   * @description: 处理消息同步
   * @param {any} syncData - 同步数据
   */
  private handleMessageSync(syncData: any) {
    console.log('处理消息同步:', syncData);
  }

  /**
   * @description: 处理已读回执
   * @param {any} receiptData - 回执数据
   */
  private handleReadReceipt(receiptData: any) {
    console.log('处理已读回执:', receiptData);
  }

  /**
   * @description: 处理消息撤回
   * @param {any} recallData - 撤回数据
   */
  private handleMessageRecall(recallData: any) {
    console.log('处理消息撤回:', recallData);
  }
} 