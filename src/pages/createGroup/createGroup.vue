<template>
  <BeaverLayout
    title="发起群聊"
    :show-back="true"
    :before-height="104"
    :after-height="100"
    @back="goBack"
  >
    <!-- 搜索栏 -->
    <template #before>
      <view class="search-container">
        <view class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.5 9.5L13.5 12.5L12.5 13.5L9.5 10.5C8.7 11.1 7.7 11.5 6.5 11.5C3.5 11.5 1 9 1 6C1 3 3.5 0.5 6.5 0.5C9.5 0.5 12 3 12 6C12 7.2 11.6 8.2 11 9L10.5 9.5ZM6.5 2.5C4.6 2.5 3 4.1 3 6C3 7.9 4.6 9.5 6.5 9.5C8.4 9.5 10 7.9 10 6C10 4.1 8.4 2.5 6.5 2.5Z" fill="#B2BEC3"/>
          </svg>
          <input 
            type="text" 
            class="search-input" 
            placeholder="搜索" 
            v-model="searchQuery"
            @input="handleSearch"
          />
        </view>
      </view>
    </template>

    <!-- 联系人列表 -->
    <view class="contacts-list">
      <view 
        v-for="(group, letter) in groupedContacts" 
        :key="letter"
        class="contact-section" 
        :id="'section-' + letter"
      >
        <view class="section-header">{{ letter }}</view>
        <view 
          v-for="contact in group" 
          :key="contact.userId"
          class="contact-item ripple"
          @click="handleSelect(contact)"
        >
          <view class="contact-avatar">
            <BeaverImage :file-name="contact.fileKey" mode="aspectFill" />
          </view>
          <view class="contact-info">
            <text class="contact-name">{{ contact.nickName }}</text>
            <text class="contact-detail">{{ contact.status }}</text>
          </view>
          <view class="checkbox" :class="{'selected': isSelected(contact.userId)}">
            <svg v-if="isSelected(contact.userId)" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 8.5L2 6L1 7L4.5 10.5L11 4L10 3L4.5 8.5Z" fill="white"/>
            </svg>
          </view>
        </view>
      </view>
    </view>

    <!-- 字母索引栏 -->
    <view class="index-bar" @touchstart="handleIndexTouch" @touchmove="handleIndexTouch">
      <view 
        v-for="letter in indexList" 
        :key="letter"
        class="index-item"
        :data-index="letter"
      >{{ letter }}</view>
    </view>

    <!-- 底部操作栏 -->
    <template #after>
      <view class="bottom-bar">
        <view class="selected-avatars">
          <view 
            v-for="contact in selectedAvatars" 
            :key="contact.userId"
            class="selected-avatar"
          >
            <BeaverImage :file-name="contact.fileKey" mode="aspectFill" />
          </view>
          <view v-if="selectedContacts.length > 3" class="more-avatars">
            +{{ selectedContacts.length - 3 }}
          </view>
        </view>
        <view 
          :class="['btn-start-chat', {'disabled': selectedContacts.length === 0}]"
          @click="createGroup"
        >完成<text v-if="selectedContacts.length > 0">({{ selectedContacts.length }}人)</text></view>
      </view>
    </template>

    <!-- 快速跳转提示 -->
    <view class="quick-jump" :class="{'show': showQuickJump}">
      {{ currentLetter }}
    </view>
  </BeaverLayout>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import BeaverLayout from '@/component/layout/layout.vue';
import { useFriendStore } from '@/pinia/friend/friend';
import { groupCreateApi } from '@/api/group';
import { useGroupStore } from '@/pinia/group/group';
import BeaverImage from '@/component/image/image.vue';
import Logger from '@/logger/logger';

interface CreateGroupResponse {
  code: number;
  result: {
    groupId: string;
  };
}

export default {
  name: 'CreateGroup',
  components: {
    BeaverLayout,
    BeaverImage
  },
  setup() {
    const friendStore = useFriendStore();
    const groupStore = useGroupStore();
    
    // 状态管理
    const searchQuery = ref('');
    const selectedContacts = ref<any[]>([]);
    const showQuickJump = ref(false);
    const currentLetter = ref('');
    const scrollTop = ref(0);
    
    // 计算属性
    const friendList = computed(() => friendStore.friendList);
    
    const groupedContacts = computed(() => {
      const contacts = friendList.value.filter(friend => 
        friend.nickName.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      
      return contacts.reduce((groups: any, contact) => {
        const firstLetter = contact.nickName.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(contact);
        return groups;
      }, {});
    });

    const indexList = computed(() => Object.keys(groupedContacts.value).sort());

    const selectedAvatars = computed(() => selectedContacts.value.slice(0, 3));

    // 声明 quickJumpTimeout
    let quickJumpTimeout: any = null;

    // 方法
    const handleSearch = () => {
      // 搜索逻辑已通过 groupedContacts 计算属性实现
    };

    const handleSelect = (contact: any) => {
      const index = selectedContacts.value.findIndex(c => c.userId === contact.userId);
      if (index === -1) {
        selectedContacts.value.push(contact);
      } else {
        selectedContacts.value.splice(index, 1);
      }
    };

    const isSelected = (userId: string) => {
      return selectedContacts.value.some(contact => contact.userId === userId);
    };

    const handleIndexTouch = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      // 获取字母索引
      const target = e.target as HTMLElement;
      const letter = target?.dataset?.index;
      
      if (letter) {
        currentLetter.value = letter;
        showQuickJump.value = true;
        
        // 使用正确的 uni-app API 方法
        const query = uni.createSelectorQuery();
        query.select(`#section-${letter}`).boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res: any[]) => {
          if (res[0] && res[1]) {
            const sectionInfo = res[0];
            const scrollInfo = res[1];
            
            // 计算目标滚动位置
            const targetScrollTop = sectionInfo.top + scrollInfo.scrollTop - 112; // 减去导航栏和搜索栏高度
            scrollTop.value = targetScrollTop;
          }
        });
        
        // 隐藏快速跳转提示
        if (quickJumpTimeout) {
          clearTimeout(quickJumpTimeout);
        }
        quickJumpTimeout = setTimeout(() => {
          showQuickJump.value = false;
        }, 1000);
      }
    };

    const createGroup = async () => {
      if (selectedContacts.value.length === 0) return;
      
      try {
        const res = await groupCreateApi({
          name: selectedContacts.value.map(item => item.nickName).slice(0, 3).join() + '等人的群聊',
          userIdList: selectedContacts.value.map(item => item.userId)
        }) as CreateGroupResponse;

        if (res.code === 0 && res.result?.groupId) {
          await groupStore.initGroupListApi();
          uni.navigateTo({
            url: `/pages/chat/chat?id=${res.result.groupId}`,
            animationType: 'slide-in-right',
            animationDuration: 200
          });
        } else {
          uni.showToast({
          title: '创建群聊失败，请重试',
          icon: 'none'
        });
        }
      } catch (error) {
        const logger = new Logger('创建群组页面');
        logger.error({
          text: '创建群聊失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            memberCount: selectedContacts.value.length
          }
        });
        console.error('创建群聊失败:', error);
        uni.showToast({
          title: '创建群聊失败，请重试',
          icon: 'none'
        });
      }
    };

    const goBack = () => {
      uni.navigateBack({ delta: 1 });
    };

    return {
      searchQuery,
      selectedContacts,
      showQuickJump,
      currentLetter,
      groupedContacts,
      indexList,
      selectedAvatars,
      scrollTop,
      handleSearch,
      handleSelect,
      isSelected,
      handleIndexTouch,
      createGroup,
      goBack,
    };
  }
};
</script>

<style lang="scss" scoped>
/* 搜索栏 */
.search-container {
  padding: 8px 16px;
  background-color: #FFFFFF;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 36px;
  background-color: #F9FAFB;
  border-radius: 18px;
  padding: 0 12px;
}

.search-icon {
  margin-right: 8px;
  display: block;
}

.search-input {
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  font-size: 14px;
  color: #2D3436;

  &::placeholder {
    color: #B2BEC3;
  }
}


.contact-section {
  margin-bottom: 8px;
}

.section-header {
  padding: 8px 16px;
  font-size: 12px;
  color: #B2BEC3;
  background-color: #F9FAFB;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  position: relative;

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.contact-info {
  flex: 1;
  min-width: 0;
  padding: 4px 0;
}

.contact-name {
  font-size: 16px;
  color: #2D3436;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-detail {
  font-size: 12px;
  color: #B2BEC3;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #EBEEF5;
  margin-left: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.selected {
    background-color: #FF7D45;
    border-color: #FF7D45;
  }

  svg {
    display: block;
  }
}

/* 字母索引栏 */
.index-bar {
  position: fixed;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  z-index: 50;
}

.index-item {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #FF7D45;
  font-weight: 500;
}

/* 底部操作栏 */
.bottom-bar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.05);
  padding: 0 16px;
  padding-bottom: env(safe-area-inset-bottom);
}

.selected-avatars {
  display: flex;
  align-items: center;
}

.selected-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
  margin-right: 8px;

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.more-avatars {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #F9FAFB;
  color: #B2BEC3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.btn-start-chat {
  height: 36px;
  padding: 0 16px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: white;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

/* 快速跳转提示 */
.quick-jump {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  z-index: 1000;

  &.show {
    display: flex;
  }
}

/* 点击效果 */
.ripple {
  position: relative;
  overflow: hidden;
  transform: translate3d(0, 0, 0);

  &:after {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #000 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform .5s, opacity 1s;
  }

  &:active:after {
    transform: scale(0, 0);
    opacity: .2;
    transition: 0s;
  }
}
</style>
