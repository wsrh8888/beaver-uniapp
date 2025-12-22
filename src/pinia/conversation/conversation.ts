import { defineStore } from 'pinia';
import { conversationInfoApi, recentChatListApi } from '@/api/chat';
import type { IChatInfo } from '@/types/ajax/chat';

import { useFriendStore } from '../friend/friend';
import { useGroupStore } from '../group/group';

/**
 * @description: 会话管理
 */
export const useConversationStore = defineStore('useConversationStore', {
  state: () => ({
    /**
     * @description: 最近会话列表
     */
    _recentChatList: [] as IChatInfo[],
    /**
     * @description: 当前选中的会话ID
     */
    currentChatId: null as string | null
  }),

  getters: {
    getRecentChatList: (state) => () => {
      return state._recentChatList.sort((a, b) => {
        // 置顶的排在前面
        if (a.is_top !== b.is_top) return b.is_top ? 1 : -1;
        // 按最后消息时间排序
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }).map(recentChatInfo => {
        // 判断是不是群组
        const groupStore = useGroupStore();
        
        if (recentChatInfo.chatType === 1) {
          // 私聊，直接返回
          return recentChatInfo;
        } else {
          // 群聊，更新群组信息
          const groupInfo = groupStore.getGroupById(recentChatInfo.conversationId);
          if (groupInfo) {
            return {
              ...recentChatInfo,
              nickName: groupInfo.title,
              avatar: groupInfo.avatar
            };
          }
        }
        
        return recentChatInfo;
      });
    },
      
    /**
     * @description: 获取会话信息
     * @param {string} conversationId - 会话ID
     * @return {IChatInfo | null} 会话信息
     */
    getConversationInfo: (state) => (conversationId: string) => {
      // 先从最近会话列表中查找
      const conversation = state._recentChatList.find(
        chat => chat.conversationId === conversationId
      );
      
      if (conversation) {
        return conversation;
      }
      
      // 如果在最近会话列表中找不到，则从好友列表或群组列表中获取基本信息
      const friendStore = useFriendStore();
      const groupStore = useGroupStore();
      
      // 尝试从好友列表中获取
      const friendInfo = friendStore.getFriendByConversationId(conversationId);
      if (friendInfo) {
        return {
          conversationId: friendInfo.conversationId,
          avatar: friendInfo.avatar,
          nickName: friendInfo.nickName,
          updated_at: new Date().toISOString(),
          is_top: false,
          msg_preview: '',
          chatType: 1
        } as IChatInfo;
      }
      
      // 尝试从群组列表中获取
      const groupInfo = groupStore.getGroupById(conversationId);
      if (groupInfo) {
        return {
          conversationId: groupInfo.conversationId,
          avatar: groupInfo.avatar,
          nickName: groupInfo.title,
          updated_at: new Date().toISOString(),
          is_top: false,
          msg_preview: '',
          chatType: 2
        } as IChatInfo;
      }
      
      return null;
    }
  },

  actions: {
    reset() {
      this._recentChatList = [];
      this.currentChatId = null;
    },

    /**
     * @description: 获取最近会话列表
     */
    async initRecentChatApi() {
      try {
        const res = await recentChatListApi({});
        if (res.code === 0) {
          // 直接使用API返回的数据
          this._recentChatList = (res.result.list || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent chats:', error);
        throw error;
      }
    },

    updateConversationListByFriendId(conversationId: string) {
      conversationInfoApi({ conversationId })
        .then(res => {
          if (res.code === 0 && res.result) {
            const conversationInfo = res.result;
            
            // Check if the conversation already exists in the list
            const existingIndex = this._recentChatList.findIndex(
              chat => chat.conversationId === conversationInfo.conversationId
            );
            
            if (existingIndex !== -1) {
              // Update existing conversation
              this._recentChatList[existingIndex] = {
                ...this._recentChatList[existingIndex],
                ...conversationInfo
              };
            } else {
              // Add new conversation to the top of the list
              this._recentChatList.unshift(conversationInfo);
            }
          } else {
            console.error('Failed to get conversation info:', res.msg);
          }
        })
        .catch(error => {
          console.error('Error fetching conversation info:', error);
        });
    },

    /**
     * @description: 更新会话基本信息
     */
    updateBaseInfo(data: IChatInfo) {
      const index = this._recentChatList.findIndex(
        item => item.conversationId === data.conversationId
      );
      
      if (index !== -1) {
        this._recentChatList[index] = {
          ...this._recentChatList[index],
          ...data
        };
      } else {
        // 数组第一项追加
        this._recentChatList.unshift(data);
      }
    },

    /**
     * @description: 设置当前会话
     */
    setCurrentChat(conversationId: string) {
      this.currentChatId = conversationId;
      // 清除未读计数 - 注意：API 类型中没有 unread_count 字段
      // 如果需要未读计数功能，需要在 API 类型中添加该字段
    },

    /**
     * @description: 切换会话置顶状态
     */
    toggleTopChat(conversationId: string) {
      const chatIndex = this._recentChatList.findIndex(
        chat => chat.conversationId === conversationId
      );
      if (chatIndex !== -1) {
        this._recentChatList[chatIndex].is_top = !this._recentChatList[chatIndex].is_top;
        // 重新排序列表，确保置顶的会话在前面
        this._recentChatList.sort((a, b) => {
          // 置顶的排在前面
          if (a.is_top !== b.is_top) return b.is_top ? 1 : -1;
          // 按最后消息时间排序
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      }
    },

    /**
     * @description: 更新最后一条消息
     */
    updateLastMessage(conversationId: string, message: { content: string, timestamp: string }) {
      const chatIndex = this._recentChatList.findIndex(
        chat => chat.conversationId === conversationId
      );
      if (chatIndex !== -1) {
        this._recentChatList[chatIndex].msg_preview = message.content;
        this._recentChatList[chatIndex].updated_at = message.timestamp;
      }
    },
  },
});
