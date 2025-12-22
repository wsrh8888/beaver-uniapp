import { defineStore } from 'pinia';
import type { IUserInfoRes, IUpdateInfoReq } from '@/types/ajax/user';
import { userInfoApi, updateInfoApi } from '@/api/user';
import { preloadFile } from '@/cache/file';
import Logger from '@/logger/logger';
const logger = new Logger('用户状态管理');

/**
 * @description: 用户状态管理
 */
export const useUserStore = defineStore('useUserStore', {
  /**
   * @description: 用户状态
   */
  state: (): {
    /** 当前登录用户信息 */
    userInfo: IUserInfoRes;
  } => ({
    userInfo: {
      userId: '',
      nickName: '',
      fileKey: '',
      abstract: '',
      gender: 0,
    }
  }),

  /**
   * @description: 状态计算属性
   */
  getters: {
  },

  actions: {
    /**
     * @description: 预加载用户头像
     */
    async preloadUserAvatar() {
      const logger = new Logger('用户状态管理');
      try {
        if (this.userInfo.fileKey) {
          console.log('预加载用户头像:', this.userInfo.fileKey);
          await preloadFile(this.userInfo.fileKey);
        }
      } catch (error) {
        logger.error({
          text: '预加载用户头像失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            fileKey: this.userInfo.fileKey
          }
        });
        console.error('预加载用户头像失败:', error);
      }
    },

    /**
     * @description: 初始化用户信息
     * @return {Promise<void>}
     * @throws {Error} 获取用户信息失败时抛出错误
     */
    async initUserInfoApi() {
      const logger = new Logger('用户状态管理');
      try {
        const res = await userInfoApi({});
        if (res.code === 0 && res.result) {
          this.userInfo = res.result;

          // 预加载用户头像
          await this.preloadUserAvatar();
        }
      } catch (error) {
        logger.error({
          text: '获取用户信息失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        console.error('获取用户信息失败:', error);
        throw error;
      }
    },



    /**
     * @description: 更新自己的个人信息
     * @param {Partial<IUpdateInfoReq>} updates - 需要更新的用户信息字段
     * @param {boolean} isUpdateApi - 是否调用接口更新
     * @return {Promise<boolean>} 更新是否成功
     */
    async updateUserInfo(updates: Partial<IUpdateInfoReq>, isUpdateApi: boolean = true) {
      if (isUpdateApi) {
        try {
          const res = await updateInfoApi(updates);
          if (res.code === 0) {
            // 直接合并更新，保持类型安全
            this.userInfo = { ...this.userInfo, ...updates };
            return true;
          }
          return false;
        } catch (error) {
          logger.error({
            text: '更新用户信息失败',
            data: {
              error: error instanceof Error ? error.message : String(error),
              updates
            }
          });
          console.error('更新用户信息失败:', error);
          return false;
        }
      } else {
        this.userInfo = { ...this.userInfo, ...updates };
      }
    },

    /**
     * @description: 重置用户状态
     * @return {void}
     */
    reset() {
      this.userInfo = {
        userId: '',
        nickName: '',
        fileKey: '',
        abstract: '',
        gender: 0,
      }
    },
  },
});
