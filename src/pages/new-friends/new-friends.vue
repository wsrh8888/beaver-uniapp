<template>
  <BeaverLayout
    title="新的朋友"
    :show-back="true"
    :scrollable="true"
    :scroll-y="true"
    :show-scrollbar="false"
    @back="goBack"
  >
    <!-- 分类标签 -->
    <view class="tabs-section">
      <view class="tabs-container">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'received' }"
          @click="switchTab('received')"
        >
          <text class="tab-text">收到的申请</text>
          <view class="tab-badge" v-if="receivedCount > 0">{{ receivedCount }}</view>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'sent' }"
          @click="switchTab('sent')"
        >
          <text class="tab-text">发出的申请</text>
        </view>
      </view>
    </view>

    <!-- 好友申请列表 -->
    <view class="requests-list" v-if="filteredRequests.length > 0">
      <view 
        class="request-item" 
        v-for="(item, index) in filteredRequests" 
        :key="'request-' + index"
        :class="{ 'fade-in': true }"
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <view class="request-avatar">
          <BeaverImage :fileKey="item.fileKey" mode="aspectFill" />
        </view>
        <view class="request-content">
          <view class="request-header">
            <view class="request-name" :title="item.nickName">{{ item.nickName }}</view>
            <view class="request-source" v-if="item.source">{{ getSourceText(item.source) }}</view>
          </view>
          <view class="request-message" :title="item.message || '请求加为好友'">{{ item.message || '请求加为好友' }}</view>
          <view class="request-meta">{{ item.createdAt }}</view>
        </view>
        <view class="request-actions">
          <template v-if="item.flag === 'receive'">
            <template v-if="item.status === 0">
              <view class="btn btn-accept" @click="acceptRequest(item.id)">
                <text class="btn-text">接受</text>
              </view>
              <view class="btn btn-reject" @click="rejectRequest(item.id)">
                <text class="btn-text">拒绝</text>
              </view>
            </template>
            <view v-else-if="item.status === 1" class="status-badge success">
              <image src="@/static/img/new-friend/check-circle.svg" mode="aspectFit"></image>
              <text class="status-text">已添加</text>
            </view>
            <view v-else-if="item.status === 2" class="status-badge rejected">
              <image src="@/static/img/new-friend/close-circle.svg" mode="aspectFit"></image>
              <text class="status-text">已拒绝</text>
            </view>
          </template>
          <template v-else-if="item.flag === 'send'">
            <view v-if="item.status === 0" class="status-badge pending">
              <image src="@/static/img/new-friend/clock.svg" mode="aspectFit"></image>
              <text class="status-text">等待验证</text>
            </view>
            <view v-else-if="item.status === 1" class="status-badge success">
              <image src="@/static/img/new-friend/check-circle.svg" mode="aspectFit"></image>
              <text class="status-text">已添加</text>
            </view>
            <view v-else-if="item.status === 2" class="status-badge rejected">
              <image src="@/static/img/new-friend/close-circle.svg" mode="aspectFit"></image>
              <text class="status-text">已拒绝</text>
            </view>
          </template>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <view class="empty-illustration">
        <image src="@/static/img/new-friend/empty-friends.svg" mode="aspectFit"></image>
      </view>
      <view class="empty-content">
        <text class="empty-title">暂无{{ activeTab === 'received' ? '收到' : '发出' }}的好友申请</text>
        <text class="empty-subtitle">
          {{ activeTab === 'received' ? '当有人申请加你为好友时，会在这里显示' : '你发出的好友申请会在这里显示状态' }}
        </text>
      </view>
    </view>

    <!-- 提示框 -->
  </BeaverLayout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { getFriendValidListApi } from '@/api/apply';
import { userValidStatusApi } from '@/api/friend';
import { previewOnlineFileApi } from '@/api/file';
import type { IValidInfo } from '@/types/ajax/friend';
import BeaverLayout from '@/component/layout/layout.vue';
import BeaverImage from '@/component/image/image.vue';
import { showToast } from '@/component/toast';

export default {
  components: {
    BeaverLayout,
    BeaverImage
  },
  setup() {
    // 响应式数据
    const allRequests = ref<IValidInfo[]>([]);
    const searchKeyword = ref('');
    const activeTab = ref('received');

    // 计算属性
    const filteredRequests = computed(() => {
      let requests = allRequests.value.filter(item => {
        if (activeTab.value === 'received') {
          return item.flag === 'receive';
        } else {
          return item.flag === 'send';
        }
      });

      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        requests = requests.filter(item => 
          item.nickName.toLowerCase().includes(keyword) || 
          (item.message && item.message.toLowerCase().includes(keyword))
        );
      }

      return requests;
    });

    const receivedCount = computed(() => {
      return allRequests.value.filter(item => 
        item.flag === 'receive' && item.status === 0
      ).length;
    });

    // 方法
    const searchRequests = () => {
      // 搜索逻辑已通过computed实现
    };

    const switchTab = (tab: string) => {
      activeTab.value = tab;
    };

    const getAvatarUrl = (fileKey: string) => {
      return previewOnlineFileApi(fileKey);
    };

    const getStatusIcon = (status: number) => {
      switch (status) {
        case 1:
          return '@/static/img/new-friend/check-circle.svg';
        case 2:
          return '@/static/img/new-friend/close-circle.svg';
        default:
          return '@/static/img/new-friend/clock.svg';
      }
    };

    const acceptRequest = (id: number) => {
      userValidStatusApi({
        verifyId: id,
        status: 1
      }).then((res) => {
        if (res.code === 0) {
          allRequests.value = allRequests.value.map((item) => {
            if (item.id === id) {
              item.status = 1;
            }
            return item;
          });
          showToast('已添加为好友');
        } else {
          showToast('操作失败');
        }
      }).catch(() => {
        showToast('操作失败');
      });
    };

    const rejectRequest = (id: number) => {
      userValidStatusApi({
        verifyId: id,
        status: 2
      }).then((res) => {
        if (res.code === 0) {
          allRequests.value = allRequests.value.map((item) => {
            if (item.id === id) {
              item.status = 2;
            }
            return item;
          });
          showToast('已拒绝好友请求');
        } else {
          showToast('操作失败');
        }
      }).catch(() => {
        showToast('操作失败');
      });
    };

    const goBack = () => {
      uni.navigateBack();
    };

    // 格式化来源文本
    const getSourceText = (source: string) => {
      const sourceMap: Record<string, string> = {
        'search': '搜索',
        'qrcode': '二维码',
        'group': '群聊',
        'card': '名片',
        'link': '链接',
        'other': '其他'
      };
      return sourceMap[source] || source;
    };





    // 页面加载时获取数据
    getFriendValidListApi({
      page: 1,
      limit: 100
    }).then((res) => {
      if (res.code === 0) {
        allRequests.value = res.result.list.map(item => ({
          ...item,
          createTime: item.createTime || Date.now() - Math.floor(Math.random() * 1000000000)
        }));
      }
    });

    return {
      searchKeyword,
      filteredRequests,
      activeTab,
      receivedCount,
      searchRequests,
      switchTab,
      getAvatarUrl,
      getStatusIcon,
      acceptRequest,
      rejectRequest,
      goBack,
      getSourceText
    };
  }
};
</script>

<style scoped>
/* 标签页区域 */
.tabs-section {
  background: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  position: relative;
  z-index: 10;
  margin-bottom: 12px;
}

.tabs-container {
  display: flex;
  padding: 0 16px;
  max-width: 375px;
  margin: 0 auto;
}

.tab-item {
  position: relative;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #636E72;
  font-weight: 500;
}

.tab-item.active {
  color: #FF7D45;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #FF7D45, #E86835);
  border-radius: 4rpx;
}

.tab-badge {
  margin-left: 16rpx;
  background: linear-gradient(135deg, #FF5252, #E53935);
  color: white;
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  min-width: 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 82, 82, 0.3);
}

/* 好友申请列表 */
.requests-list {
  background: #FFFFFF;
  margin: 0 16rpx 16rpx;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.request-item {
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  background: #FFFFFF;
}

.request-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 96rpx;
  right: 32rpx;
  bottom: 0;
  height: 1rpx;
  background-color: #F0F2F5;
}

.request-item:active {
  background-color: #F9FAFB;
  transform: scale(0.98);
}

.request-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  overflow: hidden;
  margin-right: 24rpx;
  position: relative;
  flex-shrink: 0;
}

.request-avatar image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.request-content {
  flex: 1;
  min-width: 0;
}

.request-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.request-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240rpx;
}

.request-source {
  font-size: 22rpx;
  color: #FF7D45;
  background: rgba(255, 125, 69, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  white-space: nowrap;
}

.request-message {
  font-size: 24rpx;
  color: #636E72;
  margin-bottom: 6rpx;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400rpx;
}

.request-meta {
  font-size: 22rpx;
  color: #B2BEC3;
}

.request-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-left: 24rpx;
  flex-shrink: 0;
}

.btn {
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 72rpx;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.btn-accept {
  background: linear-gradient(135deg, #FF7D45, #E86835);
  color: #FFF;
  box-shadow: 0 2px 8px rgba(255, 125, 69, 0.25);
}

.btn-accept:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(255, 125, 69, 0.25);
  opacity: 0.8;
}

.btn-reject {
  background: rgba(255, 255, 255, 0.8);
  color: #636E72;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-reject:active {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(0.95);
  opacity: 0.8;
}

.btn-text {
  font-weight: 600;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.status-badge.success {
  background: rgba(255, 125, 69, 0.1);
  color: #FF7D45;
}

.status-badge.rejected {
  background: rgba(255, 82, 82, 0.1);
  color: #FF5252;
}

.status-badge.pending {
  background: rgba(178, 190, 195, 0.1);
  color: #B2BEC3;
}

.status-badge image {
  width: 28rpx;
  height: 28rpx;
}

.status-text {
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  padding: 160rpx 64rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 800rpx;
}

.empty-illustration {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 64rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 60rpx rgba(0, 0, 0, 0.1);
}

.empty-illustration image {
  width: 120rpx;
  height: 120rpx;
}

.empty-content {
  text-align: center;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 16rpx;
}

.empty-subtitle {
  display: block;
  font-size: 26rpx;
  color: #636E72;
  line-height: 1.5;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease forwards;
}
</style>
