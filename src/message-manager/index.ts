/**
 * @description: 消息管理器 - 移动端版本
 * 负责消息的接收、路由和状态管理
 */

import Logger from '@/logger/logger';
import WsManager from '@/ws-manager/ws';
import type { IWsMessage } from '@/types/ws/command';
import chatMessageRouter from './receivers/chat/index';
import friendMessageRouter from './receivers/friend/index';
import groupMessageRouter from './receivers/group/index';
import userMessageRouter from './receivers/user/index';
import notificationMessageRouter from './receivers/notification/index';

const logger = new Logger('MessageManager');

/**
 * @description: 消息管理器
 */
class MessageManager {
  private isDataSyncing = false;
  private messageQueue: IWsMessage[] = [];

  constructor() {}

  /**
   * @description: 初始化消息管理器
   */
  init(): void {
    logger.info({ text: '初始化消息管理器' });

    // 设置WebSocket事件回调
    WsManager.setEventCallbacks({
      onMessage: this.handleWsMessage.bind(this),
      onConnect: this.onWsConnect.bind(this),
      onDisconnect: this.onWsDisconnect.bind(this),
      onError: this.onWsError.bind(this),
    });

    logger.info({ text: '消息管理器初始化完成' });
  }

  /**
   * @description: WebSocket连接成功回调
   */
  private async onWsConnect(): Promise<void> {
    logger.info({ text: 'WebSocket连接成功，开始数据同步' });

    try {
      this.isDataSyncing = true;

      // TODO: 开始数据同步
      // await dataSyncManager.autoSync();

      this.isDataSyncing = false;

      // 处理队列中的消息
      this.processMessageQueue();

      logger.info({ text: '消息管理器已准备就绪' });
    } catch (error) {
      this.isDataSyncing = false;
      logger.error({
        text: '数据同步失败',
        data: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * @description: WebSocket断开连接回调
   */
  private onWsDisconnect(): void {
    logger.info({ text: 'WebSocket断开连接' });

    // 通知前端连接状态变化
    uni.$emit('ws_status_change', {
      status: 'disconnected',
      timestamp: Date.now()
    });
  }

  /**
   * @description: WebSocket错误回调
   */
  private onWsError(error: any): void {
    logger.error({
      text: 'WebSocket错误',
      data: { error }
    });

    // 通知前端连接状态变化
    uni.$emit('ws_status_change', {
      status: 'error',
      timestamp: Date.now(),
      error: error
    });
  }

  /**
   * @description: 处理WebSocket消息
   */
  private handleWsMessage(message: IWsMessage): void {
    // 如果正在数据同步，将消息加入队列
    if (this.isDataSyncing) {
      this.messageQueue.push(message);
      return;
    }

    // 正常处理消息
    this.processMessage(message, 'ws');
  }

  /**
   * @description: 处理消息队列
   */
  private processMessageQueue(): void {
    logger.info({
      text: `开始处理队列中的${this.messageQueue.length}条消息`
    });

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.processMessage(message, 'queue');
        } catch (error) {
          logger.error({
            text: '处理队列消息失败',
            data: {
              command: message.command,
              error: error instanceof Error ? error.message : String(error)
            }
          });
        }
      }
    }

    logger.info({ text: '队列消息处理完成' });
  }

  /**
   * @description: 处理单个消息
   */
  private processMessage(message: IWsMessage, source: 'ws' | 'queue'): void {
    logger.info({
      text: `处理消息: ${message.command}`,
      data: { source, messageId: message.content.messageId }
    });

    try {
      switch (message.command) {
        case 'CHAT_MESSAGE':
          chatMessageRouter.processChatMessage(message.content);
          break;

        case 'FRIEND_OPERATION':
          friendMessageRouter.processFriendMessage(message.content);
          break;

        case 'GROUP_OPERATION':
          groupMessageRouter.processGroupMessage(message.content);
          break;

        case 'USER_PROFILE':
          userMessageRouter.processUserMessage(message.content);
          break;

        case 'SYSTEM_NOTIFICATION':
          notificationMessageRouter.processNotificationMessage(message.content);
          break;

        case 'HEARTBEAT':
          // 心跳消息，不需要处理
          break;

        default:
          logger.warn({
            text: '未处理的消息类型',
            data: { command: message.command }
          });
      }
    } catch (error) {
      logger.error({
        text: '消息处理失败',
        data: {
          command: message.command,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 发送消息
   */
  sendMessage(message: IWsMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        WsManager.sendMessage(message);
        resolve();
      } catch (error) {
        logger.error({
          text: '发送消息失败',
          data: {
            command: message.command,
            error: error instanceof Error ? error.message : String(error)
          }
        });
        reject(error);
      }
    });
  }

  /**
   * @description: 获取连接状态
   */
  getConnectionStatus() {
    return WsManager.getStatus();
  }

  /**
   * @description: 获取消息管理器状态
   */
  getStatus() {
    return {
      isDataSyncing: this.isDataSyncing,
      queueLength: this.messageQueue.length,
      wsStatus: WsManager.getStatus(),
    };
  }
}

// 导出单例实例
const messageManager = new MessageManager();
export default messageManager;