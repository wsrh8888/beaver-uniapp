// 文件上传请求类型
export interface IFileUploadReq {
  /**
   * @description: 文件路径
   */
  filePath: string;
  /**
   * @description: 文件名，可选
   */
  fileKey?: string;
}

// 文件上传响应类型
export interface IFileUploadRes {
  /**
   * @description: 文件ID
   */
  fileKey: string;
  /**
   * @description: 文件名
   */
  name: string;
}

// 文件预览请求类型
export interface IFilePreviewReq {
  /**
   * @description: 文件ID
   */
  fileKey: string;
}

// 文件预览响应类型
export interface IFilePreviewRes {
  /**
   * @description: 文件URL
   */
  url: string;
} 