<template>
  <beaver-layout 
    :show-header="true"
    :title="'发布朋友圈'"
    :show-back="true"
    :show-background="true"
    :background-type="'gradient'"
    :background-height="120"
  >
    <!-- 自定义header右侧按钮 -->
    <template #right>
      <view class="header-post-btn" :class="{ disabled: !canPost }" @click="handlePost">
        <text>发布</text>
      </view>
    </template>
    
    <!-- 主要内容区域 -->
    <view class="post-content">
      <!-- 文本输入区域 -->
      <view class="input-section">
        <textarea 
          class="post-textarea" 
          placeholder="分享此刻的想法..." 
          v-model="content"
          @input="handleInput"
          :maxlength="1000"
          :auto-height="true"
        ></textarea>
        
        <!-- 字数计数器 -->
        <view class="counter">{{ content.length }}/1000</view>
      </view>
      
      <!-- 图片上传区域 -->
      <view class="media-section">
        <view class="media-container">
          <view 
            v-for="(item, index) in mediaList" 
            :key="index"
            class="media-item"
            @click="previewImage(item)"
          >
            <beaver-image :file-name="item" mode="aspectFill"></beaver-image>
            <view class="media-remove" @click.stop="removeMedia(index)">×</view>
          </view>
          <view 
            v-if="mediaList.length < 9"
            class="media-item add-media"
            @click="chooseImage"
          >
            <image src="@/static/img/postMoment/add-media.svg" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>


    

  </beaver-layout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { createMomentApi } from '@/api/moment';
import type { ICreateMomentReq } from '@/types/ajax/moment';
import { openAlbum, CompressMode } from '@/utils/upload/upload';
import Logger from '@/logger/logger';
import BeaverImage from '@/component/image/image.vue';
import BeaverLayout from '@/component/layout/layout.vue';

export default {
  components: {
    BeaverImage,
    BeaverLayout
  },
  setup() {
    const content = ref('');
    const mediaList = ref<string[]>([]);

    const canPost = computed(() => {
      return content.value.trim() !== '' || mediaList.value.length > 0;
    });

    const handleInput = () => {
      // 自动扩展文本框高度
      const query = uni.createSelectorQuery();
      query.select('.post-textarea').boundingClientRect();
      query.exec((res) => {
        if (res[0] && res[0].node && res[0].node.style) {
          const height = res[0].height;
          if (height < 120) {
            res[0].node.style.height = '120rpx';
          }
        }
      });
    };

    const handleCancel = () => {
      if (content.value.trim() !== '' || mediaList.value.length > 0) {
        uni.showModal({
          title: '提示',
          content: '确定放弃编辑？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else {
        uni.navigateBack();
      }
    };

    const handlePost = async () => {
      if (!canPost.value) {
        uni.showToast({
          title: '请输入内容或添加图片',
          icon: 'none'
        });
        return;
      }

      try {
        const data: ICreateMomentReq = {
          content: content.value,
          files: mediaList.value.map((fileKey: string) => ({
            fileKey
          }))
        };

        const res = await createMomentApi(data);
        if (res.code === 0) {
          uni.showToast({
            title: '发布成功',
            icon: 'success'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        const logger = new Logger('发布朋友圈');
        logger.error({
          text: '发布朋友圈失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        console.error('Failed to post moment:', error);
        uni.showToast({
          title: '发布失败',
          icon: 'error'
        });
      }
    };

    const chooseImage = () => {
      // 朋友圈图片：2MB，中等质量
      const maxSize = 1 * 1024 * 1024; // 2MB
      openAlbum('album', 1, CompressMode.CUSTOM, maxSize).then((result: any) => {
        if (result && result.fileKey) {
          mediaList.value.push(result.fileKey);
        }
      });
    };

    const removeMedia = (index: number) => {
      mediaList.value.splice(index, 1);
    };

    const previewImage = (fileKey: string) => {
      uni.previewImage({
        urls: mediaList.value.map((id: string) => id),
        current: fileKey
      });
    };



    return {
      content,
      mediaList,
      canPost,
      handleInput,
      handleCancel,
      handlePost,
      chooseImage,
      removeMedia,
      previewImage
    };
  }
};
</script>

<style lang="scss" scoped>
/* Header发布按钮 */
.header-post-btn {
  background: #FF7D45;
  color: white;
  border: none;
  border-radius: 16rpx;
  padding: 6rpx 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  
  &.disabled {
    opacity: 0.5;
    background: #CCCCCC;
  }
  
  &:active {
    opacity: 0.8;
  }
}

.post-content {
  padding: 24rpx;
  background: #FFFFFF;
}

/* 输入区域 */
.input-section {
  margin-bottom: 32rpx;
}

.post-textarea {
  width: 100%;
  border: none;
  font-size: 32rpx;
  line-height: 1.5;
  color: #333333;
  min-height: 200rpx;
  padding: 0;
  background: transparent;
  font-family: "PingFang SC", "微软雅黑", "SF Pro", "Roboto", sans-serif;
  resize: none;
}

.post-textarea::placeholder {
  color: #999999;
  font-weight: 400;
}

.counter {
  text-align: right;
  color: #999999;
  margin-top: 12rpx;
  font-size: 24rpx;
  font-weight: 400;
}

/* 媒体区域 */
.media-section {
  margin-bottom: 32rpx;
}

.media-container {
  display: flex;
  flex-wrap: wrap;
  margin: -6rpx;
}

.media-item {
  position: relative;
  width: calc(33.333% - 12rpx);
  height: calc(33.333vw - 24rpx);
  background-color: #F5F5F5;
  border-radius: 8rpx;
  overflow: hidden;
  margin: 6rpx;
  
  &:active {
    opacity: 0.8;
  }
}

.media-item image,
.media-item .beaver-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-remove {
  position: absolute;
  top: 6rpx;
  right: 6rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18rpx;
  font-weight: 500;
  z-index: 2;
  
  &:active {
    background: rgba(0, 0, 0, 0.8);
  }
}

.add-media {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1rpx dashed #CCCCCC;
  background: #F9F9F9;
  
  &:active {
    background: #F0F0F0;
  }
  
  image {
    width: 48rpx;
    height: 48rpx;
    opacity: 0.5;
  }
}

.location-modal,
.visibility-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 150;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #EBEEF5;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  padding: 0;
}

.modal-close image {
  width: 32rpx;
  height: 32rpx;
}

.location-search {
  padding: 24rpx 32rpx;
  position: relative;
}

.search-input {
  width: 100%;
  height: 72rpx;
  border: 2rpx solid #EBEEF5;
  border-radius: 36rpx;
  background: #F9FAFB;
  padding: 0 72rpx 0 24rpx;
  font-size: 28rpx;
}

.search-icon {
  position: absolute;
  right: 56rpx;
  top: 50%;
  transform: translateY(-50%);
}

.search-icon image {
  width: 32rpx;
  height: 32rpx;
}

.location-list {
  flex: 1;
  overflow-y: auto;
}

.location-item {
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #EBEEF5;
}

.location-name {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.location-address {
  font-size: 24rpx;
  color: #B2BEC3;
}

.visibility-list {
  margin-top: 24rpx;
}

.visibility-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 2rpx solid #EBEEF5;
}

.visibility-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 24rpx;
}

.visibility-icon image {
  width: 32rpx;
  height: 32rpx;
}

.visibility-text {
  flex: 1;
}

.visibility-title {
  font-size: 28rpx;
  margin-bottom: 4rpx;
}

.visibility-desc {
  font-size: 24rpx;
  color: #B2BEC3;
}

.visibility-check {
  color: #FF7D45;
}

.visibility-check image {
  width: 32rpx;
  height: 32rpx;
}

.visibility-item.active .visibility-check {
  display: block;
}
</style>
