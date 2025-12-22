/**
 * 图片缓存模块类型声明
 */

export declare function getCachedImage(fileKey: string): Promise<string>;
export declare function preloadImages(fileNames: string[]): Promise<void>;
export declare function clearCache(): Promise<void>;
export declare function isCached(fileKey: string): boolean; 