/**
 * @description: 聊天同步状态服务
 * 处理聊天同步状态相关的数据库操作
 */

import { BaseService } from '../base';
import type { ChatSyncStatusTable } from '@/types/database';
import { CHAT_SYNC_STATUS_FIELDS } from '@/database/tables/chat/sync-status';
import { SyncModule } from '@/types/database';

/**
 * @description: 聊天同步状态服务实现
 */
export class ChatSyncStatusService extends BaseService {
  /**
   * @description: 获取会话的同步状态
   */
  async getSyncStatus(conversationId: string, module: string): Promise<any> {
    const sql = `SELECT * FROM chat_sync_status WHERE ${CHAT_SYNC_STATUS_FIELDS.CONVERSATION_ID} = ? AND ${CHAT_SYNC_STATUS_FIELDS.MODULE} = ?`;
    const rows = await this.query(sql, [conversationId, module]);

    if (rows.length === 0) {
      return null;
    }

    return this.formatSyncStatus(rows[0]);
  }

  /**
   * @description: 更新同步状态
   */
  async updateSyncStatus(conversationId: string, module: string, updates: Partial<ChatSyncStatusTable>): Promise<void> {
    // 先检查是否存在记录
    const existing = await this.getSyncStatus(conversationId, module);

    if (existing) {
      // 更新现有记录
      const setParts: string[] = [];
      const values: any[] = [];

      Object.keys(updates).forEach(key => {
        if (updates[key as keyof ChatSyncStatusTable] !== undefined) {
          setParts.push(`${key} = ?`);
          values.push(updates[key as keyof ChatSyncStatusTable]);
        }
      });

      if (setParts.length === 0) return;

      setParts.push(`${CHAT_SYNC_STATUS_FIELDS.UPDATED_AT} = ?`);
      values.push(Math.floor(Date.now() / 1000));

      values.push(conversationId, module);

      const sql = `UPDATE chat_sync_status SET ${setParts.join(', ')} WHERE ${CHAT_SYNC_STATUS_FIELDS.CONVERSATION_ID} = ? AND ${CHAT_SYNC_STATUS_FIELDS.MODULE} = ?`;
      await this.executeSql(sql, values);
    } else {
      // 创建新记录
      const data = {
        conversation_id: conversationId,
        module: module,
        seq: updates.seq || 0,
        version: updates.version || 0,
        updated_at: Math.floor(Date.now() / 1000),
      };

      const sql = `
        INSERT INTO chat_sync_status
        (${CHAT_SYNC_STATUS_FIELDS.CONVERSATION_ID}, ${CHAT_SYNC_STATUS_FIELDS.MODULE},
         ${CHAT_SYNC_STATUS_FIELDS.SEQ}, ${CHAT_SYNC_STATUS_FIELDS.VERSION},
         ${CHAT_SYNC_STATUS_FIELDS.UPDATED_AT})
        VALUES (?, ?, ?, ?, ?)
      `;

      await this.executeSql(sql, [
        data.conversation_id,
        data.module,
        data.seq,
        data.version,
        data.updated_at,
      ]);
    }

    this.logger.info({ text: '聊天同步状态更新成功', data: { conversationId, module } });
  }

  /**
   * @description: 删除同步状态
   */
  async deleteSyncStatus(conversationId: string, module: string): Promise<void> {
    const sql = `DELETE FROM chat_sync_status WHERE ${CHAT_SYNC_STATUS_FIELDS.CONVERSATION_ID} = ? AND ${CHAT_SYNC_STATUS_FIELDS.MODULE} = ?`;
    await this.executeSql(sql, [conversationId, module]);

    this.logger.info({ text: '聊天同步状态删除成功', data: { conversationId, module } });
  }

  /**
   * @description: 获取需要同步的会话列表
   */
  async getSyncNeededConversations(): Promise<any[]> {
    const sql = `SELECT DISTINCT ${CHAT_SYNC_STATUS_FIELDS.CONVERSATION_ID} FROM chat_sync_status ORDER BY ${CHAT_SYNC_STATUS_FIELDS.UPDATED_AT} DESC`;
    const rows = await this.query(sql, []);

    return rows.map(row => row.conversation_id);
  }

  /**
   * @description: 批量更新同步状态
   */
  async batchUpdateSyncStatus(updates: Array<{ conversationId: string; module: string; seq?: number; version?: number }>): Promise<void> {
    for (const update of updates) {
      await this.updateSyncStatus(update.conversationId, update.module, {
        seq: update.seq,
        version: update.version,
        updated_at: Math.floor(Date.now() / 1000),
      } as any);
    }

    this.logger.info({ text: '批量聊天同步状态更新成功', data: { count: updates.length } });
  }

  /**
   * @description: 格式化同步状态数据
   */
  private formatSyncStatus(row: any): any {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      module: row.module,
      seq: row.seq,
      version: row.version,
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
    };
  }
}

// 导出单例实例
export const chatSyncStatusService = new ChatSyncStatusService();
