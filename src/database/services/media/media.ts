/**
 * @description: 媒体服务
 */

import { MEDIA_FIELDS, MediaType } from '../../tables/media/media';
import type { MediaTable } from '@/types/database';

/**
 * @description: 根据文件key获取媒体信息
 */
export const getMediaByFileKey = (db: any, fileKey: string): Promise<MediaTable | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(MEDIA_FIELDS).join(', ')}
      FROM media
      WHERE ${MEDIA_FIELDS.FILE_KEY} = ? AND ${MEDIA_FIELDS.IS_DELETED} = 0
    `;

    db.get(sql, [fileKey], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * @description: 添加媒体记录
 */
export const addMedia = (db: any, media: Omit<MediaTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO media (
        ${MEDIA_FIELDS.FILE_KEY},
        ${MEDIA_FIELDS.PATH},
        ${MEDIA_FIELDS.TYPE},
        ${MEDIA_FIELDS.SIZE},
        ${MEDIA_FIELDS.CREATED_AT},
        ${MEDIA_FIELDS.UPDATED_AT},
        ${MEDIA_FIELDS.IS_DELETED}
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      media.file_key,
      media.path,
      media.type,
      media.size,
      now,
      now,
      media.is_deleted
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
 * @description: 删除媒体记录（软删除）
 */
export const deleteMedia = (db: any, fileKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      UPDATE media
      SET ${MEDIA_FIELDS.IS_DELETED} = 1, ${MEDIA_FIELDS.UPDATED_AT} = ?
      WHERE ${MEDIA_FIELDS.FILE_KEY} = ?
    `;

    db.run(sql, [now, fileKey], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * @description: 获取媒体列表
 */
export const getMediaList = (db: any, type?: MediaType, limit = 50): Promise<MediaTable[]> => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT ${Object.values(MEDIA_FIELDS).join(', ')}
      FROM media
      WHERE ${MEDIA_FIELDS.IS_DELETED} = 0
    `;
    const params: any[] = [];

    if (type) {
      sql += ` AND ${MEDIA_FIELDS.TYPE} = ?`;
      params.push(type);
    }

    sql += ` ORDER BY ${MEDIA_FIELDS.CREATED_AT} DESC LIMIT ?`;
    params.push(limit);

    db.all(sql, params, (err: any, rows: MediaTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};
