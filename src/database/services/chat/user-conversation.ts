/**
 * @description: 用户会话关系服务
 * 处理用户和会话之间的关系
 */

import { BaseService } from '../base';
import type { UserConversationTable } from '@/types/database';
import { USER_CONVERSATION_FIELDS } from '@/database/tables/chat/user-conversation';

/**
 * @description: 用户会话关系服务
 */
export class UserConversationService extends BaseService {
  /**
   * @description: 创建用户会话关系
   */
  async create(req: { userId: string; conversationId: string; isHidden?: boolean; isPinned?: boolean; isMuted?: boolean; userReadSeq?: number; version?: number }): Promise<void> {
    const data = {
      user_id: req.userId,
      conversation_id: req.conversationId,
      is_hidden: req.isHidden || false,
      is_pinned: req.isPinned || false,
      is_muted: req.isMuted || false,
      user_read_seq: req.userReadSeq || 0,
      version: req.version || 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const sql = `
      INSERT OR REPLACE INTO user_conversations
      (${USER_CONVERSATION_FIELDS.USER_ID}, ${USER_CONVERSATION_FIELDS.CONVERSATION_ID},
       ${USER_CONVERSATION_FIELDS.IS_HIDDEN}, ${USER_CONVERSATION_FIELDS.IS_PINNED},
       ${USER_CONVERSATION_FIELDS.IS_MUTED}, ${USER_CONVERSATION_FIELDS.USER_READ_SEQ},
       ${USER_CONVERSATION_FIELDS.VERSION}, ${USER_CONVERSATION_FIELDS.CREATED_AT},
       ${USER_CONVERSATION_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeSql(sql, [
      data.user_id,
      data.conversation_id,
      data.is_hidden ? 1 : 0,
      data.is_pinned ? 1 : 0,
      data.is_muted ? 1 : 0,
      data.user_read_seq,
      data.version,
      data.created_at,
      data.updated_at,
    ]);

    this.logger.info({ text: '用户会话关系创建成功', data: { userId: req.userId, conversationId: req.conversationId } });
  }

  /**
   * @description: 批量创建用户会话关系
   */
  async batchCreate(req: { relations: Array<{ userId: string; conversationId: string; isHidden?: boolean; isPinned?: boolean; isMuted?: boolean; userReadSeq?: number; version?: number }> }): Promise<void> {
    for (const relation of req.relations) {
      await this.create(relation);
    }

    this.logger.info({ text: '用户会话关系批量创建成功', data: { count: req.relations.length } });
  }

  /**
   * @description: 根据用户ID和会话ID获取关系
   */
  async getByUserAndConversation(req: { userId: string; conversationId: string }): Promise<any> {
    const sql = `SELECT * FROM user_conversations WHERE ${USER_CONVERSATION_FIELDS.USER_ID} = ? AND ${USER_CONVERSATION_FIELDS.CONVERSATION_ID} = ?`;
    const rows = await this.query(sql, [req.userId, req.conversationId]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatUserConversation(rows[0]);
  }

  /**
   * @description: 获取用户的所有会话关系
   */
  async getByUser(req: { userId: string; limit?: number; offset?: number }): Promise<any[]> {
    const limit = req.limit || 100;
    const offset = req.offset || 0;

    const sql = `SELECT * FROM user_conversations WHERE ${USER_CONVERSATION_FIELDS.USER_ID} = ? ORDER BY ${USER_CONVERSATION_FIELDS.IS_PINNED} DESC, ${USER_CONVERSATION_FIELDS.UPDATED_AT} DESC LIMIT ? OFFSET ?`;
    const rows = await this.query(sql, [req.userId, limit, offset]);

    return rows.map(row => this.formatUserConversation(row));
  }

  /**
   * @description: 更新用户会话关系
   */
  async update(req: { userId: string; conversationId: string; updates: Partial<UserConversationTable> }): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.keys(req.updates).forEach(key => {
      if (req.updates[key as keyof UserConversationTable] !== undefined) {
        // 布尔值转换为数字
        if (typeof req.updates[key as keyof UserConversationTable] === 'boolean') {
          setParts.push(`${key} = ?`);
          values.push(req.updates[key as keyof UserConversationTable] ? 1 : 0);
        } else {
          setParts.push(`${key} = ?`);
          values.push(req.updates[key as keyof UserConversationTable]);
        }
      }
    });

    if (setParts.length === 0) return;

    // 自动更新updated_at
    setParts.push(`${USER_CONVERSATION_FIELDS.UPDATED_AT} = ?`);
    values.push(Math.floor(Date.now() / 1000));

    values.push(req.userId, req.conversationId);

    const sql = `UPDATE user_conversations SET ${setParts.join(', ')} WHERE ${USER_CONVERSATION_FIELDS.USER_ID} = ? AND ${USER_CONVERSATION_FIELDS.CONVERSATION_ID} = ?`;
    await this.executeSql(sql, values);

    this.logger.info({ text: '用户会话关系更新成功', data: { userId: req.userId, conversationId: req.conversationId } });
  }

  /**
   * @description: 删除用户会话关系
   */
  async delete(req: { userId: string; conversationId: string }): Promise<void> {
    const sql = `DELETE FROM user_conversations WHERE ${USER_CONVERSATION_FIELDS.USER_ID} = ? AND ${USER_CONVERSATION_FIELDS.CONVERSATION_ID} = ?`;
    await this.executeSql(sql, [req.userId, req.conversationId]);

    this.logger.info({ text: '用户会话关系删除成功', data: { userId: req.userId, conversationId: req.conversationId } });
  }

  /**
   * @description: 标记消息已读
   */
  async markAsRead(req: { userId: string; conversationId: string; readSeq: number }): Promise<void> {
    await this.update({
      userId: req.userId,
      conversationId: req.conversationId,
      updates: { user_read_seq: req.readSeq, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 置顶/取消置顶会话
   */
  async togglePin(req: { userId: string; conversationId: string; isPinned: boolean }): Promise<void> {
    await this.update({
      userId: req.userId,
      conversationId: req.conversationId,
      updates: { is_pinned: req.isPinned, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 隐藏/显示会话
   */
  async toggleHidden(req: { userId: string; conversationId: string; isHidden: boolean }): Promise<void> {
    await this.update({
      userId: req.userId,
      conversationId: req.conversationId,
      updates: { is_hidden: req.isHidden, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 静音/取消静音会话
   */
  async toggleMute(req: { userId: string; conversationId: string; isMuted: boolean }): Promise<void> {
    await this.update({
      userId: req.userId,
      conversationId: req.conversationId,
      updates: { is_muted: req.isMuted, updated_at: Math.floor(Date.now() / 1000) } as any,
    });
  }

  /**
   * @description: 格式化用户会话关系数据
   */
  private formatUserConversation(row: any): any {
    return {
      id: row.id,
      userId: row.user_id,
      conversationId: row.conversation_id,
      isHidden: Boolean(row.is_hidden),
      isPinned: Boolean(row.is_pinned),
      isMuted: Boolean(row.is_muted),
      userReadSeq: row.user_read_seq,
      version: row.version,
      createdAt: new Date((row.created_at || 0) * 1000).toISOString(),
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }
}

// 导出单例实例
export const userConversationService = new UserConversationService();
