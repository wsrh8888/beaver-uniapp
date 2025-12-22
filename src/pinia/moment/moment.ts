import { defineStore } from 'pinia';
import { getMomentInfoApi, getMomentsListApi } from '@/api/moment';
import type { IMomentModel } from '@/types/store/moment';
import { preloadFiles } from '@/cache/file';
import Logger from '@/logger/logger';

/**
 * @description: 朋友圈管理
 */
export const useMomentStore = defineStore('momentStore', {
  state: (): {
    momentList: IMomentModel[],
    momentMapInfo: Map<string, IMomentModel>,
  } => ({
    /**
     * @description: 动态列表
     */
    momentList: [],
    /**
     * @description: 动态信息映射
     */
    momentMapInfo: new Map<string, IMomentModel>(),
  }),
  getters: {
    /**
     * @description: 根据ID获取动态信息
     * @param {string} id - 动态id
     * @returns {IMomentModel} 返回动态信息
     */
    getMomentInfoById: (state) => {
      return (id: string): IMomentModel | undefined => {
        return state.momentMapInfo.get(id);
      };
    },
  },
  actions: {
    reset() {
      this.momentList = [];
      this.momentMapInfo.clear();
    },

    async updateMomentInfo(momentId: string) {
      const logger = new Logger('朋友圈管理');
      try {
        const res = await getMomentInfoApi({ momentId });
        if (res.code === 0) {
          const momentInfo = res.result.moment;
          const index = this.momentList.findIndex(
            item => item.id.toString() === momentId
          );
          
          if (index !== -1) {
            this.momentList[index] = momentInfo;
          } else {
            this.momentList.push(momentInfo);
          }
          
          // 更新动态信息映射
          this.momentMapInfo.set(momentId, momentInfo);
          return momentInfo;
        }
      } catch (error) {
        logger.error({
          text: '更新朋友圈信息失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            momentId
          }
        });
        console.error('Failed to update moment info:', error);
        throw error;
      }
    },

    /**
     * @description: 预加载朋友圈图片
     */
    async preloadMomentImages() {
      const logger = new Logger('朋友圈管理');
      try {
        const fileNames = this.momentList
          .filter(moment => moment.fileKey)
          .map(moment => moment.fileKey!);
        
        if (fileNames.length > 0) {
          console.log('预加载朋友圈图片:', fileNames.length, '张');
          await preloadFiles(fileNames);
        }
      } catch (error) {
        logger.error({
          text: '预加载朋友圈图片失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            count: this.momentList.length
          }
        });
        console.error('预加载朋友圈图片失败:', error);
      }
    },

    async initMomentApi() {
      const logger = new Logger('朋友圈管理');
      try {
        const res = await getMomentsListApi({
          page: 1,
          limit: 1000,
        });
        if (res.code === 0) {
          // 直接使用API返回的数据
          this.momentList = res.result.list || [];
          
          // 初始化动态信息映射
          this.momentList.forEach(moment => {
            this.momentMapInfo.set(moment.id.toString(), moment);
          });
          
          // 预加载朋友圈图片
          await this.preloadMomentImages();
        }
      } catch (error) {
        logger.error({
          text: '初始化朋友圈列表失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        console.error('Failed to initialize moment list:', error);
        throw error;
      }
    },
  },
});