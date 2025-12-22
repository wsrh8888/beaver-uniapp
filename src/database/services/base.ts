/**
 * @description: 数据库服务基类
 */

import dbManager from '../db';
import Logger from '@/logger/logger';

const logger = new Logger('BaseService');

export class BaseService {
  protected db = dbManager;
  protected logger = logger;

  protected async ensureInitialized(): Promise<void> {
    if (!this.db.isAvailable()) {
      await this.db.init();
    }
  }

  protected async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();
    return await this.db.query(sql, params);
  }

  protected async executeSql(sql: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();
    return await this.db.executeSql(sql, params);
  }
}