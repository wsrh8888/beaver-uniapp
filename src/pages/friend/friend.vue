<template>
  <view class="container">
    <!-- 使用通用Header组件 -->
    <PageHeader 
      title="好友"
      :show-back="false"
    />
    
    <!-- 索引栏 -->
    <view class="index-bar">
      <view 
        v-for="(item, index) in indexList" 
        :key="index" 
        class="index-item" 
        :class="{ 'active': currentIndex === item }"
        @click="scrollToSection(item)"
      >
        {{ item }}
      </view>
    </view>
    
    <!-- 内容区域 -->
    <scroll-view 
      scroll-y 
      class="content"
      :style="{ top: statusBarHeight + 88 + 'rpx' }"
      :scroll-into-view="'section-' + currentIndex"
      @scroll="onScroll"
    >
      <!-- 搜索栏 -->
      <!-- <view class="search-wrapper">
        <view class="search-bar" @click="navigateTo('/pages/searchFriend/searchFriend')">
          <view class="search-icon">
            <image src="@/static/img/friend/search-icon.svg" mode="aspectFit" class="icon-img" />
          </view>
          <text class="search-placeholder">搜索好友</text>
        </view>
      </view> -->
      
      <!-- 快捷操作区 -->
      <view class="quick-actions">
        <view class="quick-action-item" @click="navigateTo('/pages/new-friends/new-friends')">
          <view class="action-icon">
            <image src="@/static/img/friend/add-friend-icon.svg" mode="aspectFit" class="icon-img" />
          </view>
          <text class="action-label">新朋友</text>
        </view>
        <view class="quick-action-item" @click="navigateTo('/pages/groupList/groupList')">
          <view class="action-icon">
            <image src="@/static/img/friend/dropdown-group-icon.svg" mode="aspectFit" class="icon-img" />
          </view>
          <text class="action-label">群聊</text>
        </view>
        <view class="quick-action-item" @click="navigateTo('/pages/ai/ai')">
          <view class="action-icon">
            <image src="@/static/img/friend/ai-icon.svg" mode="aspectFit" class="icon-img" />
          </view>
          <text class="action-label">AI</text>
        </view>
      </view>
      
      <!-- 好友列表区域 -->
      <view class="friend-list-container">
        <!-- 根据分组动态渲染好友列表 -->
        <view 
          v-for="(friends, letter) in friendsGroupedByLetter" 
          :key="letter"
          class="friend-section" 
          :id="'section-' + letter"
        >
          <view class="section-header">
            <view class="section-title">{{ letter }}</view>
            <view class="section-count">{{ friends.length }}</view>
          </view>
          <view class="friend-list">
            <view 
              v-for="friend in friends" 
              :key="friend.userId"
              class="friend-item" 
              @click="handlecreateConversation(friend)"
            >
              <view 
                class="avatar"
              >
                <beaver-image 
                  v-if="friend.avatar" 
                  :fileKey="friend.avatar" 
                  mode="aspectFill" 
                  class="avatar-img" 
                />
                <text v-else>{{ friend.nickName.charAt(0).toUpperCase() }}</text>
              </view>
              <view class="friend-content">
                <view class="friend-name">{{ friend.notice || friend.nickName }}</view>
              </view>
            </view>
          </view>
        </view>
        
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFriendStore } from '@/pinia/friend/friend';
import BeaverImage from '@/component/image/image.vue';
import PageHeader from '@/component/header/header.vue';

export default {
  components: {
    BeaverImage,
    PageHeader
  },
  setup() {
    const currentIndex = ref('A');
    const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;
    
    // 使用Friend Store
    const friendStore = useFriendStore();
    
    // 使用computed获取好友列表
    const friendList = computed(() => friendStore.friendList);
    
    // 动态计算索引列表
    const indexList = computed(() => {
      const letters = ['↑'];
      // 从好友列表中获取所有的首字母并去重
      const uniqueLetters = [...new Set(
        friendList.value.map(friend => {
          // 获取名称的首字母并转为大写
          const firstChar = friend.nickName.charAt(0).toUpperCase();
          // 判断是否为英文字母
          return /[A-Z]/.test(firstChar) ? firstChar : '#';
        })
      )].sort();
      
      return [...letters, ...uniqueLetters];
    });
    
    // 按字母分组好友
    const friendsGroupedByLetter = computed(() => {
      const groups: Record<string, any[]> = {};
      
      // 初始化索引中的所有分组
      indexList.value.forEach(letter => {
        if (letter !== '↑') {
          groups[letter] = [];
        }
      });
      
      // 将好友分到对应的组
      friendList.value.forEach(friend => {
        const firstChar = friend.nickName.charAt(0).toUpperCase();
        const group = /[A-Z]/.test(firstChar) ? firstChar : '#';
        
        if (groups[group]) {
          groups[group].push(friend);
        }
      });
      
      return groups;
    });
    
    // 滚动事件处理
    const onScroll = (e: any) => {
      // 获取当前可见区域，决定当前高亮索引
      const scrollTop = e.detail.scrollTop;
      // 这里可以实现根据滚动位置更新当前索引
    };
    
    // 滚动到指定索引区域
    const scrollToSection = (index: string) => {
      currentIndex.value = index;
      
      if (index === '↑') {
        uni.pageScrollTo({
          scrollTop: 0,
          duration: 300
        });
      }
    };

    // 页面导航
    const navigateTo = (url: string) => {
      uni.navigateTo({
        url,
        animationType: 'slide-in-right',
        animationDuration: 300
      });
    };

    // 点击好友项创建会话
    const handlecreateConversation = (friend: any) => {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${friend.userId}`,
        animationType: 'slide-in-right',
        animationDuration: 300
      });
    };
    
    // 页面加载时获取好友列表
    onMounted(() => {
      // friendStore.getFriendList();
    });

    return {
      statusBarHeight,
      currentIndex,
      indexList,
      friendList,
      friendsGroupedByLetter,
      scrollToSection,
      navigateTo,
      handlecreateConversation,
      onScroll
    };
  }
}
</script>

<style lang="scss" scoped>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  font-family: "PingFang SC", "SF Pro", "微软雅黑", sans-serif;
}

.container {
  background-color: #FFFFFF;
  color: #2D3436;
  font-size: 14px;
  line-height: 1.5;
  overflow-x: hidden;
  position: relative;
  min-height: 100vh;
}



/* 内容区域 */
.content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: var(--window-bottom);
  z-index: 1;
}

/* 搜索栏 */
.search-wrapper {
  padding: 0 16px 10px;
}

.search-bar {
  background: #F9FAFB;
  border-radius: 10px;
  height: 38px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.search-icon {
  color: #B2BEC3;
  margin-right: 10px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-placeholder {
  color: #B2BEC3;
  font-size: 14px;
}

/* 索引栏 */
.index-bar {
  position: fixed;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  z-index: 90;
}

.index-item {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #636E72;
  font-weight: 500;
}

.index-item.active {
  color: #FF7D45;
  font-weight: 600;
}

/* 好友分组 */
.friend-section {
  margin-bottom: 8px;
  padding: 0 16px;
}

.section-header {
  padding: 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #636E72;
  font-weight: 600;
  position: sticky;
  top: 0;
  background: #FFFFFF;
  z-index: 5;
}

.section-title {
  display: flex;
  align-items: center;
}

.section-count {
  font-size: 12px;
  font-weight: 400;
  color: #B2BEC3;
  margin-left: 5px;
}

/* 好友列表 */
.friend-list-container {
  position: relative;
}

.friend-list {
  position: relative;
}

.friend-item {
  padding: 10px 0;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
}

.friend-item:active {
  background-color: #F9FAFB;
}

.friend-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 64px;
  right: 0;
  bottom: 0;
  height: 0.5px;
  background-color: #EBEEF5;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  position: relative;
  margin-right: 16px;
}

.avatar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  border-radius: 14px 14px 0 0;
}

.avatar.primary {
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  box-shadow: 0 2px 6px rgba(255, 125, 69, 0.15);
}

.avatar.blue {
  background: linear-gradient(135deg, #4A6FA1 0%, #375782 100%);
  box-shadow: 0 2px 6px rgba(74, 111, 161, 0.15);
}

.avatar.green {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.15);
}

.avatar.purple {
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
  box-shadow: 0 2px 6px rgba(156, 39, 176, 0.15);
}

.avatar.yellow {
  background: linear-gradient(135deg, #FFD166 0%, #FFC107 100%);
  box-shadow: 0 2px 6px rgba(255, 209, 102, 0.15);
}

.friend-content {
  flex: 1;
  min-width: 0;
}

.friend-name {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 快捷操作区 */
.quick-actions {
  padding: 16px;
  display: flex;
  background: #F9FAFB;
  margin-bottom: 10px;
  border-radius: 12px;
  margin: 0 10px;
}

.quick-action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: #FFFFFF;
  color: #FF7D45;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 24rpx;
}

.action-label {
  font-size: 12px;
  color: #636E72;
}



/* 底部占位 */
.tabbar-placeholder {
  height: 56px;
  width: 100%;
}

/* 图标样式 */
.icon-img {
  width: 100%;
  height: 100%;
}

/* 头像图片样式 */
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
}
</style>
