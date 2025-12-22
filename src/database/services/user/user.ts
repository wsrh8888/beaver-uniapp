/**
 * @description: 用户服务
 * 处理用户相关的数据库操作
 */

import { BaseService } from '../base';
import type { UserTable, UserService } from '@/types/database';
import { USER_FIELDS } from '@/database/tables/user/user';
import { UserGender } from '@/types/database';

/**
 * @description: 用户服务实现
 */
export class UserServiceImpl extends BaseService implements UserService {
  /**
   * @description: 创建用户
   */
  async create(req: { userId: string; nickName?: string; avatar?: string; abstract?: string; email?: string; gender?: number; phone?: string; version?: number }): Promise<void> {
    const data = {
      user_id: req.userId,
      nick_name: req.nickName || '',
      avatar: req.avatar || '',
      abstract: req.abstract || '',
      email: req.email || '',
      gender: req.gender || UserGender.UNKNOWN,
      phone: req.phone || '',
      version: req.version || 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const sql = `
      INSERT OR REPLACE INTO users
      (${USER_FIELDS.USER_ID}, ${USER_FIELDS.NICK_NAME}, ${USER_FIELDS.AVATAR},
       ${USER_FIELDS.ABSTRACT}, ${USER_FIELDS.EMAIL}, ${USER_FIELDS.GENDER},
       ${USER_FIELDS.PHONE}, ${USER_FIELDS.VERSION}, ${USER_FIELDS.CREATED_AT},
       ${USER_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeSql(sql, [
      data.user_id,
      data.nick_name,
      data.avatar,
      data.abstract,
      data.email,
      data.gender,
      data.phone,
      data.version,
      data.created_at,
      data.updated_at,
    ]);

    this.logger.info({ text: '用户创建成功', data: { userId: req.userId } });
  }

  /**
   * @description: 批量创建用户
   */
  async batchCreate(req: { users: Array<{ userId: string; nickName?: string; avatar?: string; abstract?: string; email?: string; gender?: number; phone?: string; version?: number }> }): Promise<void> {
    for (const user of req.users) {
      await this.create(user);
    }

    this.logger.info({ text: '用户批量创建成功', data: { count: req.users.length } });
  }

  /**
   * @description: 根据ID获取用户
   */
  async getById(req: { userId: string }): Promise<any> {
    const sql = `SELECT * FROM users WHERE ${USER_FIELDS.USER_ID} = ?`;
    const rows = await this.query(sql, [req.userId]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatUser(rows[0]);
  }

  /**
   * @description: 根据ID列表获取用户
   */
  async getByIds(req: { userIds: string[] }): Promise<any[]> {
    if (req.userIds.length === 0) {
      return [];
    }

    const placeholders = req.userIds.map(() => '?').join(',');
    const sql = `SELECT * FROM users WHERE ${USER_FIELDS.USER_ID} IN (${placeholders})`;

    const rows = await this.query(sql, req.userIds);
    return rows.map(row => this.formatUser(row));
  }

  /**
   * @description: 根据邮箱获取用户
   */
  async getByEmail(req: { email: string }): Promise<any> {
    const sql = `SELECT * FROM users WHERE ${USER_FIELDS.EMAIL} = ?`;
    const rows = await this.query(sql, [req.email]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatUser(rows[0]);
  }

  /**
   * @description: 搜索用户
   */
  async searchUsers(req: { keyword: string; limit?: number }): Promise<any[]> {
    const limit = req.limit || 20;

    const sql = `SELECT * FROM users WHERE ${USER_FIELDS.NICK_NAME} LIKE ? OR ${USER_FIELDS.EMAIL} LIKE ? ORDER BY ${USER_FIELDS.CREATED_AT} DESC LIMIT ?`;
    const keyword = `%${req.keyword}%`;

    const rows = await this.query(sql, [keyword, keyword, limit]);
    return rows.map(row => this.formatUser(row));
  }

  /**
   * @description: 更新用户信息
   */
  async update(req: { userId: string; updates: Partial<UserTable> }): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.keys(req.updates).forEach(key => {
      if (req.updates[key as keyof UserTable] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(req.updates[key as keyof UserTable]);
      }
    });

    if (setParts.length === 0) return;

    // 自动更新updated_at
    setParts.push(`${USER_FIELDS.UPDATED_AT} = ?`);
    values.push(Math.floor(Date.now() / 1000));

    values.push(req.userId);

    const sql = `UPDATE users SET ${setParts.join(', ')} WHERE ${USER_FIELDS.USER_ID} = ?`;
    await this.executeSql(sql, values);

    this.logger.info({ text: '用户信息更新成功', data: { userId: req.userId } });
  }

  /**
   * @description: 删除用户
   */
  async delete(req: { userId: string }): Promise<void> {
    const sql = `DELETE FROM users WHERE ${USER_FIELDS.USER_ID} = ?`;
    await this.executeSql(sql, [req.userId]);

    this.logger.info({ text: '用户删除成功', data: { userId: req.userId } });
  }

  /**
   * @description: 获取用户
   */
  async getUser(userId: string): Promise<any> {
    return await this.getById({ userId });
  }

  /**
   * @description: 保存用户
   */
  async saveUser(user: any): Promise<void> {
    await this.create(user);
  }

  /**
   * @description: 更新用户
   */
  async updateUser(userId: string, updates: Partial<UserTable>): Promise<void> {
    await this.update({ userId, updates });
  }

  /**
   * @description: 格式化用户数据
   */
  private formatUser(row: any): any {
    return {
      id: row.id,
      userId: row.user_id,
      nickName: row.nick_name,
      avatar: row.avatar,
      abstract: row.abstract,
      email: row.email,
      gender: row.gender,
      phone: row.phone,
      version: row.version,
      createdAt: new Date((row.created_at || 0) * 1000).toISOString(),
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }
}

// 导出单例实例
export const userService = new UserServiceImpl();