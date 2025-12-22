/**
 * @description: 好友服务
 * 处理好友相关的数据库操作
 */

import { BaseService } from '../base';
import type { FriendTable, FriendService } from '@/types/database';
import { FRIEND_FIELDS, FriendStatus } from '@/database/tables/friend/friend';

/**
 * @description: 好友服务实现
 */
export class FriendServiceImpl extends BaseService implements FriendService {
  /**
   * @description: 创建好友关系
   */
  async create(req: { userId: string; friendUserId: string; nickName?: string; avatar?: string; abstract?: string; notice?: string; source?: string; status?: number; version?: number }): Promise<void> {
    const data = {
      user_id: req.userId,
      friend_user_id: req.friendUserId,
      nick_name: req.nickName || '',
      avatar: req.avatar || '',
      abstract: req.abstract || '',
      notice: req.notice || '',
      source: req.source || '',
      status: req.status || FriendStatus.NORMAL,
      version: req.version || 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const sql = `
      INSERT OR REPLACE INTO friends
      (${FRIEND_FIELDS.USER_ID}, ${FRIEND_FIELDS.FRIEND_USER_ID},
       ${FRIEND_FIELDS.NICK_NAME}, ${FRIEND_FIELDS.AVATAR},
       ${FRIEND_FIELDS.ABSTRACT}, ${FRIEND_FIELDS.NOTICE},
       ${FRIEND_FIELDS.SOURCE}, ${FRIEND_FIELDS.STATUS},
       ${FRIEND_FIELDS.VERSION}, ${FRIEND_FIELDS.CREATED_AT},
       ${FRIEND_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeSql(sql, [
      data.user_id,
      data.friend_user_id,
      data.nick_name,
      data.avatar,
      data.abstract,
      data.notice,
      data.source,
      data.status,
      data.version,
      data.created_at,
      data.updated_at,
    ]);

    this.logger.info({ text: '好友关系创建成功', data: { userId: req.userId, friendUserId: req.friendUserId } });
  }

  /**
   * @description: 批量创建好友关系
   */
  async batchCreate(req: { friends: Array<{ userId: string; friendUserId: string; nickName?: string; avatar?: string; abstract?: string; notice?: string; source?: string; status?: number; version?: number }> }): Promise<void> {
    for (const friend of req.friends) {
      await this.create(friend);
    }

    this.logger.info({ text: '好友关系批量创建成功', data: { count: req.friends.length } });
  }

  /**
   * @description: 根据ID获取好友关系
   */
  async getById(req: { userId: string; friendUserId: string }): Promise<any> {
    const sql = `SELECT * FROM friends WHERE ${FRIEND_FIELDS.USER_ID} = ? AND ${FRIEND_FIELDS.FRIEND_USER_ID} = ?`;
    const rows = await this.query(sql, [req.userId, req.friendUserId]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatFriend(rows[0]);
  }

  /**
   * @description: 获取用户的所有好友
   */
  async getFriends(userId: string): Promise<any[]> {
    const sql = `
      SELECT f.*, u.${FRIEND_FIELDS.NICK_NAME} as user_nick_name, u.${FRIEND_FIELDS.AVATAR} as user_avatar, u.${FRIEND_FIELDS.ABSTRACT} as user_abstract
      FROM friends f
      LEFT JOIN users u ON f.${FRIEND_FIELDS.FRIEND_USER_ID} = u.${FRIEND_FIELDS.USER_ID}
      WHERE f.${FRIEND_FIELDS.USER_ID} = ? AND f.${FRIEND_FIELDS.STATUS} = ${FriendStatus.NORMAL}
      ORDER BY f.${FRIEND_FIELDS.UPDATED_AT} DESC
    `;

    const rows = await this.query(sql, [userId]);
    return rows.map(row => this.formatFriendWithUserInfo(row));
  }

  /**
   * @description: 根据状态获取好友
   */
  async getByStatus(req: { userId: string; status: number; limit?: number; offset?: number }): Promise<any[]> {
    const limit = req.limit || 50;
    const offset = req.offset || 0;

    const sql = `
      SELECT f.*, u.${FRIEND_FIELDS.NICK_NAME} as user_nick_name, u.${FRIEND_FIELDS.AVATAR} as user_avatar, u.${FRIEND_FIELDS.ABSTRACT} as user_abstract
      FROM friends f
      LEFT JOIN users u ON f.${FRIEND_FIELDS.FRIEND_USER_ID} = u.${FRIEND_FIELDS.USER_ID}
      WHERE f.${FRIEND_FIELDS.USER_ID} = ? AND f.${FRIEND_FIELDS.STATUS} = ?
      ORDER BY f.${FRIEND_FIELDS.UPDATED_AT} DESC LIMIT ? OFFSET ?
    `;

    const rows = await this.query(sql, [req.userId, req.status, limit, offset]);
    return rows.map(row => this.formatFriendWithUserInfo(row));
  }

  /**
   * @description: 搜索好友
   */
  async searchFriends(req: { userId: string; keyword: string; limit?: number }): Promise<any[]> {
    const limit = req.limit || 20;

    const sql = `
      SELECT f.*, u.${FRIEND_FIELDS.NICK_NAME} as user_nick_name, u.${FRIEND_FIELDS.AVATAR} as user_avatar, u.${FRIEND_FIELDS.ABSTRACT} as user_abstract
      FROM friends f
      LEFT JOIN users u ON f.${FRIEND_FIELDS.FRIEND_USER_ID} = u.${FRIEND_FIELDS.USER_ID}
      WHERE f.${FRIEND_FIELDS.USER_ID} = ? AND f.${FRIEND_FIELDS.STATUS} = ${FriendStatus.NORMAL}
      AND (u.${FRIEND_FIELDS.NICK_NAME} LIKE ? OR f.${FRIEND_FIELDS.NICK_NAME} LIKE ?)
      ORDER BY f.${FRIEND_FIELDS.UPDATED_AT} DESC LIMIT ?
    `;

    const keyword = `%${req.keyword}%`;
    const rows = await this.query(sql, [req.userId, keyword, keyword, limit]);
    return rows.map(row => this.formatFriendWithUserInfo(row));
  }

  /**
   * @description: 更新好友信息
   */
  async update(req: { userId: string; friendUserId: string; updates: Partial<FriendTable> }): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.keys(req.updates).forEach(key => {
      if (req.updates[key as keyof FriendTable] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(req.updates[key as keyof FriendTable]);
      }
    });

    if (setParts.length === 0) return;

    // 自动更新updated_at
    setParts.push(`${FRIEND_FIELDS.UPDATED_AT} = ?`);
    values.push(Math.floor(Date.now() / 1000));

    values.push(req.userId, req.friendUserId);

    const sql = `UPDATE friends SET ${setParts.join(', ')} WHERE ${FRIEND_FIELDS.USER_ID} = ? AND ${FRIEND_FIELDS.FRIEND_USER_ID} = ?`;
    await this.executeSql(sql, values);

    this.logger.info({ text: '好友信息更新成功', data: { userId: req.userId, friendUserId: req.friendUserId } });
  }

  /**
   * @description: 删除好友关系
   */
  async delete(req: { userId: string; friendUserId: string }): Promise<void> {
    const sql = `UPDATE friends SET ${FRIEND_FIELDS.STATUS} = ${FriendStatus.DELETED}, ${FRIEND_FIELDS.UPDATED_AT} = ? WHERE ${FRIEND_FIELDS.USER_ID} = ? AND ${FRIEND_FIELDS.FRIEND_USER_ID} = ?`;
    await this.executeSql(sql, [Math.floor(Date.now() / 1000), req.userId, req.friendUserId]);

    this.logger.info({ text: '好友关系删除成功', data: { userId: req.userId, friendUserId: req.friendUserId } });
  }

  /**
   * @description: 屏蔽好友
   */
  async blockFriend(req: { userId: string; friendUserId: string }): Promise<void> {
    await this.update({
      userId: req.userId,
      friendUserId: req.friendUserId,
      updates: { status: FriendStatus.BLOCKED, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 取消屏蔽好友
   */
  async unblockFriend(req: { userId: string; friendUserId: string }): Promise<void> {
    await this.update({
      userId: req.userId,
      friendUserId: req.friendUserId,
      updates: { status: FriendStatus.NORMAL, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 保存好友
   */
  async saveFriend(friend: any): Promise<void> {
    await this.create(friend);
  }

  /**
   * @description: 更新好友信息
   */
  async updateFriend(userId: string, friendUserId: string, updates: Partial<FriendTable>): Promise<void> {
    await this.update({ userId, friendUserId, updates });
  }

  /**
   * @description: 删除好友
   */
  async deleteFriend(userId: string, friendUserId: string): Promise<void> {
    await this.delete({ userId, friendUserId });
  }

  /**
   * @description: 格式化好友数据（不含用户信息）
   */
  private formatFriend(row: any): any {
    return {
      id: row.id,
      userId: row.user_id,
      friendUserId: row.friend_user_id,
      nickName: row.nick_name,
      avatar: row.avatar,
      abstract: row.abstract,
      notice: row.notice,
      source: row.source,
      status: row.status,
      version: row.version,
      createdAt: new Date((row.created_at || 0) * 1000).toISOString(),
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }

  /**
   * @description: 格式化好友数据（包含用户信息）
   */
  private formatFriendWithUserInfo(row: any): any {
    return {
      userId: row.friend_user_id,
      nickName: row.nick_name || row.user_nick_name || '未知用户',
      avatar: row.avatar || row.user_avatar || '',
      abstract: row.abstract || row.user_abstract || '',
      notice: row.notice || '',
      source: row.source || '',
      status: row.status || FriendStatus.NORMAL,
      isOnline: false, // 这里可以扩展在线状态逻辑
      lastSeen: null,  // 这里可以扩展最后在线时间逻辑
    };
  }
}

// 导出单例实例
export const friendService = new FriendServiceImpl();