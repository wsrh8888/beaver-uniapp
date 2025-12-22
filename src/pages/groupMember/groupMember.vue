<template>
  <BeaverLayout :title="pageTitle" :show-back="true" :show-background="true" :background-type="'gradient'"
    :background-height="120" :after-height="160" @back="goBack">
    <!-- 搜索框 -->
    <!-- <template #before v-if="mode !== 'view'">
      <view class="search-container">
        <view class="search-icon">
          <image src="@/static/img/groupMember/search.svg" mode="aspectFit" />
        </view>
        <input 
          type="text" 
          class="search-input" 
          v-model="searchText" 
          :placeholder="mode === 'add' ? '搜索联系人' : '搜索群成员'"
        />
      </view>
    </template> -->

    <!-- 内容区域 -->
    <!-- 添加成员模式 -->
    <view class="add-mode" v-if="mode === 'add'">
      <!-- 空状态 -->
      <EmptyState v-if="filteredAddContacts.length === 0" title="没有可添加的联系人"
        description="你的所有联系人已经在群里了，或者没有符合搜索条件的联系人" />

      <!-- 联系人列表 -->
      <view class="contacts-list" v-else>
        <view v-for="(group, index) in groupedAddContacts" :key="`group-${index}`">
          <view class="letter-index">{{ group.letter }}</view>
          <ContactItem v-for="contact in group.contacts" :key="contact.userId" :contact="contact" :show-action="true"
            action-type="add" :is-selected="isSelected(contact)" @click="toggleSelect(contact)" />
        </view>
      </view>
    </view>

    <!-- 移除成员模式 -->
    <view class="remove-mode" v-else-if="mode === 'remove'">
      <!-- 空状态 -->
      <EmptyState v-if="filteredRemoveContacts.length === 0" title="没有符合条件的成员" description="尝试其他搜索关键词" />

      <!-- 群成员列表 -->
      <view class="contacts-list" v-else>
        <!-- 群主 -->
        <view class="letter-index">群主</view>
        <ContactItem :contact="groupOwner" :show-action="false" />

        <!-- 成员 -->
        <view class="letter-index">成员</view>
        <ContactItem v-for="member in filteredRemoveContacts" :key="member.userId" :contact="member" :show-action="true"
          action-type="remove" :is-selected="isSelected(member)" @click="toggleSelect(member)" />
      </view>
    </view>

    <!-- 查看成员模式 -->
    <view class="view-mode" v-else>
      <!-- 群成员列表 -->
      <view class="contacts-list">
        <!-- 群主 -->
        <view class="letter-index">群主</view>
        <ContactItem :contact="groupOwner" :show-action="false" />

        <!-- 成员 -->
        <view class="letter-index">成员</view>
        <ContactItem v-for="member in groupMembers" :key="member.userId" :contact="member" :show-action="false" />
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <template #after v-if="mode !== 'view'">
      <view class="bottom-actions">
        <view v-if="mode === 'add'" class="action-button confirm-add" :class="{ 'no-selection': selectedCount === 0 }"
          @click="confirmAdd">
          添加选中成员
        </view>
        <view v-else class="action-button confirm-remove" :class="{ 'no-selection': selectedCount === 0 }"
          @click="confirmRemove">
          移除选中成员
        </view>
      </view>
    </template>
  </BeaverLayout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { useGroupStore } from '@/pinia/group/group';
import { useUserStore } from '@/pinia/user/user';
import { useFriendStore } from '@/pinia/friend/friend';
import { onLoad } from '@dcloudio/uni-app';
import { groupMemberAddApi, groupMemberRemoveApi } from '@/api/group';
import type { IGroupMember } from '@/types/ajax/group';
import type { IFriendInfo } from '@/types/ajax/friend';
import BeaverLayout from '@/component/layout/layout.vue';
import ContactItem from './components/ContactItem.vue';
import EmptyState from './components/EmptyState.vue';
import { showToast } from '@/component/toast';

export default {
  name: 'GroupMember',
  components: {
    BeaverLayout,
    ContactItem,
    EmptyState
  },
  setup() {
    const mode = ref<'add' | 'remove' | 'view'>('view');
    const searchText = ref('');
    const selectedContacts = ref<IFriendInfo[]>([]);
    const selectedMembers = ref<IGroupMember[]>([]);
    const groupStore = useGroupStore();
    const userStore = useUserStore();
    const friendStore = useFriendStore();
    const groupId = ref('');

    // 获取群成员数据
    const getGroupsMembers = async () => {
      try {
        const result = await groupStore.getGroupMembersApi(groupId.value);
        if (result.code === 0) {
          // 数据已通过store管理
        }
      } catch (error) {
        console.error('获取群成员失败:', error);
      }
    };

    // 页面标题
    const pageTitle = computed(() => {
      switch (mode.value) {
        case 'add':
          return '添加成员';
        case 'remove':
          return '移除成员';
        default:
          return '群成员';
      }
    });

    // 选中的成员数量
    const selectedCount = computed(() => {
      return selectedContacts.value.length + selectedMembers.value.length;
    });

    // 群主信息
    const groupOwner = computed(() => {
      const currentGroup = groupStore.getMembersByGroupId(groupId.value);
      if (!currentGroup) return {
        userId: userStore.getUserId,
        nickName: userStore.userInfo.nickName,
        fileKey: userStore.userInfo.fileKey,
        role: 2
      };

      // 查找群主
      const owner = currentGroup.find(member => member.role === 2);
      if (!owner) return {
        userId: userStore.getUserId,
        nickName: userStore.userInfo.nickName,
        fileKey: userStore.userInfo.fileKey,
        role: 2
      };

      return {
        userId: owner.userId,
        nickName: owner.nickName,
        fileKey: owner.fileKey,
        role: owner.role
      };
    });

    // 群成员列表
    const groupMembers = computed(() => {
      const currentGroup = groupStore.getMembersByGroupId(groupId.value);
      if (!currentGroup) return [];
      return currentGroup.filter(member => member.userId !== userStore.getUserId);
    });

    // 过滤后的添加联系人列表
    const filteredAddContacts = computed(() => {
      const currentMemberIds = new Set(groupMembers.value.map(member => member.userId));
      return friendStore.friendList.filter(friend => !currentMemberIds.has(friend.userId));
    });

    // 过滤后的移除联系人列表
    const filteredRemoveContacts = computed(() => {
      return groupMembers.value;
    });

    // 按字母分组的添加联系人
    const groupedAddContacts = computed(() => {
      const groups: { letter: string; contacts: IFriendInfo[] }[] = [];
      const contacts = filteredAddContacts.value;

      contacts.forEach(contact => {
        const letter = contact.nickName.charAt(0).toUpperCase();
        let group = groups.find(g => g.letter === letter);
        if (!group) {
          group = { letter, contacts: [] };
          groups.push(group);
        }
        group.contacts.push(contact);
      });

      return groups.sort((a, b) => a.letter.localeCompare(b.letter));
    });

    // 切换选择状态
    const toggleSelect = (contact: IFriendInfo | IGroupMember) => {
      if (mode.value === 'add') {
        const index = selectedContacts.value.findIndex(c => c.userId === contact.userId);
        if (index === -1) {
          selectedContacts.value.push(contact as IFriendInfo);
        } else {
          selectedContacts.value.splice(index, 1);
        }
      } else {
        const index = selectedMembers.value.findIndex(m => m.userId === contact.userId);
        if (index === -1) {
          selectedMembers.value.push(contact as IGroupMember);
        } else {
          selectedMembers.value.splice(index, 1);
        }
      }
    };

    // 检查是否已选择
    const isSelected = (contact: IFriendInfo | IGroupMember) => {
      if (mode.value === 'add') {
        return selectedContacts.value.some(c => c.userId === contact.userId);
      } else {
        return selectedMembers.value.some(m => m.userId === contact.userId);
      }
    };

    // 确认添加
    const confirmAdd = async () => {
      if (selectedContacts.value.length === 0) return;
      const result = await groupMemberAddApi({
        groupId: groupId.value,
        userIds: selectedContacts.value.map(contact => contact.userId)
      });
      if (result.code === 0) {
        showToast('添加成功', 2000, 'success');
        // 强制更新群成员列表
        await groupStore.getGroupMembersApi(groupId.value, true);
        goBack();
      } else {
        showToast(result.msg || '添加失败');
      }

    };

    // 确认移除
    const confirmRemove = async () => {
      if (selectedMembers.value.length === 0) return;
      try {
        const result = await groupMemberRemoveApi({
          groupId: groupId.value,
          memberIds: selectedMembers.value.map(member => member.userId)
        });
        if (result.code !== 0) {
          showToast('移除失败');
          return;
        }
        showToast('移除成功', 2000, 'success');
        // 强制更新群成员列表
        await groupStore.getGroupMembersApi(groupId.value, true);
        goBack();
      } catch (error) {
        showToast('移除失败');
      }
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    onLoad((options) => {
      if (options?.id) {
        groupId.value = options.id;
        getGroupsMembers();
      }
      if (options?.mode) {
        mode.value = options.mode as 'add' | 'remove' | 'view';
      }
    });

    return {
      mode,
      searchText,
      selectedContacts,
      selectedMembers,
      pageTitle,
      selectedCount,
      groupOwner,
      groupMembers,
      filteredAddContacts,
      filteredRemoveContacts,
      groupedAddContacts,
      toggleSelect,
      isSelected,
      confirmAdd,
      confirmRemove,
      goBack
    }
  }
};
</script>

<style lang="scss" scoped>
.search-container {
  margin: 24rpx 32rpx;
  position: relative;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-input {
  width: 100%;
  height: 88rpx;
  background: #FFFFFF;
  border: none;
  border-radius: 24rpx;
  padding: 0 32rpx 0 88rpx;
  font-size: 28rpx;
  color: #2D3436;
  transition: all 0.3s cubic-bezier(0.33, 1, 0.68, 1);

  &:focus {
    outline: none;
    background: #F9FAFB;
  }
}

.search-icon {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);

  image {
    width: 40rpx;
    height: 40rpx;
    color: #B2BEC3;
  }
}

.contacts-list {
  background: #FFFFFF;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin: 0 32rpx;
}

.letter-index {
  padding: 16rpx 32rpx;
  background-color: #F9FAFB;
  font-size: 24rpx;
  font-weight: 500;
  color: #636E72;
}

.bottom-actions {
  padding: 24rpx 32rpx;
  height: 160rpx;
  background: #FFFFFF;
  box-sizing: border-box;
  border-top: 1px solid #EBEEF5;
}

.action-button {
  width: 100%;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);

  &:active {
    transform: translateY(2rpx);
  }

  &.confirm-add {
    background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(255, 125, 69, 0.15);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    }
  }

  &.confirm-remove {
    background: #FF5252;
    color: white;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(255, 82, 82, 0.15);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    }
  }

  &.no-selection {
    background: #EBEEF5;
    color: #B2BEC3;
    pointer-events: none;
  }
}
</style>
