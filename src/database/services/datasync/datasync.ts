/**
 * @description: 数据同步状态服务
 */

import { DATASYNC_FIELDS } from '../../tables/datasync/datasync';
import type { DatasyncTable } from '@/types/database';

/**
 * @description: 获取同步状态
 */
export const getSyncStatus = (db: any, module: string): Promise<DatasyncTable | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(DATASYNC_FIELDS).join(', ')}
      FROM datasync
      WHERE ${DATASYNC_FIELDS.MODULE} = ?
    `;

    db.get(sql, [module], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * @description: 更新或插入同步状态
 */
export const upsertSyncStatus = (db: any, module: string, version: number, updatedAt: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO datasync (
        ${DATASYNC_FIELDS.MODULE},
        ${DATASYNC_FIELDS.VERSION},
        ${DATASYNC_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?)
    `;

    db.run(sql, [module, version, updatedAt], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * @description: 获取所有同步状态
 */
export const getAllSyncStatus = (db: any): Promise<DatasyncTable[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(DATASYNC_FIELDS).join(', ')}
      FROM datasync
      ORDER BY ${DATASYNC_FIELDS.UPDATED_AT} DESC
    `;

    db.all(sql, [], (err: any, rows: DatasyncTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 删除同步状态
 */
export const deleteSyncStatus = (db: any, module: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM datasync WHERE ${DATASYNC_FIELDS.MODULE} = ?`;

    db.run(sql, [module], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * @description: 清空所有同步状态
 */
export const clearAllSyncStatus = (db: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM datasync`;

    db.run(sql, [], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
