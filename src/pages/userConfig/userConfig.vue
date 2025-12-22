<template>
  <BeaverLayout
    title="聊天详情"
    :show-back="true"
    :scrollable="true"
    :scroll-y="true"
    :show-scrollbar="false"
    @back="goBack"
  >
    <view class="content">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-avatar">
          <image :src="getAvatarUrl(friendInfo.fileKey)" mode="aspectFill" class="avatar-img"></image>
          <view class="online-status" v-if="friendInfo.isOnline"></view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ friendInfo.nickName }}</text>
          <text class="user-id">ID: {{ friendInfo.userId }}</text>
        </view>
      </view>

      <!-- 聊天设置 -->
      <view class="settings-section">
        <view class="section-title">聊天设置</view>
        
        <!-- 置顶聊天 -->
        <view class="setting-item" @click="toggleTopChat">
          <view class="setting-left">
            <image src="@/static/img/userConfig/pin-icon.svg" mode="aspectFit" class="setting-icon"></image>
            <text class="setting-text">置顶聊天</text>
          </view>
          <view class="setting-right">
            <view class="toggle-switch" :class="{ active: isTopChat }" @click.stop="toggleTopChat">
              <view class="toggle-slider"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 危险操作 -->
      <view class="danger-section">
        <view class="danger-item" @click="showDeleteConfirm">
          <image src="@/static/img/userConfig/delete-icon.svg" mode="aspectFit" class="danger-icon"></image>
          <text class="danger-text">删除好友</text>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view v-if="showDeleteModal" class="modal-overlay" @click="hideDeleteConfirm">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <image src="@/static/img/userConfig/warning-icon.svg" mode="aspectFit" class="warning-icon"></image>
          <text class="modal-title">删除好友</text>
        </view>
        <view class="modal-body">
          <text class="modal-text">确定要删除好友 "{{ friendInfo.nickName }}" 吗？</text>
          <text class="modal-subtext">删除后将无法恢复，聊天记录也会被清空</text>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="hideDeleteConfirm">取消</view>
          <view class="modal-btn confirm-btn" @click="confirmDelete">删除</view>
        </view>
      </view>
    </view>
  </BeaverLayout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useFriendStore } from '@/pinia/friend/friend';
import { useConversationStore } from '@/pinia/conversation/conversation';
import { friendDeleteApi } from '@/api/friend';
import { previewOnlineFileApi } from '@/api/file';
import { pinnedChatApi } from '@/api/chat';
import BeaverLayout from '@/component/layout/layout.vue';
import Logger from '@/logger/logger';

export default {
  components: {
    BeaverLayout
  },
  setup() {
    // 响应式数据
    const conversationId = ref('');
    const showDeleteModal = ref(false);

    // Store
    const friendStore = useFriendStore();
    const conversationStore = useConversationStore();

    // 计算属性
    const friendInfo = computed(() => {
      const info = friendStore.getFriendByConversationId(conversationId.value) || {
        nickName: '未知用户',
        userId: '',
        fileKey: '',
        isOnline: false
      };
      return {
        ...info,
        isOnline: (info as any).isOnline || false
      };
    });

    // 置顶状态从 conversation store 获取
    const isTopChat = computed(() => {
      const info = conversationStore.getConversationInfo(conversationId.value);
      return info ? !!info.is_top : false;
    });

    // 生命周期
    onLoad((option: any) => {
      if (option.id) {
        conversationId.value = option.id;
      }
    });

    // 方法
    const getAvatarUrl = (fileKey: string) => {
      return previewOnlineFileApi(fileKey);
    };

    const goBack = () => {
      console.error(conversationId.value, '1111111111111')
      uni.navigateBack();
    };

    const toggleTopChat = () => {
      const newStatus = !isTopChat.value;
      
      pinnedChatApi({
        conversationId: conversationId.value,
        isPinned: newStatus
      }).then((res) => {
        if (res.code === 0) {
          // 更新本地 conversation store 状态
          conversationStore.toggleTopChat(conversationId.value);
          uni.showToast({
            title: newStatus ? '已置顶' : '已取消置顶',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      }).catch((error) => {
        const logger = new Logger('用户设置页面');
        logger.error({
          text: '置顶聊天失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            conversationId: conversationId.value
          }
        });
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      });
    };

    const showDeleteConfirm = () => {
      showDeleteModal.value = true;
    };

    const hideDeleteConfirm = () => {
      showDeleteModal.value = false;
    };

    const confirmDelete = () => {
      friendDeleteApi({
        friendId: friendInfo.value.userId
      }).then(() => {
        uni.showToast({
          title: '删除成功',
          icon: 'success'
        });
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/home/home',
            animationType: 'pop-in',
            animationDuration: 200
          });
        }, 1500);
      }).catch((error) => {
        const logger = new Logger('用户设置页面');
        logger.error({
          text: '删除好友失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        });
      });
      hideDeleteConfirm();
    };

    return {
      conversationId,
      showDeleteModal,
      friendInfo,
      isTopChat,
      getAvatarUrl,
      goBack,
      toggleTopChat,
      showDeleteConfirm,
      hideDeleteConfirm,
      confirmDelete
    };
  }
};
</script>

<style scoped>
/* 内容区域 */
.content {
  padding: 16px;
  padding-bottom: 32px;
  max-width: 375px;
  box-sizing: border-box;
  margin: 0 auto;
}

/* 用户信息卡片 */
.user-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.user-avatar {
  position: relative;
  margin-right: 16px;
}

.avatar-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
}

.online-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #4CAF50;
  border: 2px solid #FFFFFF;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 4px;
  display: block;
}

.user-id {
  font-size: 14px;
  color: #636E72;
  display: block;
}

/* 设置区域 */
.settings-section {
  background: #FFFFFF;
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.section-title {
  padding: 16px 20px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #636E72;
  background: #F8F9FA;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F2F5;
  transition: background-color 0.2s;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background-color: #F8F9FA;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-icon {
  width: 20px;
  height: 20px;
}

.setting-text {
  font-size: 16px;
  color: #2D3436;
  font-weight: 500;
}

.setting-right {
  display: flex;
  align-items: center;
}

/* 自定义开关样式 */
.toggle-switch {
  width: 44px;
  height: 24px;
  background: #E1E8ED;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* 危险操作区域 */
.danger-section {
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.danger-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  transition: background-color 0.2s;
}

.danger-item:active {
  background-color: #FFF5F5;
}

.danger-icon {
  width: 20px;
  height: 20px;
}

.danger-text {
  font-size: 16px;
  color: #FF5252;
  font-weight: 500;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 16px;
  margin: 20px;
  max-width: 320px;
  width: 100%;
  overflow: hidden;
}

.modal-header {
  padding: 24px 20px 16px;
  text-align: center;
}

.warning-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #2D3436;
  display: block;
}

.modal-body {
  padding: 0 20px 24px;
  text-align: center;
}

.modal-text {
  font-size: 16px;
  color: #2D3436;
  margin-bottom: 8px;
  display: block;
}

.modal-subtext {
  font-size: 14px;
  color: #636E72;
  line-height: 1.4;
  display: block;
}

.modal-actions {
  display: flex;
  border-top: 1px solid #F0F2F5;
}

.modal-btn {
  flex: 1;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.modal-btn:active {
  background-color: #F8F9FA;
}

.cancel-btn {
  color: #636E72;
  border-right: 1px solid #F0F2F5;
}

.confirm-btn {
  color: #FF5252;
}
</style>
