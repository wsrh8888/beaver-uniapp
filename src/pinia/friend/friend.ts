import { defineStore } from 'pinia';
import { friendInfoApi, friendListApi } from '@/api/friend';
import type { IFriendInfo } from '@/types/ajax/friend';
import { preloadFiles } from '@/cache/file';

/**
 * @description: 好友信息管理
 */
export const useFriendStore = defineStore('friendStore', {
  state: (): {
    friendList: IFriendInfo[],
  } => ({
    /**
     * @description: 好友列表
     */
    friendList: [],
  }),
  
  getters: {
    /**
     * @description: 根据用户ID获取好友信息
     * @param {string} userId - 用户ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByUserId: (state) => {
      return (userId: string): IFriendInfo | undefined => {
        return state.friendList.find(friend => friend.userId === userId);
      };
    },

    /**
     * @description: 根据会话ID获取好友信息
     * @param {string} conversationId - 会话ID
     * @returns {IFriendInfo | undefined} 返回好友信息
     */
    getFriendByConversationId: (state) => {
      return (conversationId: string): IFriendInfo | undefined => {
        const friend = state.friendList.find(friend => friend.conversationId === conversationId);
        console.error('friendList:', state.friendList);
        console.error('friend:', friend);
        if (!friend) {
          console.error('好友信息未找到，conversationId:', conversationId);
        }
        return friend;
      };
    },
  },
  
  actions: {
    reset() {
      this.friendList = [];
    },

    /**
     * @description: 预加载好友头像
     */
    async preloadFriendAvatars() {
      try {
        const fileNames = this.friendList
          .filter(friend => friend.avatar)
          .map(friend => friend.avatar!);
        
        if (fileNames.length > 0) {
          console.log('预加载好友头像:', fileNames.length, '张');
          await preloadFiles(fileNames);
        }
      } catch (error) {
        console.error('预加载好友头像失败:', error);
      }
    },
    
    async updateFriendInfo(friendId: string) {
      try {
        const res = await friendInfoApi({ friendId });
        if (res.code === 0) {
          const friendInfo = res.result;
          
          const index = this.friendList.findIndex(
            item => item.userId === friendId
          );
          
          if (index !== -1) {
            this.friendList[index] = friendInfo;
          } else {
            this.friendList.push(friendInfo);
          }
          
          return friendInfo;
        }
      } catch (error) {
        console.error('Failed to update friend info:', error);
        throw error;
      }
    },

    async initFriendApi() {
      try {
        const res = await friendListApi({
          page: 1,
          limit: 1000,
        });
        if (res.code === 0) {
          // 直接使用API返回的数据
          this.friendList = res.result.list || [];
          
          // 预加载好友头像
          await this.preloadFriendAvatars();
        }
      } catch (error) {
        console.error('Failed to initialize friend list:', error);
        throw error;
      }
    },
  },
});
