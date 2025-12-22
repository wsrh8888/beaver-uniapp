/**
 * 图片缓存模块
 */

import { previewOnlineFileApi } from '@/api/file';
import { getPlatform } from '@/utils/common';
import {  downloadFile } from '@/utils/download';

// 图片缓存映射 
const imageCache = new Map<string, string>();

// 文件获取Promise映射 - 防止重复下载/预加载
const filePromises = new Map<string, Promise<string>>();

/**
 * 获取图片（主要接口）
 */
export async function getImage(fileKey: string): Promise<string> {
  const platform = getPlatform();
  
  // 检查缓存
  if (imageCache.has(fileKey)) {
    const cachedPath = imageCache.get(fileKey)!;
    return cachedPath;
  }
  
  // 检查是否正在获取中
  if (filePromises.has(fileKey)) {
    console.log('图片正在获取中，等待完成:', fileKey);
    return await filePromises.get(fileKey)!;
  }
  
  // 创建获取Promise
  const getPromise = (async () => {
    try {
      if (platform === 'h5') {
        // H5环境：直接返回URL
        const url = previewOnlineFileApi(fileKey);
        imageCache.set(fileKey, url);
        return url;
      } else {
        // APP环境：下载到本地
        const localPath = await downloadFile(fileKey);
        imageCache.set(fileKey, localPath);
        return localPath;
      }
    } catch (error) {
      console.error('获取图片失败:', error);
      return previewOnlineFileApi(fileKey);
    }
  })();
  
  // 保存Promise
  filePromises.set(fileKey, getPromise);
  
  try {
    const result = await getPromise;
    return result;
  } finally {
    // 清理Promise
    filePromises.delete(fileKey);
  }
}

/**
 * 预加载图片（同步等待完成）
 */
export async function preloadImage(fileKey: string): Promise<void> {
  // 如果已经缓存，直接返回
  if (imageCache.has(fileKey)) {
    return;
  }
  
  // 如果正在获取中，等待完成
  if (filePromises.has(fileKey)) {
    await filePromises.get(fileKey)!;
    return;
  }
  
  const platform = getPlatform();
  
  if (platform === 'h5') {
    // H5环境：通过创建img元素预加载到浏览器缓存
    const imageUrl = previewOnlineFileApi(fileKey);
    await new Promise<void>((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        imageCache.set(fileKey, imageUrl); // 存储URL表示已缓存
        resolve();
      };
      img.onerror = () => {
        console.error('预加载图片失败:', fileKey);
        reject(new Error(`预加载图片失败: ${fileKey}`));
      };
      img.src = imageUrl;
    });
  } else {
    // APP环境：同步预加载，等待完成
    await getImage(fileKey);
  }
}

/**
 * 通过fileName读取本地图片文件
 */
export function getLocalImagePath(fileKey: string): string | null {
  const platform = getPlatform();
  
  // H5环境：没有本地文件
  if (platform === 'h5') {
    return null;
  }
  
  // APP环境：返回本地路径
  return imageCache.get(fileKey) || null;
}

/**
 * 检查图片是否已缓存到本地
 */
export function isImageCached(fileKey: string): boolean {
  const platform = getPlatform();
  
  // 检查缓存映射
  if (!imageCache.has(fileKey)) {
    return false;
  }
  
  // APP环境：需要检查本地文件是否存在
  if (platform !== 'h5') {
    try {
      // #ifdef APP-PLUS
      const filePath = imageCache.get(fileKey)!;
      // 这里可以添加文件存在性检查
      // 暂时返回true，实际使用时可以根据需要添加检查逻辑
      return true;
      // #endif
    } catch {
      imageCache.delete(fileKey);
      return false;
    }
  }
  
  // H5环境：只要在缓存中就认为已缓存
  return true;
}

/**
 * 清除指定文件的缓存
 */
export function clearImageCache(fileKey: string): void {
  imageCache.delete(fileKey);
}

/**
 * 清除所有图片缓存
 */
export function clearAllImageCache(): void {
  imageCache.clear();
}