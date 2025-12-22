/**
 * @description: 消息服务
 * 处理消息相关的数据库操作
 */

import { BaseService } from '../base';
import type { MessageService, MessageTable } from '@/types/database';
import { MESSAGE_FIELDS } from '@/database/tables/chat/message';
import { MessageStatus, MessageType } from '@/types/database';

/**
 * @description: 消息服务实现
 */
export class MessageServiceImpl extends BaseService implements MessageService {
  /**
   * @description: 获取会话的消息列表
   */
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<any[]> {
    const sql = `
      SELECT m.*, u.${MESSAGE_FIELDS.NICK_NAME}, u.${MESSAGE_FIELDS.AVATAR}
      FROM messages m
      LEFT JOIN users u ON m.${MESSAGE_FIELDS.SEND_USER_ID} = u.${MESSAGE_FIELDS.USER_ID}
      WHERE m.${MESSAGE_FIELDS.CONVERSATION_ID} = ? AND m.${MESSAGE_FIELDS.STATUS} != ${MessageStatus.DELETED}
      ORDER BY m.${MESSAGE_FIELDS.SEQ} DESC LIMIT ?
    `;

    const rows = await this.query(sql, [conversationId, limit]);
    return this.formatMessages(rows.reverse()); // 反转回正序
  }

  /**
   * @description: 保存消息
   */
  async saveMessage(message: any): Promise<void> {
    const data = {
      message_id: message.messageId,
      conversation_id: message.conversationId,
      conversation_type: message.conversationType || 1,
      seq: message.seq,
      send_user_id: message.sendUserId,
      msg_type: message.msgType || MessageType.TEXT,
      msg_preview: message.msgPreview || '',
      msg: JSON.stringify(message.msg || {}),
      status: MessageStatus.NORMAL,
      created_at: Math.floor(message.createdAt / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const sql = `
      INSERT OR REPLACE INTO messages
      (${MESSAGE_FIELDS.MESSAGE_ID}, ${MESSAGE_FIELDS.CONVERSATION_ID},
       ${MESSAGE_FIELDS.CONVERSATION_TYPE}, ${MESSAGE_FIELDS.SEQ},
       ${MESSAGE_FIELDS.SEND_USER_ID}, ${MESSAGE_FIELDS.MSG_TYPE},
       ${MESSAGE_FIELDS.MSG_PREVIEW}, ${MESSAGE_FIELDS.MSG},
       ${MESSAGE_FIELDS.STATUS}, ${MESSAGE_FIELDS.CREATED_AT},
       ${MESSAGE_FIELDS.UPDATED_AT})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.executeSql(sql, [
      data.message_id,
      data.conversation_id,
      data.conversation_type,
      data.seq,
      data.send_user_id,
      data.msg_type,
      data.msg_preview,
      data.msg,
      data.status,
      data.created_at,
      data.updated_at,
    ]);

    this.logger.info({ text: '消息保存成功', data: { messageId: data.message_id } });
  }

  /**
   * @description: 更新消息
   */
  async updateMessage(messageId: string, updates: Partial<MessageTable>): Promise<void> {
    const setParts: string[] = [];
    const values: any[] = [];

    Object.keys(updates).forEach(key => {
      if (updates[key as keyof MessageTable] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(updates[key as keyof MessageTable]);
      }
    });

    if (setParts.length === 0) return;

    // 自动更新updated_at
    setParts.push(`${MESSAGE_FIELDS.UPDATED_AT} = ?`);
    values.push(Math.floor(Date.now() / 1000));

    values.push(messageId);

    const sql = `UPDATE messages SET ${setParts.join(', ')} WHERE ${MESSAGE_FIELDS.MESSAGE_ID} = ?`;
    await this.executeSql(sql, values);

    this.logger.info({ text: '消息更新成功', data: { messageId } });
  }

  /**
   * @description: 删除消息
   */
  async deleteMessage(messageId: string): Promise<void> {
    const sql = `UPDATE messages SET ${MESSAGE_FIELDS.STATUS} = ${MessageStatus.DELETED}, ${MESSAGE_FIELDS.UPDATED_AT} = ? WHERE ${MESSAGE_FIELDS.MESSAGE_ID} = ?`;
    await this.executeSql(sql, [Math.floor(Date.now() / 1000), messageId]);

    this.logger.info({ text: '消息删除成功', data: { messageId } });
  }

  /**
   * @description: 获取会话的最新消息
   */
  async getLatestMessage(conversationId: string): Promise<any> {
    const sql = `
      SELECT * FROM messages
      WHERE ${MESSAGE_FIELDS.CONVERSATION_ID} = ? AND ${MESSAGE_FIELDS.STATUS} != ${MessageStatus.DELETED}
      ORDER BY ${MESSAGE_FIELDS.SEQ} DESC LIMIT 1
    `;

    const rows = await this.query(sql, [conversationId]);
    return rows.length > 0 ? this.formatMessages([rows[0]])[0] : null;
  }

  /**
   * @description: 撤回消息
   */
  async recallMessage(messageId: string): Promise<void> {
    await this.updateMessage(messageId, { status: MessageStatus.RECALLED } as any);
    this.logger.info({ text: '消息撤回成功', data: { messageId } });
  }

  /**
   * @description: 编辑消息
   */
  async editMessage(messageId: string, newContent: string): Promise<void> {
    const updates: Partial<MessageTable> = {
      msg_preview: newContent,
      status: MessageStatus.EDITED,
    } as any;

    await this.updateMessage(messageId, updates);
    this.logger.info({ text: '消息编辑成功', data: { messageId } });
  }

  /**
   * @description: 格式化消息数据
   */
  private formatMessages(rows: any[]): any[] {
    return rows.map(row => ({
      id: row.id,
      messageId: row.message_id,
      conversationId: row.conversation_id,
      msg: row.msg ? JSON.parse(row.msg) : {},
      sender: {
        userId: row.send_user_id || '',
        avatar: row.avatar || '',
        nickName: row.nick_name || '未知用户'
      },
      createdAt: new Date((row.created_at || 0) * 1000).toISOString(),
      msgPreview: row.msg_preview || '',
      status: row.status || MessageStatus.NORMAL,
      seq: row.seq || 0,
      msgType: row.msg_type || MessageType.TEXT,
    }));
  }
}

// 导出单例实例
export const messageService = new MessageServiceImpl();
