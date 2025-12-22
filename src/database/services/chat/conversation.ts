/**
 * @description: 聊天会话服务
 */

import { BaseService } from '../base';
import type { ConversationService } from '@/types/database';
import { CONVERSATION_FIELDS } from '@/database/tables/chat/conversation';

export class ChatConversationService extends BaseService implements ConversationService {
  async getUserConversations(userId: string): Promise<any[]> {
    const sql = `
      SELECT uc.*, c.${CONVERSATION_FIELDS.MAX_SEQ}, c.${CONVERSATION_FIELDS.LAST_MESSAGE}
      FROM user_conversations uc
      LEFT JOIN conversations c ON uc.${CONVERSATION_FIELDS.CONVERSATION_ID} = c.${CONVERSATION_FIELDS.CONVERSATION_ID}
      WHERE uc.user_id = ? AND uc.is_hidden = 0
      ORDER BY uc.is_pinned DESC, uc.updated_at DESC
    `;
    const rows = await this.query(sql, [userId]);
    return rows.map(row => ({
      conversationId: row.conversation_id,
      nickName: row.nick_name || '未知用户',
      avatar: row.avatar || '',
      msgPreview: row.last_message || '',
      updatedAt: new Date((row.updated_at || 0) * 1000).toISOString(),
      isTop: row.is_pinned || false,
      chatType: row.type === 1 ? 1 : 2,
      notice: row.notice || '',
      unreadCount: Math.max(0, (row.max_seq || 0) - (row.user_read_seq || 0)),
    }));
  }

  async saveConversation(conversation: any): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO conversations
      (${CONVERSATION_FIELDS.CONVERSATION_ID}, ${CONVERSATION_FIELDS.TYPE},
       ${CONVERSATION_FIELDS.MAX_SEQ}, ${CONVERSATION_FIELDS.LAST_MESSAGE},
       ${CONVERSATION_FIELDS.VERSION}, ${CONVERSATION_FIELDS.CREATED_AT},
       ${CONVERSATION_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.executeSql(sql, [
      conversation.conversation_id,
      conversation.type || 1,
      conversation.max_seq || 0,
      conversation.last_message || '',
      conversation.version || 0,
      conversation.created_at || Math.floor(Date.now() / 1000),
      conversation.updated_at || Math.floor(Date.now() / 1000),
    ]);
  }

  async updateConversation(conversationId: string, updates: any): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (setParts.length === 0) return;

    setParts.push(`${CONVERSATION_FIELDS.UPDATED_AT} = ?`);
    values.push(Math.floor(Date.now() / 1000));
    values.push(conversationId);

    const sql = `UPDATE conversations SET ${setParts.join(', ')} WHERE ${CONVERSATION_FIELDS.CONVERSATION_ID} = ?`;
    await this.executeSql(sql, values);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const sql = `DELETE FROM conversations WHERE ${CONVERSATION_FIELDS.CONVERSATION_ID} = ?`;
    await this.executeSql(sql, [conversationId]);
  }
}

export const chatConversationService = new ChatConversationService();