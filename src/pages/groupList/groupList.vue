<template>
  <BeaverLayout
    title="我的群聊"
    :show-back="true"
    :scrollable="true"
    :scroll-y="true"
    :show-scrollbar="false"
    @back="goBack"
  >
    <!-- 群聊列表 -->
    <view class="group-list">
      <view 
        class="group-item" 
        v-for="item in groupList" 
        :key="item.conversationId"
        @click="handleClickGroup(item)"
      >
        <view class="group-avatar">
          <BeaverImage :file-name="item.fileKey" mode="aspectFill" />
        </view>
        <view class="group-info">
          <text class="group-name">{{ item.title }}</text>
          <text class="group-message">{{ item.lastMessage || '' }}</text>
          <view class="member-count">
            <image src="/static/groupList/member.svg" mode="aspectFit" class="member-icon" />
            <text>{{ item.memberCount }}人</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建群聊按钮 -->
    <view class="fab-button" @click="createGroup">
      <image src="/static/groupList/add.svg" mode="aspectFit" class="add-icon" />
    </view>
  </BeaverLayout>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useGroupStore } from '@/pinia/group/group';
import type { IGroupInfo } from '@/types/ajax/group';
import BeaverLayout from '@/component/layout/layout.vue';
import BeaverImage from '@/component/image/image.vue';

interface GroupInfo extends IGroupInfo {
  lastMessage?: string;
}

export default {
  components: {
    BeaverLayout,
    BeaverImage
  },
  setup() {
    const groupStore = useGroupStore();
    const groupList = computed(() => groupStore.groupList as GroupInfo[]);

    const goBack = () => {
      uni.navigateBack();
    };

    const handleClickGroup = (groupInfo: GroupInfo) => {
      uni.navigateTo({
        url: `/pages/chat/chat?id=${groupInfo.conversationId}`,
        animationType: 'slide-in-right',
        animationDuration: 200
      });
    };

    const createGroup = () => {
      uni.navigateTo({
        url: '/pages/createGroup/createGroup',
        animationType: 'slide-in-right',
        animationDuration: 200
      });
    };

    return {
      groupList,
      goBack,
      handleClickGroup,
      createGroup
    };
  }
};
</script>

<style lang="scss" scoped>
:root {
  /* 色彩系统 */
  --primary: #FF7D45;
  --primary-deep: #E86835;
  --primary-light: #FFE6D9;
  --text-title: #2D3436;
  --text-body: #636E72;
  --text-auxiliary: #B2BEC3;
  --background: #FFFFFF;
  --background-secondary: #F9FAFB;
  --divider: #EBEEF5;
}

/* 群聊列表 */
.group-list {
  padding: 16px;
  background-color: var(--background);
}

.group-item {
  display: flex;
  padding: 16px;
  margin-bottom: 12px;
  background-color: var(--background);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.04);

  &:active {
    transform: scale(0.98);
    background-color: var(--background-secondary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .group-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    margin-right: 16px;
    flex-shrink: 0;
    position: relative;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-deep) 100%);
    box-shadow: 0 4px 12px rgba(255, 125, 69, 0.2);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    }

    image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: relative;
    }
  }

  .group-info {
    flex: 1;
    min-width: 0;
    width: 0;
    overflow: hidden;

    .group-name {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-title);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      line-height: 1.3;
    }

    .group-message {
      font-size: 14px;
      color: var(--text-body);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .member-count {
      font-size: 12px;
      color: var(--text-auxiliary);
      display: flex;
      align-items: center;

      .member-icon {
        width: 14px;
        height: 14px;
        margin-right: 6px;
      }
    }
  }
}

/* 创建群聊按钮 */
.fab-button {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: linear-gradient(135deg, #E86835 0%, #D55A2B 100%);
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(232, 104, 53, 0.4);
  z-index: 100;
  transition: all 0.2s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(255, 125, 69, 0.2);
  }

  .add-icon {
    width: 20px;
    height: 20px;
  }
}
</style>
