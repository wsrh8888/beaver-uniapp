/**
 * 通用下载工具模块 - 只提供基础下载功能
 */

import { previewOnlineFileApi } from '@/api/file';
import { getPlatform } from '../common';



/**
 * 下载文件到本地（基础功能）
 */
export async function downloadFile(fileKey: string): Promise<string> {
  const platform = getPlatform();
  
  // H5环境：直接返回URL
  if (platform === 'h5') {
    return previewOnlineFileApi(fileKey);
  }
  
  // APP环境：下载到本地
  try {
    const url = previewOnlineFileApi(fileKey);
    console.log('准备下载文件:', fileKey);
    console.log('下载URL:', url);
    
    // #ifdef APP-PLUS
    // 下载文件
    const result = await new Promise<{ tempFilePath: string }>((resolve, reject) => {
      console.log('开始下载文件...');
      uni.downloadFile({
        url,
        success: (res) => {
          console.log('下载成功，状态码:', res.statusCode);
          console.log('临时文件路径:', res.tempFilePath);
          if (res.statusCode === 200) {
            resolve({ tempFilePath: res.tempFilePath });
          } else {
            console.error('下载失败，状态码:', res.statusCode);
            reject(new Error(`下载失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('下载失败，错误信息:', err);
          reject(err);
        }
      });
    });
    
    console.log('下载完成:', fileKey, '->', result.tempFilePath);
    return result.tempFilePath;
    // #endif
    
    // #ifdef H5
    return url;
    // #endif
  } catch (error) {
    console.error('下载文件失败:', error);
    return previewOnlineFileApi(fileKey);
  }
} 