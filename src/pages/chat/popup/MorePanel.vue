<template>
  <view class="option-popup">
    <view class="menu-grid">
      <view 
        v-for="(item, index) in menuItems" 
        :key="index"
        class="menu-item"
        @tap="handleAction(item.action)"
      >
        <view class="menu-icon">
          <image 
            :src="item.icon" 
            mode="aspectFit"
          />
        </view>
        <text class="menu-label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { openAlbum, CompressMode } from '@/utils/upload/upload';
import { usePageChatStore } from '@/pinia/page/pageChat/pageChat';
import { MessageType } from '@/types/store/message';
import Logger from '@/logger/logger';
import {optionList} from '../utils/message'
interface MenuItem {
  icon: string;
  label: string;
  action: string;
}

export default {
  props: {
    keyboardHeight: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const pageChatStore = usePageChatStore();
    const logger = new Logger('更多功能面板');

    const menuItems: MenuItem[] = optionList

    const handleAction = async (action: string) => {
      switch (action) {
        case 'album':
          try {
            // 聊天图片：1MB，中等质量
            const maxSize = 1 * 1024 * 1024; // 1MB
            const uploadResult = await openAlbum('album', 1, CompressMode.CUSTOM, maxSize) as any
            
            await pageChatStore.sendMessage({
              fileKey: uploadResult?.fileKey,
              originalName: uploadResult?.originalName,
              width: uploadResult?.fileInfo?.imageFile?.width,
              height: uploadResult?.fileInfo?.imageFile?.height
            }, MessageType.IMAGE);
          } catch (err) {
            logger.error({
              text: '上传图片失败',
              data: {
                error: err instanceof Error ? err.message : String(err)
              }
            });
            console.error('Failed to upload image:', err);
            uni.showToast({
              title: '上传图片失败',
              icon: 'none'
            });
          }
          break;
        case 'camera':
          try {
            // 拍照：1MB，中等质量
            const maxSize = 1 * 1024 * 1024; // 1MB
            const uploadResult = await openAlbum('camera', 1, CompressMode.CUSTOM, maxSize) as any;
            await pageChatStore.sendMessage({
              fileKey: uploadResult?.fileKey,
              originalName: uploadResult?.originalName || 'camera.jpg',
              width: uploadResult?.fileInfo?.imageFile?.width,
              height: uploadResult?.fileInfo?.imageFile?.height
            }, MessageType.IMAGE);
          } catch (err) {
            logger.error({
              text: '拍照失败',
              data: {
                error: err instanceof Error ? err.message : String(err)
              }
            });
            console.error('Failed to upload image:', err);
            uni.showToast({
              title: '上传图片失败',
              icon: 'none'
            });
          }
          break;
        case 'vedio':
          uni.showToast({
            title: '发起视频通话',
            icon: 'none'
          });
          break;
        case 'audio':
          uni.showToast({
            title: '发起语音通话',
            icon: 'none'
          });
          break;
      }
    };

    return {
      menuItems,
      handleAction
    };
  }
}
</script>

<style lang="scss" scoped>
.option-popup {
  background: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  padding: 32rpx 24rpx;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 4rpx;
  
  .menu-item {
    margin-right: 24rpx;
    margin-bottom: 24rpx;
    
    &:nth-child(4n) {
      margin-right: 0;
    }
  }
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .menu-icon {
    margin-bottom: 12rpx;
  }
}

.menu-icon {
  width: 100rpx;
  height: 100rpx;
  background: #F5F5F5;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:active {
    background: #EEEEEE;
    transform: scale(0.95);
  }
  
  image {
    width: 48rpx;
    height: 48rpx;
    opacity: 0.85;
  }
}

.menu-label {
  font-size: 24rpx;
  color: #666666;
}
</style>

