<template>
  <view class="search-friend-page">
    <BeaverLayout
      title="添加好友"
      :show-background="false"
      @back="handleClickGoBack"
    >
      <!-- 主内容区域 -->
      <view class="main-content">
        <!-- 搜索区域 -->
        <view class="search-container">
          <view class="search-form">
            <view class="search-icon">
              <image src="@/static/img/searchFriend/search-icon.svg" mode="aspectFit" class="icon-img" />
            </view>
            <input type="text" class="search-input" v-model="searchQuery" placeholder="输入邮箱搜索好友"
              placeholder-class="search-placeholder" />
            <view class="search-button" @click="performSearch">
              <text>搜索</text>
            </view>
          </view>
        </view>
        
        <!-- 初始状态（未搜索） -->
        <view class="state-empty" :class="{ 'active': !showResult }">
          <!-- 添加方式 -->
          <view class="add-methods">
            <view class="method-item" @click="scanCode">
              <view class="method-icon">
                <image src="@/static/img/searchFriend/qr-code-icon.svg" mode="aspectFit" class="icon-img" />
              </view>
              <view class="method-info">
                <text class="method-name">扫一扫</text>
                <text class="method-desc">扫描好友的二维码添加</text>
              </view>
              <view class="arrow-right">
                <image src="@/static/img/searchFriend/arrow-right-icon.svg" mode="aspectFit" class="icon-img" />
              </view>
            </view>
          </view>
        </view>

        <!-- 搜索结果状态 -->
        <view class="state-result" :class="{ 'active': showResult }">
          <view class="search-result show fade-in">
            <view class="result-card" @click="goToDetail">
              <view class="user-profile">
                <view class="user-avatar">
                  <BeaverImage :fileKey="searchResult.fileKey" mode="aspectFill" />
                </view>
                <view class="user-info">
                  <text class="user-name">{{ searchResult.nickName }}</text>
                  <text class="user-id">ID: {{ searchResult.userId }}</text>
                </view>
              </view>
              <view class="view-detail-hint">
                <text>点击查看详情</text>
                <image src="@/static/img/searchFriend/arrow-right-icon.svg" mode="aspectFit" class="arrow-icon" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </BeaverLayout>


  </view>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import BeaverLayout from '@/component/layout/layout.vue';
import BeaverImage from '@/component/image/image.vue';
import { addFriendApi, searchApi } from '@/api/friend';
import Logger from '@/logger/logger';
import { showToast } from '@/component/toast';
import type { ISearchRes } from '@/types/ajax/friend';

interface SearchUserInfo {
  userId: string;
  nickName: string;
  fileKey: string;
  phone: string;
}

export default {
  name: 'SearchFriend',
  components: {
    BeaverLayout,
    BeaverImage
  },
  setup() {
    const logger = new Logger('搜索好友页面');
    const searchQuery = ref('');
    const searchResults = ref<SearchUserInfo[]>([]);
    const isLoading = ref(false);
    const showResult = ref(false);
    const verificationMessage = ref('我是你的好友');
    const searchResult = ref<ISearchRes>({
      userId: '',
      nickName: '',
      fileKey: '',
      abstract: '',
      notice: '',
      isFriend: false,
      conversationId: '',
      email: ''
    });

    const displayToast = (message: string) => {
      showToast(message, 3000, 'none');
    };

    // 邮箱格式验证
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const performSearch = async () => {
      if (searchQuery.value.length > 0) {
        // 验证邮箱格式
        if (!validateEmail(searchQuery.value)) {
          displayToast('请输入正确的邮箱格式');
          return;
        }
        isLoading.value = true;
        try {
          const res = await searchApi({ email: searchQuery.value });
          if (res.code === 0) {
            searchResult.value = res.result;
            showResult.value = true;
            displayToast('搜索成功');
          } else {
            displayToast('未找到相关用户');
          }
        } catch (error) {
          logger.error({
            text: '搜索用户失败',
            data: {
              error: error instanceof Error ? error.message : String(error),
              email: searchQuery.value
            }
          });
          console.error('Search failed:', error);
          displayToast('搜索失败，请稍后再试');
        } finally {
          isLoading.value = false;
        }
      } else {
        displayToast('请输入邮箱地址');
      }
    };

    const handleClickGoBack = () => {
      uni.navigateBack();
    };

    const handleClickUser = (user: SearchUserInfo) => {
      uni.navigateTo({
        url: `/pages/detail/detail?userId=${user.userId}`
      });
    };

    const scanCode = () => {
      displayToast('打开相机扫描');
      uni.scanCode({
        success: (res) => {
          try {
            const data = JSON.parse(res.result);
            // 处理扫码结果
            displayToast('扫描成功');
          } catch (e) {
            displayToast('无效的二维码');
          }
        }
      });
    };

    const navigateToContacts = () => {
      uni.navigateTo({
        url: '/pages/contacts/contacts'
      });
    };

    const sendFriendRequest = () => {
      addFriendApi({
        friendId: searchResult.value.userId,
        verify: verificationMessage.value,
        source: 'email'
      }).then((res) => {
        if (res.code === 0) {
          displayToast('好友请求发送成功');
          showResult.value = false;
          searchQuery.value = '';
        } else {
          displayToast(res.msg || '发送失败');
        }
      }).catch((error) => {
        logger.error({
          text: '发送好友请求失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            friendId: searchResult.value.userId
          }
        });
        console.error('发送好友请求失败:', error);
        displayToast('发送失败，请稍后再试');
      });
    };

    const goToDetail = () => {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${searchResult.value.userId}&source=email`
      });
    };

    return {
      searchQuery,
      searchResults,
      isLoading,
      showResult,
      verificationMessage,
      searchResult,
      performSearch,
      handleClickGoBack,
      handleClickUser,
      scanCode,
      navigateToContacts,
      sendFriendRequest,
      goToDetail
    };
  }
};
</script>

<style lang="scss" scoped>
.search-friend-page {
  min-height: 100vh;
  background-color: #FFFFFF;
}

/* 主内容区域 */
.main-content {
  box-sizing: border-box;
}

/* 搜索区域 */
.search-container {
  padding: 16rpx 20rpx;
  margin-bottom: 20rpx;
}

.search-form {
  position: relative;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 48rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1rpx solid rgba(255, 125, 69, 0.1);
}

.search-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: #FF7D45;
}

.search-input {
  flex: 1;
  height: 88rpx;
  background-color: transparent;
  border: none;
  padding: 0 32rpx 0 72rpx;
  font-size: 30rpx;
  color: #2D3436;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
}

.search-button {
  height: 88rpx;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 30rpx;
  position: relative;
  overflow: hidden;
}

.search-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
}

.search-button:active {
  transform: scale(0.98);
}

.search-placeholder {
  color: #B2BEC3;
}

/* 添加方式卡片 */
.add-methods {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  margin: 0 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.method-item {
  display: flex;
  align-items: center;
  padding: 32rpx 24rpx;
  position: relative;
}

.method-item:first-child {
  border-bottom: 1rpx solid #EBEEF5;
}

.method-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #FFE6D9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.method-icon .icon-img {
  width: 40rpx;
  height: 40rpx;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 8rpx;
  display: block;
}

.method-desc {
  font-size: 26rpx;
  color: #636E72;
  display: block;
}

.arrow-right {
  width: 28rpx;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-right .icon-img {
  width: 28rpx;
  height: 28rpx;
}

/* 搜索结果 */
.search-result {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  margin: 0 20rpx;
}

.result-card {
  padding: 36rpx 24rpx;
}

.user-profile {
  display: flex;
  align-items: flex-start;
}

.user-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 64rpx;
  overflow: hidden;
  background-color: #F9FAFB;
  margin-right: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.user-avatar image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 10rpx;
  display: block;
}

.user-id {
  font-size: 24rpx;
  color: #B2BEC3;
  margin-bottom: 16rpx;
  display: block;
}

.user-bio {
  font-size: 28rpx;
  color: #636E72;
  line-height: 1.5;
  margin-bottom: 10rpx;
  display: block;
}

.user-meta {
  font-size: 24rpx;
  color: #B2BEC3;
  display: flex;
  align-items: center;
}

.meta-dot {
  display: inline-block;
  width: 4rpx;
  height: 4rpx;
  background-color: #B2BEC3;
  border-radius: 50%;
  margin: 0 8rpx;
}

/* 搜索结果动作区 */
.result-actions {
  padding: 32rpx 28rpx;
  border-top: 1rpx solid #EBEEF5;
}

.view-detail-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  color: #FF7D45;
  font-size: 28rpx;
  font-weight: 500;
}

.arrow-icon {
  width: 24rpx;
  height: 24rpx;
  margin-left: 8rpx;
}

.verification-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 20rpx;
  border: 1rpx solid #EBEEF5;
  background-color: #F9FAFB;
  font-size: 28rpx;
  margin-bottom: 32rpx;
  color: #2D3436;
  box-sizing: border-box;
}

.verification-input:focus {
  outline: none;
  border-color: #FF7D45;
  box-shadow: 0 0 0 4rpx rgba(255, 125, 69, 0.1);
}

/* 按钮 */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 600;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: white;
  border: none;
  box-shadow: 0 10rpx 28rpx rgba(255, 125, 69, 0.18);
  position: relative;
  overflow: hidden;
}



.btn-primary:active {
  transform: translateY(2rpx);
  box-shadow: 0 6rpx 16rpx rgba(255, 125, 69, 0.18);
}

/* 状态类 */
.state-empty,
.state-result {
  display: none;
}

.state-empty.active,
.state-result.active {
  display: block;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 图标通用样式 */
.icon-img {
  width: 100%;
  height: 100%;
}


</style>