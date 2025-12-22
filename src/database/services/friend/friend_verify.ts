/**
 * @description: 好友验证服务
 * 处理好友验证相关的数据库操作
 */

import { BaseService } from '../base';
import type { FriendVerifyTable } from '@/types/database';
import { FRIEND_VERIFY_FIELDS, FriendVerifyStatus, FriendVerifySource } from '@/database/tables/friend/friend_verify';

/**
 * @description: 好友验证服务实现
 */
export class FriendVerifyService extends BaseService {
  /**
   * @description: 创建好友验证请求
   */
  async createVerifyRequest(req: { verifyId: string; sendUserId: string; revUserId: string; message?: string; source?: string }): Promise<void> {
    const data = {
      verify_id: req.verifyId,
      send_user_id: req.sendUserId,
      rev_user_id: req.revUserId,
      send_status: FriendVerifyStatus.PENDING,
      rev_status: FriendVerifyStatus.PENDING,
      message: req.message || '',
      source: req.source || FriendVerifySource.SEARCH,
      version: 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const sql = `
      INSERT OR REPLACE INTO friend_verifies
      (${FRIEND_VERIFY_FIELDS.VERIFY_ID}, ${FRIEND_VERIFY_FIELDS.SEND_USER_ID},
       ${FRIEND_VERIFY_FIELDS.REV_USER_ID}, ${FRIEND_VERIFY_FIELDS.SEND_STATUS},
       ${FRIEND_VERIFY_FIELDS.REV_STATUS}, ${FRIEND_VERIFY_FIELDS.MESSAGE},
       ${FRIEND_VERIFY_FIELDS.SOURCE}, ${FRIEND_VERIFY_FIELDS.VERSION},
       ${FRIEND_VERIFY_FIELDS.CREATED_AT}, ${FRIEND_VERIFY_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeSql(sql, [
      data.verify_id,
      data.send_user_id,
      data.rev_user_id,
      data.send_status,
      data.rev_status,
      data.message,
      data.source,
      data.version,
      data.created_at,
      data.updated_at,
    ]);

    this.logger.info({ text: '好友验证请求创建成功', data: { verifyId: req.verifyId } });
  }

  /**
   * @description: 根据ID获取验证请求
   */
  async getById(verifyId: string): Promise<any> {
    const sql = `SELECT * FROM friend_verifies WHERE ${FRIEND_VERIFY_FIELDS.VERIFY_ID} = ?`;
    const rows = await this.query(sql, [verifyId]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatVerifyRequest(rows[0]);
  }

  /**
   * @description: 获取用户发送的验证请求
   */
  async getSentRequests(userId: string, limit: number = 50): Promise<any[]> {
    const sql = `SELECT * FROM friend_verifies WHERE ${FRIEND_VERIFY_FIELDS.SEND_USER_ID} = ? ORDER BY ${FRIEND_VERIFY_FIELDS.CREATED_AT} DESC LIMIT ?`;
    const rows = await this.query(sql, [userId, limit]);

    return rows.map(row => this.formatVerifyRequest(row));
  }

  /**
   * @description: 获取用户收到的验证请求
   */
  async getReceivedRequests(userId: string, limit: number = 50): Promise<any[]> {
    const sql = `SELECT * FROM friend_verifies WHERE ${FRIEND_VERIFY_FIELDS.REV_USER_ID} = ? ORDER BY ${FRIEND_VERIFY_FIELDS.CREATED_AT} DESC LIMIT ?`;
    const rows = await this.query(sql, [userId, limit]);

    return rows.map(row => this.formatVerifyRequest(row));
  }

  /**
   * @description: 更新验证请求状态
   */
  async updateStatus(req: { verifyId: string; userId: string; status: number; isSender: boolean }): Promise<void> {
    const field = req.isSender ? FRIEND_VERIFY_FIELDS.SEND_STATUS : FRIEND_VERIFY_FIELDS.REV_STATUS;

    const sql = `UPDATE friend_verifies SET ${field} = ?, ${FRIEND_VERIFY_FIELDS.UPDATED_AT} = ? WHERE ${FRIEND_VERIFY_FIELDS.VERIFY_ID} = ?`;
    await this.executeSql(sql, [req.status, Math.floor(Date.now() / 1000), req.verifyId]);

    this.logger.info({ text: '好友验证状态更新成功', data: { verifyId: req.verifyId, status: req.status } });
  }

  /**
   * @description: 接受验证请求
   */
  async acceptRequest(verifyId: string, userId: string): Promise<void> {
    // 获取验证请求信息
    const request = await this.getById(verifyId);
    if (!request) {
      throw new Error('验证请求不存在');
    }

    // 判断当前用户是发送方还是接收方
    const isSender = request.sendUserId === userId;

    await this.updateStatus({
      verifyId,
      userId,
      status: FriendVerifyStatus.ACCEPTED,
      isSender,
    });
  }

  /**
   * @description: 拒绝验证请求
   */
  async rejectRequest(verifyId: string, userId: string): Promise<void> {
    const request = await this.getById(verifyId);
    if (!request) {
      throw new Error('验证请求不存在');
    }

    const isSender = request.sendUserId === userId;

    await this.updateStatus({
      verifyId,
      userId,
      status: FriendVerifyStatus.REJECTED,
      isSender,
    });
  }

  /**
   * @description: 删除验证请求
   */
  async deleteRequest(verifyId: string): Promise<void> {
    const sql = `DELETE FROM friend_verifies WHERE ${FRIEND_VERIFY_FIELDS.VERIFY_ID} = ?`;
    await this.executeSql(sql, [verifyId]);

    this.logger.info({ text: '好友验证请求删除成功', data: { verifyId } });
  }

  /**
   * @description: 获取待处理的请求数量
   */
  async getPendingCount(userId: string): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM friend_verifies WHERE ${FRIEND_VERIFY_FIELDS.REV_USER_ID} = ? AND ${FRIEND_VERIFY_FIELDS.REV_STATUS} = ?`;
    const rows = await this.query(sql, [userId, FriendVerifyStatus.PENDING]);

    return rows[0]?.count || 0;
  }

  /**
   * @description: 格式化验证请求数据
   */
  private formatVerifyRequest(row: any): any {
    return {
      id: row.id,
      verifyId: row.verify_id,
      sendUserId: row.send_user_id,
      revUserId: row.rev_user_id,
      sendStatus: row.send_status,
      revStatus: row.rev_status,
      message: row.message,
      source: row.source,
      version: row.version,
      createdAt: new Date((row.created_at || 0) * 1000).toISOString(),
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }
}

// 导出单例实例
export const friendVerifyService = new FriendVerifyService();
