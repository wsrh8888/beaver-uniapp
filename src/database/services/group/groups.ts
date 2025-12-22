/**
 * @description: 群组服务
 */

import { GROUPS_FIELDS } from '../../tables/group/groups';
import type { GroupTable } from '@/types/database';

/**
 * @description: 获取群组列表
 */
export const getGroups = (db: any): Promise<GroupTable[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(GROUPS_FIELDS).join(', ')}
      FROM groups
      WHERE ${GROUPS_FIELDS.STATUS} = 1
      ORDER BY ${GROUPS_FIELDS.CREATED_AT} DESC
    `;

    db.all(sql, [], (err: any, rows: GroupTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 根据ID获取群组
 */
export const getGroupById = (db: any, groupId: string): Promise<GroupTable | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(GROUPS_FIELDS).join(', ')}
      FROM groups
      WHERE ${GROUPS_FIELDS.GROUP_ID} = ?
    `;

    db.get(sql, [groupId], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * @description: 添加群组
 */
export const addGroup = (db: any, group: Omit<GroupTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO groups (
        ${GROUPS_FIELDS.GROUP_ID},
        ${GROUPS_FIELDS.TYPE},
        ${GROUPS_FIELDS.TITLE},
        ${GROUPS_FIELDS.AVATAR},
        ${GROUPS_FIELDS.CREATOR_ID},
        ${GROUPS_FIELDS.NOTICE},
        ${GROUPS_FIELDS.JOIN_TYPE},
        ${GROUPS_FIELDS.STATUS},
        ${GROUPS_FIELDS.VERSION},
        ${GROUPS_FIELDS.CREATED_AT},
        ${GROUPS_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      group.group_id,
      group.type,
      group.title,
      group.avatar,
      group.creator_id,
      group.notice,
      group.join_type,
      group.status,
      group.version,
      now,
      now
    ], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * @description: 更新群组
 */
export const updateGroup = (db: any, groupId: string, updates: Partial<Omit<GroupTable, 'id' | 'created_at'>>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      resolve();
      return;
    }

    fields.push(`${GROUPS_FIELDS.UPDATED_AT} = ?`);
    values.push(now);

    const sql = `
      UPDATE groups
      SET ${fields.join(', ')}
      WHERE ${GROUPS_FIELDS.GROUP_ID} = ?
    `;
    values.push(groupId);

    db.run(sql, values, function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
