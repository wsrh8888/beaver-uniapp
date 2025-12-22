/**
 * @description: 好友接收器
 * 处理好友相关的WebSocket消息
 */

import Logger from '@/logger/logger';
import cacheManager from '@/cache';

const logger = new Logger('FriendReceiver');

/**
 * @description: 好友接收器
 */
class FriendReceiver {
  /**
   * @description: 处理好友添加
   */
  async handleFriendAdd(data: any): Promise<void> {
    logger.info({
      text: '接收到好友添加',
      data: {
        userId: data.userId,
        friendUserId: data.friendUserId
      }
    });

    try {
      // 添加好友到缓存
      await cacheManager.addFriend({
        userId: data.userId,
        friendUserId: data.friendUserId,
        nickName: data.nickName,
        avatar: data.avatar,
        notice: data.notice,
        source: data.source,
        status: 1,
        version: data.version
      });

      // 通知前端更新
      this.notifyFrontend('friend_add', data);

    } catch (error) {
      logger.error({
        text: '处理好友添加失败',
        data: {
          userId: data.userId,
          friendUserId: data.friendUserId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 处理好友删除
   */
  async handleFriendDelete(data: any): Promise<void> {
    logger.info({
      text: '接收到好友删除',
      data: {
        userId: data.userId,
        friendUserId: data.friendUserId
      }
    });

    try {
      // 从缓存中删除好友
      await cacheManager.removeFriend(data.userId, data.friendUserId);

      // 通知前端更新
      this.notifyFrontend('friend_delete', data);

    } catch (error) {
      logger.error({
        text: '处理好友删除失败',
        data: {
          userId: data.userId,
          friendUserId: data.friendUserId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 处理好友信息更新
   */
  async handleFriendUpdate(data: any): Promise<void> {
    logger.info({
      text: '接收到好友信息更新',
      data: {
        userId: data.userId,
        friendUserId: data.friendUserId
      }
    });

    try {
      // 更新好友信息
      await cacheManager.updateFriend(data.userId, data.friendUserId, {
        nickName: data.nickName,
        avatar: data.avatar,
        abstract: data.abstract,
        notice: data.notice,
        version: data.version
      });

      // 通知前端更新
      this.notifyFrontend('friend_update', data);

    } catch (error) {
      logger.error({
        text: '处理好友信息更新失败',
        data: {
          userId: data.userId,
          friendUserId: data.friendUserId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * @description: 通知前端更新
   */
  private notifyFrontend(eventType: string, data: any): void {
    uni.$emit('friend_update', {
      type: eventType,
      data: data,
      timestamp: Date.now()
    });

    // 存储到全局状态
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app && app.globalData) {
        if (!app.globalData.friendUpdates) {
          app.globalData.friendUpdates = [];
        }
        app.globalData.friendUpdates.push({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });

        // 只保留最近的10条更新
        if (app.globalData.friendUpdates.length > 10) {
          app.globalData.friendUpdates = app.globalData.friendUpdates.slice(-10);
        }
      }
    }
  }
}

// 导出单例实例
const friendReceiver = new FriendReceiver();
export default friendReceiver;
