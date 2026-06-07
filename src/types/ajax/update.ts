// 上报用户版本请求
export interface IReportVersionReq {
  /**
   * @description: 设备ID
   */
  deviceId: string;
  /**
   * @description: 应用ID
   */
  appId: string;
  /**
   * @description: 平台ID：1=Windows, 2=MacOS, 3=iOS, 4=Android, 5=HarmonyOS
   */
  platformId: number;
  /**
   * @description: 架构ID：1=WinX64, 2=WinArm64, 3=MacIntel, 4=MacApple, 5=iOS, 6=Android, 7=HarmonyOS
   */
  archId: number;
  /**
   * @description: 版本号
   */
  version: string;
}

// 上报用户版本响应
export interface IReportVersionRes {
  /**
   * @description: 响应消息
   */
  message: string;
}

// 获取最新版本请求
export interface IGetLatestVersionReq {
  /**
   * @description: 设备ID
   */
  deviceId: string;
  /**
   * @description: 应用ID
   */
  appId: string;
  /**
   * @description: 平台ID：1=Windows, 2=MacOS, 3=iOS, 4=Android, 5=HarmonyOS
   */
  platformId: number;
  /**
   * @description: 架构ID：1=WinX64, 2=WinArm64, 3=MacIntel, 4=MacApple, 5=iOS, 6=Android, 7=HarmonyOS
   */
  archId: number;
  /**
   * @description: 当前版本号
   */
  version: string;
}

// 获取最新版本响应
export interface IGetLatestVersionRes {
  /**
   * @description: 是否有更新
   */
  hasUpdate: boolean;
  /**
   * @description: 最新版本号
   */
  version?: string;
  /**
   * @description: 安装包完整 URL
   */
  fileUrl: string;
  /**
   * @description: 安装包大小
   */
  size?: number;
  /**
   * @description: MD5校验
   */
  md5?: string;
  /**
   * @description: 更新日志
   */
  releaseNotes?: string;
  /**
   * @description: 是否强制更新
   */
  forceUpdate?: boolean;
} 