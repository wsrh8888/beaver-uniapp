import { defineStore } from 'pinia';
import { getLatestVersionApi } from '@/api/update';
import { previewOnlineFileApi } from '@/api/file';
import type { IGetLatestVersionRes } from '@/types/ajax/update';

/**
 * @description: 升级状态管理
 */
export const useUpdateStore = defineStore('useUpdateStore', {
  /**
   * @description: 升级状态
   */
  state: (): {
    /** 最新版本信息 */
    latestVersion: IGetLatestVersionRes | null;
    /** 是否正在检查更新 */
    isChecking: boolean;
    /** 是否正在下载 */
    isDownloading: boolean;
    /** 下载进度 */
    downloadProgress: number;
    /** 最后检查时间 */
    lastCheckTime: number;
  } => ({
    latestVersion: null,
    isChecking: false,
    isDownloading: false,
    downloadProgress: 0,
    lastCheckTime: 0,
  }),

  /**
   * @description: 状态计算属性
   */
  getters: {
    /**
     * @description: 是否有可用更新
     */
    hasUpdate(): boolean {
      return this.latestVersion?.hasUpdate || false;
    },

    /**
     * @description: 是否强制更新
     */
    isForceUpdate(): boolean {
      return this.latestVersion?.forceUpdate || false;
    },

    /**
     * @description: 格式化文件大小
     */
    formattedSize(): string {
      if (!this.latestVersion?.size) return '';
      
      const size = this.latestVersion.size;
      if (size < 1024) {
        return size + ' B';
      } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(1) + ' KB';
      } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(1) + ' MB';
      } else {
        return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
      }
    },
  },

  actions: {
    /**
     * @description: 检查更新
     * @return {Promise<boolean>} 是否有更新
     */
    async checkUpdate(): Promise<boolean> {
      if (this.isChecking) {
        return this.hasUpdate;
      }

      this.isChecking = true;
      
      try {
        // 获取最新版本信息
        const res = await getLatestVersionApi();
        if (res.code === 0 && res.result) {
          this.latestVersion = res.result;
          this.lastCheckTime = Date.now();
          return res.result.hasUpdate;
        }
        return false;
      } catch (error) {
        console.error('检查更新失败:', error);
        return false;
      } finally {
        this.isChecking = false;
      }
    },

    /**
     * @description: 下载更新
     * @return {Promise<boolean>} 下载是否成功
     */
    async downloadUpdate(): Promise<boolean> {
      if (!this.latestVersion?.fileKey || this.isDownloading) {
        return false;
      }

      this.isDownloading = true;
      this.downloadProgress = 0;

      // 通过 fileKey 构建下载链接
      const downloadUrl = previewOnlineFileApi(this.latestVersion.fileKey);

      return new Promise((resolve) => {
        // #ifdef APP-PLUS
        const downloadTask = uni.downloadFile({
          url: downloadUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              // 下载成功，安装应用
              this.installUpdate(res.tempFilePath);
              resolve(true);
            } else {
              resolve(false);
            }
          },
          fail: () => {
            resolve(false);
          }
        });

        downloadTask.onProgressUpdate((res) => {
          this.downloadProgress = res.progress;
        });
        // #endif

        // #ifdef H5
        // H5环境直接跳转到下载链接
        window.open(downloadUrl, '_blank');
        resolve(true);
        // #endif

        // #ifdef MP
        // 小程序环境提示用户
        uni.showModal({
          title: '更新提示',
          content: '请前往应用商店下载最新版本',
          showCancel: false
        });
        resolve(false);
        // #endif
      });
    },

    /**
     * @description: 安装更新（仅APP环境）
     * @param {string} filePath 安装包路径
     */
    installUpdate(filePath: string) {
      // #ifdef APP-PLUS
      plus.runtime.install(filePath, {
        force: false
      }, () => {
        uni.showModal({
          title: '安装完成',
          content: '应用已更新，需要重启应用',
          showCancel: false,
          success: () => {
            plus.runtime.restart();
          }
        });
      }, (error) => {
        console.error('安装失败:', error);
        uni.showToast({
          title: '安装失败',
          icon: 'none'
        });
      });
      // #endif
    },

    /**
     * @description: 重置升级状态
     */
    reset() {
      this.latestVersion = null;
      this.isChecking = false;
      this.isDownloading = false;
      this.downloadProgress = 0;
      this.lastCheckTime = 0;
    },
  },
}); 