/**
 * 统一缓存管理器 - 简单路由
 */

import { getImage, clearAllImageCache } from './preload/images';
import { getAudio, clearAllAudioCache } from './preload/audios';
import { getVideo, clearAllVideoCache } from './preload/videos';

/**
 * 获取文件（根据文件扩展名自动判断类型）
 */
export async function getFile(fileKey: string): Promise<string> {
  const extension = fileKey.split('.').pop()?.toLowerCase();
  
  // 图片格式
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
    return getImage(fileKey);
  }
  
  // 音频格式
  if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
    return getAudio(fileKey);
  }
  
  // 视频格式
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
    return getVideo(fileKey);
  }
  
  // 默认作为图片处理
  return getImage(fileKey);
}

/**
 * 清除所有缓存
 * 包括图片、音频、视频的所有缓存
 */
export function clearAllCache(): void {
  console.log('开始清除所有缓存...');
  
  // 清除图片缓存
  clearAllImageCache();
  console.log('图片缓存已清除');
  
  // 清除音频缓存
  clearAllAudioCache();
  console.log('音频缓存已清除');
  
  // 清除视频缓存
  clearAllVideoCache();
  console.log('视频缓存已清除');
  
  console.log('所有缓存清除完成');
}

// 导出具体的缓存函数，以便需要时直接使用
export { 
  getImage, 
  getAudio, 
  getVideo,
  clearAllImageCache,
  clearAllAudioCache,
  clearAllVideoCache
}; 