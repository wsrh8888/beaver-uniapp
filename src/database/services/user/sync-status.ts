/**
 * @description: 用户同步状态服务
 * 处理用户同步状态相关的数据库操作
 */

import { BaseService } from '../base';
import type { UserSyncStatusTable } from '@/types/database';
import { USER_SYNC_STATUS_FIELDS } from '@/database/tables/user/sync-status';

/**
 * @description: 用户同步状态服务实现
 */
export class UserSyncStatusService extends BaseService {
  /**
   * @description: 获取用户的同步状态
   */
  async getUserSyncStatus(userId: string): Promise<any> {
    const sql = `SELECT * FROM user_sync_status WHERE ${USER_SYNC_STATUS_FIELDS.USER_ID} = ?`;
    const rows = await this.query(sql, [userId]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatSyncStatus(rows[0]);
  }

  /**
   * @description: 创建或更新用户同步状态
   */
  async upsertUserSyncStatus(userId: string, updates: Partial<UserSyncStatusTable>): Promise<void> {
    // 检查是否存在记录
    const existing = await this.getUserSyncStatus(userId);

    if (existing) {
      // 更新现有记录
      const setParts: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (updates[key as keyof UserSyncStatusTable] !== undefined) {
          setParts.push(`${key} = ?`);
          values.push(updates[key as keyof UserSyncStatusTable]);
        }
      });

      if (setParts.length === 0) return;

      setParts.push(`${USER_SYNC_STATUS_FIELDS.UPDATED_AT} = ?`);
      values.push(Math.floor(Date.now() / 1000));

      values.push(userId);

      const sql = `UPDATE user_sync_status SET ${setParts.join(', ')} WHERE ${USER_SYNC_STATUS_FIELDS.USER_ID} = ?`;
      await this.executeSql(sql, values);
    } else {
      // 创建新记录
      const data = {
        user_id: userId,
        user_version: updates.user_version || 0,
        last_sync_time: updates.last_sync_time || 0,
        updated_at: Math.floor(Date.now() / 1000),
      };

      const sql = `
        INSERT INTO user_sync_status
        (${USER_SYNC_STATUS_FIELDS.USER_ID}, ${USER_SYNC_STATUS_FIELDS.USER_VERSION},
         ${USER_SYNC_STATUS_FIELDS.LAST_SYNC_TIME}, ${USER_SYNC_STATUS_FIELDS.UPDATED_AT})
        VALUES (?, ?, ?, ?)
      `;

      await this.executeSql(sql, [
        data.user_id,
        data.user_version,
        data.last_sync_time,
        data.updated_at,
      ]);
    }

    this.logger.info({ text: '用户同步状态更新成功', data: { userId } });
  }

  /**
   * @description: 更新用户版本号
   */
  async updateUserVersion(userId: string, version: number): Promise<void> {
    await this.upsertUserSyncStatus(userId, {
      user_version: version,
      updated_at: Math.floor(Date.now() / 1000),
    } as any);
  }

  /**
   * @description: 更新最后同步时间
   */
  async updateLastSyncTime(userId: string, syncTime: number): Promise<void> {
    await this.upsertUserSyncStatus(userId, {
      last_sync_time: syncTime,
      updated_at: Math.floor(Date.now() / 1000),
    } as any);
  }

  /**
   * @description: 获取需要同步的用户列表
   */
  async getUsersNeedSync(): Promise<any[]> {
    const sql = `SELECT * FROM user_sync_status ORDER BY ${USER_SYNC_STATUS_FIELDS.LAST_SYNC_TIME} ASC`;
    const rows = await this.query(sql, []);

    return rows.map(row => this.formatSyncStatus(row));
  }

  /**
   * @description: 删除用户同步状态
   */
  async deleteUserSyncStatus(userId: string): Promise<void> {
    const sql = `DELETE FROM user_sync_status WHERE ${USER_SYNC_STATUS_FIELDS.USER_ID} = ?`;
    await this.executeSql(sql, [userId]);

    this.logger.info({ text: '用户同步状态删除成功', data: { userId } });
  }

  /**
   * @description: 批量更新用户同步状态
   */
  async batchUpdateSyncStatus(updates: Array<{ userId: string; userVersion?: number; lastSyncTime?: number }>): Promise<void> {
    for (const update of updates) {
      await this.upsertUserSyncStatus(update.userId, {
        user_version: update.userVersion,
        last_sync_time: update.lastSyncTime,
        updated_at: Math.floor(Date.now() / 1000),
      } as any);
    }

    this.logger.info({ text: '批量用户同步状态更新成功', data: { count: updates.length } });
  }

  /**
   * @description: 获取同步统计信息
   */
  async getSyncStats(): Promise<any> {
    const totalUsersSql = `SELECT COUNT(*) as total FROM user_sync_status`;
    const needSyncSql = `SELECT COUNT(*) as need_sync FROM user_sync_status WHERE ${USER_SYNC_STATUS_FIELDS.LAST_SYNC_TIME} < ?`;
    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    const [totalResult, needSyncResult] = await Promise.all([
      this.query(totalUsersSql, []),
      this.query(needSyncSql, [oneDayAgo]),
    ]);

    return {
      totalUsers: totalResult[0]?.total || 0,
      needSyncUsers: needSyncResult[0]?.need_sync || 0,
      syncRatio: totalResult[0]?.total ? ((totalResult[0].total - needSyncResult[0]?.need_sync) / totalResult[0].total * 100).toFixed(2) : 0,
    };
  }

  /**
   * @description: 格式化同步状态数据
   */
  private formatSyncStatus(row: any): any {
    return {
      id: row.id,
      userId: row.user_id,
      userVersion: row.user_version,
      lastSyncTime: new Date((row.last_sync_time || 0) * 1000).toISOString(),
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }
}

// 导出单例实例
export const userSyncStatusService = new UserSyncStatusService();
