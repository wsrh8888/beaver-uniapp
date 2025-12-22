import { defineStore } from 'pinia';
import { chatHistoryApi } from '@/api/chat';
import type { IMessage } from '@/types/ajax/chat';
import { MessageStatus, MessageType } from '@/types/store/message';
import { useConversationStore } from '@/pinia/conversation/conversation';
import { preloadFiles } from '@/cache/file';
import Logger from '@/logger/logger';

/**
 * @description: 聊天消息管理
 */
export const useMessageStore = defineStore('useMessageStore', {
  state: () => ({
    /**
     * @description: 聊天记录缓存，key为会话ID
     */
    chatHistory: new Map<string, IMessage[]>(),
    
    /**
     * @description: 消息发送状态缓存，key为消息ID
     */
    messageSendingStatus: new Map<string, MessageStatus>(),
    
    /**
     * @description: 消息缓存，用于优化加载性能
     */
    messageCache: new Map<string, {
      timestamp: number;
      messages: IMessage[];
    }>(),
    
    /**
     * @description: 消息加载状态，用于控制加载动画
     */
    loadingStates: new Map<string, boolean>(),
    
    /**
     * @description: 已预加载的会话ID集合
     */
    preloadedConversations: new Set<string>(),
  }),

  getters: {
    /**
     * @description: 获取会话的聊天记录
     */
    getChatHistory: (state) => (conversationId: string) => 
      state.chatHistory.get(conversationId) || [],
  },

  actions: {
    /**
     * @description: 重置store状态
     */
    reset() {
      this.chatHistory.clear();
      this.messageSendingStatus.clear();
      this.messageCache.clear();
      this.loadingStates.clear();
      this.preloadedConversations.clear();
    },

    /**
     * @description: 从消息中提取图片fileName
     */
    extractImagefileNames(messages: IMessage[]): string[] {
      return messages
        .filter(msg => {
          // 图片消息 (type === 2)
          if (msg.msg.type === 2 && msg.msg.imageMsg?.fileKey) {
            return true;
          }
          // 表情消息 (type === 6)
          if (msg.msg.type === 6 && msg.msg.emojiMsg?.fileKey) {
            return true;
          }
          return false;
        })
        .map(msg => {
          if (msg.msg.type === 2) {
            return msg.msg.imageMsg!.fileKey;
          } else {
            return msg.msg.emojiMsg!.fileKey;
          }
        })
        .filter(Boolean);
    },

    /**
     * @description: 预加载聊天记录中的图片（只在第一次加载时）
     */
    async preloadChatImages(conversationId: string, messages: IMessage[]) {
      // 如果已经预加载过，跳过
      if (this.preloadedConversations.has(conversationId)) {
        return;
      }
      
      try {
        const imagefileNames = this.extractImagefileNames(messages);
        if (imagefileNames.length > 0) {
          console.log('预加载聊天图片:', conversationId, imagefileNames.length, '张');
          await preloadFiles(imagefileNames);
          
          // 标记为已预加载
          this.preloadedConversations.add(conversationId);
        }
      } catch (error) {
        const logger = new Logger('消息管理');
        logger.error({
          text: '预加载聊天图片失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            conversationId
          }
        });
        console.error('预加载聊天图片失败:', error);
      }
    },

    /**
     * @description: 加载聊天记录
     * @param {string} conversationId - 会话ID
     * @param {boolean} useCache - 是否使用缓存
     */
    async loadChatHistory(conversationId: string, useCache: boolean = true) {
      const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
      
      if (useCache) {
        const cached = this.messageCache.get(conversationId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          this.chatHistory.set(conversationId, cached.messages);
          // 预加载缓存的图片（只在第一次）
          await this.preloadChatImages(conversationId, cached.messages);
          return;
        }
      }

      try {
        this.loadingStates.set(conversationId, true);
        const res = await chatHistoryApi({ conversationId, limit: 100 });
        
        if (res.code === 0) {
          // 直接使用API返回的数据，只反转顺序
          const messages = (res.result.list || []).reverse();
          
          this.chatHistory.set(conversationId, messages);
          this.messageCache.set(conversationId, {
            timestamp: Date.now(),
            messages: messages
          });

          // 预加载新加载的图片（只在第一次）
          await this.preloadChatImages(conversationId, messages);
        }
      } catch (error) {
        const logger = new Logger('消息管理');
        logger.error({
          text: '加载聊天记录失败',
          data: {
            error: error instanceof Error ? error.message : String(error),
            conversationId
          }
        });
        console.error('Failed to load chat history:', error);
        throw error;
      } finally {
        this.loadingStates.set(conversationId, false);
      }
    },

    /**
     * @description: 添加新消息
     * @param {string} conversationId - 会话ID
     * @param {IMessage} message - 消息内容
     */
    addMessage(conversationId: string, message: IMessage) {
      const history = this.chatHistory.get(conversationId) || [];
      history.push(message);
      this.chatHistory.set(conversationId, history);

      // 更新会话列表的最新消息
      const conversationStore = useConversationStore();
      conversationStore.updateLastMessage(conversationId, {
        content: message.msg.textMsg?.content || '',
        timestamp: message.created_at
      });
    },

    /**
     * @description: 更新消息状态
     * @param {number} id - 消息ID
     * @param {MessageStatus} status - 消息状态
     */
    updateMessageStatus(id: number, status: MessageStatus) {
      this.messageSendingStatus.set(id.toString(), status);
    },

    /**
     * @description: 加载更多消息
     * @param {string} conversationId - 会话ID
     */
    async loadMoreMessages(conversationId: string) {
      if (this.loadingStates.get(conversationId)) {
        return;
      }

      this.loadingStates.set(conversationId, true);
      try {
        const currentMessages = this.chatHistory.get(conversationId) || [];
        const oldestMessageId = currentMessages[0]?.id;
        
        const res = await chatHistoryApi({ 
          conversationId,
          page: 1,
          limit: 20
        });

        if (res.code === 0) {
          // 直接使用API返回的数据
          const newMessages = res.result.list || [];
          
          this.chatHistory.set(conversationId, [...newMessages, ...currentMessages]);

          // 加载更多消息时也预加载图片（只在第一次）
          await this.preloadChatImages(conversationId, newMessages);
        }
      } catch (error) {
        console.error('Failed to load more messages:', error);
      } finally {
        this.loadingStates.set(conversationId, false);
      }
    },
  },
});
