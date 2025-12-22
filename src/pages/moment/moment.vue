<template>
  <beaver-layout 
    :show-header="true"
    :title="'朋友圈'"
    :show-back="false"
    :show-background="true"
    :background-type="'gradient'"
    :background-height="120"
  >
    <!-- 朋友圈内容列表 -->
    <view class="moment-list">
      <view class="moment-item" v-for="(item, index) in momentStore.momentList" :key="index">
        <!-- 用户信息 -->
        <view class="moment-header">
          <view class="user-avatar">
            <beaver-image class="user-avatar-img" :file-name="item.fileKey" mode="aspectFill"></beaver-image>
          </view>
          <view class="user-info">
            <view class="user-name">{{ item.userName }}</view>
            <view class="post-time">{{ formatTime(item.createdAt) }}</view>
          </view>
        </view>
        
        <!-- 文字内容 -->
        <view class="moment-content" v-if="item.content">{{ item.content }}</view>
        
        <!-- 图片网格 - 最多9张，每行3个 -->
        <view class="moment-images" v-if="item.files && item.files.length > 0">
          <view 
            v-for="(file, imgIndex) in item.files.slice(0, 9)" 
            :key="imgIndex"
            class="image-item"
            @click="previewImage(item.files, imgIndex)"
          >
            <beaver-image class="image-item-img" :file-name="file.fileKey" mode="aspectFill"></beaver-image>
            <!-- 超过9张图片时显示更多提示 -->
            <view class="image-overlay" v-if="item.files.length > 9 && imgIndex === 8">
              <text class="more-count">+{{ item.files.length - 9 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 点赞按钮 -->
        <view class="moment-actions">
          <view class="action-btn" :class="{ active: isUserLiked(item) }" @click="toggleLike(item)">
            <image :src="getLikeIconSrc(item)" class="action-icon"></image>
            <text class="action-text">{{ (item.likes && item.likes.length) || 0 }}</text>
          </view>
        </view>
        
        <!-- 点赞展示 -->
        <view class="moment-engagement" v-if="(item.likes && item.likes.length) > 0">
          <view class="likes-display">
            <image src="@/static/img/moment/like.svg" class="like-icon"></image>
            <text class="like-text">
              <text v-for="(like, likeIndex) in item.likes" :key="likeIndex" class="like-name">
                {{ like.userName }}
                <text v-if="likeIndex < item.likes.length - 1">、</text>
              </text>
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="post-button" @click="goToPost">
      <image src="@/static/img/moment/add.svg" class="icon"></image>
    </view>


  </beaver-layout>
</template>

<script lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useMomentStore } from '@/pinia/moment/moment';
import { useUserStore } from '@/pinia/user/user';
import { likeMomentApi } from '@/api/moment';
import { formatTime } from '@/utils/time/time';
import Logger from '@/logger/logger';
import { showToast } from '@/component/toast';
import BeaverImage from '@/component/image/image.vue';
import BeaverLayout from '@/component/layout/layout.vue';
import { previewOnlineFileApi } from '@/api/file';

export default {
  components: {
    BeaverImage,
    BeaverLayout
  },
  setup() {
    const logger = new Logger('朋友圈页面');

    const momentStore = useMomentStore();
    const userStore = useUserStore();

    const isUserLiked = (item: any) => {
      const currentUserId = userStore.getUserId;
      return item.likes && item.likes.some((like: any) => like.userId === currentUserId);
    };

    const getLikeIconSrc = (item: any) => {
      return isUserLiked(item) ? '/static/img/moment/like.svg' : '/static/img/moment/like-unliked.svg';
    };

    const toggleLike = async (item: any) => {
      // 检查当前用户是否已经点赞
      const currentUserId = userStore.getUserId;
      const hasLiked = isUserLiked(item);
      
      try {
        const res = await likeMomentApi({ momentId: item.id, status: !hasLiked });
        if (res.code === 0) {
          if (!hasLiked) {
            // 添加点赞
            if (!item.likes) item.likes = [];
            item.likes.push({ userId: currentUserId, userName: userStore.userInfo.nickName });
          } else {
            // 取消点赞
            const index = item.likes.findIndex((like: any) => like.userId === currentUserId);
            if (index !== -1) {
              item.likes.splice(index, 1);
            }
          }
        }
      } catch (error) {
        logger.error({
          text: '点赞操作失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            momentId: item.id,
            action: hasLiked ? 'unlike' : 'like'
          }
        });
        console.error('Failed to toggle like:', error);
      }
    };



    const goToPost = () => {
      uni.navigateTo({
        url: '/pages/postMoment/postMoment'
      });
    };

    const previewImage = (files: any[], current: number) => {
      uni.previewImage({
        urls: files.map(file => previewOnlineFileApi(file.fileKey)),
        current: files[current].url
      });
    };

    // 页面加载时初始化朋友圈数据
    momentStore.initMomentApi();
    
    // 每次进入页面时重新获取朋友圈数据
    onShow(() => {
      momentStore.initMomentApi();
    });

    return {
      momentStore,
      userStore,
      isUserLiked,
      getLikeIconSrc,
      toggleLike,
      goToPost,
      previewImage,
      formatTime,
    };
  }
}
</script>

<style lang="scss" scoped>
/* 朋友圈列表 */
.moment-list {
  padding: 16rpx;
  background: #F9FAFB;
  min-height: 100vh;
}

.moment-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #EBEEF5;
}

/* 用户信息区域 */
.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 16rpx;
  border: 1rpx solid #EBEEF5;
  .user-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 4rpx;
}

.post-time {
  font-size: 22rpx;
  color: #B2BEC3;
}

/* 文字内容 */
.moment-content {
  font-size: 28rpx;
  line-height: 1.5;
  color: #2D3436;
  margin-bottom: 20rpx;
  word-break: break-all;
}

/* 图片网格 - 最多9张，每行3个 */
.moment-images {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -4rpx 20rpx -4rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.image-item {
  width: calc(33.333% - 8rpx);
  height: 0;
  padding-bottom: calc(33.333% - 8rpx);
  background: #F8F9FA;
  overflow: hidden;
  border-radius: 8rpx;
  position: relative;
  transition: transform 0.2s ease;
  margin: 4rpx;
  .image-item-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.image-item:active {
  transform: scale(0.98);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-count {
  color: white;
  font-size: 28rpx;
  font-weight: 600;
}

/* 互动按钮 */
.moment-actions {
  display: flex;
  gap: 32rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #EBEEF5;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 16rpx;
  border-radius: 20rpx;
  transition: all 0.2s ease;
  background: #F8F9FA;
}

.action-btn:active {
  background: #E9ECEF;
  transform: scale(0.95);
}

.action-btn.active {
  background: #FFE6D9;
  color: #FF4757;
}

.action-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.7;
}

.action-text {
  font-size: 24rpx;
  color: #636E72;
  font-weight: 500;
}

.action-btn.active .action-text {
  color: #FF4757;
}

/* 互动展示区域 */
.moment-engagement {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #EBEEF5;
}

.likes-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
  padding: 12rpx 16rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
}

.like-icon {
  width: 20rpx;
  height: 20rpx;
  opacity: 0.7;
}

.like-text {
  font-size: 24rpx;
  color: #636E72;
}

.like-name {
  color: #FF7D45;
  font-weight: 500;
}



/* 发布按钮 */
.post-button {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255, 125, 69, 0.3);
  z-index: 100;
  transition: all 0.2s ease;
}

.post-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(255, 125, 69, 0.2);
}

.post-button .icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) invert(1);
}


</style>
