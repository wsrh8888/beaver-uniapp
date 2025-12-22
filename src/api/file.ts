import { request } from '@/utils/request/request'
import { baseUrl } from '@/env.json'
import { getLocal } from '@/utils/local';

/**
 * @description: 预览文件
 */
export const previewOnlineFileApi = (fileKey: string) => {
  return `${baseUrl}/api/file/preview/${fileKey}`
}



/**
 * @description: 上传文件到本地
 */
export const uploadToLocalApi = (filePath: string, fileKey?: string): Promise<{
  fileKey: string, 
  originalName: string,
  fileInfo?: {
    type: string,
    imageFile?: {
      width: number,
      height: number
    },
    videoFile?: {
      width: number,
      height: number,
      duration: number
    },
    audioFile?: {
      duration: number
    }
  }
}> => {
  return new Promise((resolve, reject) => {
    // 构建URL，如果有文件名则作为查询参数传递
    let uploadUrl = `${baseUrl}/api/file/uploadLocal`;
    if (fileKey) {
      uploadUrl += `?fileKey=${encodeURIComponent(fileKey)}`;
    }
    
    uni.uploadFile({
      url: uploadUrl, 
      filePath: filePath, 
      name: 'file',
      header: {
        token: getLocal('token')
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.result); 
        }
      },
      fail: (err) => {
        console.error('上传失败', err);
        reject(err);
      }
    });
  });
};


/**
 * @description: 上传文件到七牛云
 */
export const uploadQiniuApi = (filePath: string, fileKey?: string): Promise<{
  fileKey: string, 
  originalName: string,
  fileInfo?: {
    type: string,
    imageFile?: {
      width: number,
      height: number
    },
    videoFile?: {
      width: number,
      height: number,
      duration: number
    },
    audioFile?: {
      duration: number
    }
  }
}> => {
  return new Promise((resolve, reject) => {
    // 构建URL，如果有文件名则作为查询参数传递
    let uploadUrl = `${baseUrl}/api/file/uploadQiniu`;
    if (fileKey) {
      uploadUrl += `?fileKey=${encodeURIComponent(fileKey)}`;
    }
    
    uni.uploadFile({
      url: uploadUrl, 
      filePath: filePath, 
      name: 'file',
      header: {
        token: getLocal('token')
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 0) {
          resolve(data.result); 
        }
      },
      fail: (err) => {
        console.error('上传失败', err);
        reject(err);
      }
    });
  });
};


// 
export const uploadFileApi = (filePath: string, fileKey?: string): Promise<any> => {
  //  if(source === 'local') {
  return uploadToLocalApi(filePath, fileKey);
  // } else if(source === 'qiniu') {
    // return uploadQiniuApi(filePath, fileKey);
  // }
  //  return Promise.reject(new Error('Invalid source'));
}