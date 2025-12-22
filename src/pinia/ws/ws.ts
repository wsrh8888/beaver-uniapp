import type { IWsContent } from '@/types/ws/ws';
import type { IWsMessage } from '@/types/ws/command';
import { WsCommand } from '@/types/ws/command';
import { MessageType } from '@/types/ajax/chat';
import { defineStore } from 'pinia';
import { useMessageStore } from '../message/message';
import { useFriendStore } from '../friend/friend';
import { useConversationStore } from '../conversation/conversation';
import { useGroupStore } from '../group/group';
import { useUserStore } from '../user/user';

/**
 * @description: WebSocket消息管理
 */
export const useWsStore = defineStore('useWsStore', {
  /**
   * @description: WebSocket状态
   */
  state: (): IWsMessage => ({
    code: 0,
    command: WsCommand.CHAT_MESSAGE,
    content: {
      timestamp: 0,
      data: {
        type: '',
        body: {
          id: 0,
          conversationId: '',
          msg: {
            type: MessageType.TEXT,
            textMsg: {
              content: ''
            },
            imageMsg: null
          },
          sender: {
            userId: '',
            avatar: '',
            nickName: ''
          },
          created_at: '',
          msgPreview: ''
        }
      }
    }
  }),
  getters: {
  },
  actions: {
    /**
     * @description: 解析WebSocket消息
     * @param {IWsMessage} data - WebSocket消息数据
     */
    parseWsMessage(data: IWsMessage) {
      console.log('收到WebSocket消息:', data);
      
      switch (data.command) {
        case WsCommand.USER_PROFILE:
          this.parseUserProfile(data.content);
          break;
        case WsCommand.GROUP_OPERATION:
          this.parseGroupProfile(data.content);
          break
        case WsCommand.CHAT_MESSAGE:
          // messageId 应该在 content.messageId 中
          const messageId = (data.content as any).messageId || '';
          console.log('解析聊天消息, messageId:', messageId);
          this.parseCommonChatMessage(data.content, messageId);
          break;
        case WsCommand.FRIEND_OPERATION:
          this.parseUserProfile(data.content);
        // case WsCommand.HEARTBEAT:
        // case WsCommand.UPDATE_MESSAGE:
        //   this.parseCommonUpdateMessage(data.content);
          break;
        default:
          console.debug('Unhandled ws command:', data.command);
          break;
      }
    },
    async parseFriendProfile(content: IWsContent) {
      const friendStore = useFriendStore();
      const conversationStore = useConversationStore();

      switch (content.data.type) {
        case "friend_request_receive": {
          const userId = content.data.body.userId;
          // 更新会话列表
          conversationStore.updateBaseInfo({
            ...content.data.body
          } as any)
          
          // 好友列表增加该好友
          friendStore.updateFriendInfo(userId);
        }
        case "friend_update": {
          break;
        }
      }
    },
    async parseGroupProfile(content: IWsContent) {
      const conversationStore = useConversationStore();
      const groupStore = useGroupStore()
      const userStore = useUserStore()

      switch (content.data.type) {
        case "message_group_create": {
          // 更新最近会话列表
          // conversationStore.updateBaseInfo({
          //   ...content.data.body
          // } as any)
          // 通过群id获取群信息，并且追加到群列表中
          groupStore.updateGroupInfo(content.data.body.conversationId)
          // 通过会话id获取会话信息，并且追加到会话列表中
          conversationStore.updateConversationListByFriendId(content.data.conversationId)
          break;
        }
        case "group_update": {
          groupStore.updateGroupInfo(content.data.body.groupId)
          break;
        }
        case "group_member_update": {
          // 判断移除的是不是自己，如果不是自己则更新这个群的成员信息
          if (userStore.getUserId === content.data.body.memberId) {
            
          } else {
            // 更新这个群的成员信息
          }
          break
        }
      }

    },
    /**
     * @description: 解析用户信息更新消息
     * @param {IWsContent} content - 消息内容
     */
    async parseUserProfile(content: IWsContent) {
      const friendStore = useFriendStore();
      const conversationStore = useConversationStore();

      switch (content.data.type) {
        case "friend_request_receive": {
          // 更新好友信息
          await friendStore.updateFriendInfo(content.data.body.userId);
          await conversationStore.updateConversationListByFriendId(content.data.conversationId);
          break;
        }
        case "user_valid_type_update": {
          // 更新好友状态后刷新会话列表
          await friendStore.updateFriendInfo(content.data.body.sender.userId);
          await conversationStore.initRecentChatApi();
          break;
        }
      }
    },
        /**
     * @description: 解析聊天消息
     * @param {IWsContent} content - 消息内容
     */
    parseCommonChatMessage(content: IWsContent, messageId: string) {
      import('@/message-manager').then(({ messageManager }) => {
        switch (content.data.type) {
          case "private_message_send":
          case "group_message_send":
          case "private_message_sync":
          case "group_message_sync":
          case "private_message_receive":
          case "group_message_receive":
            // 使用消息管理器处理服务端消息（自动去重）
            messageManager.handleServerMessage({
              messageId,
              conversationId: content.data.body.conversationId,
              id: content.data.body.id,
              msg: content.data.body.msg,
              sender: content.data.body.sender,
              created_at: content.data.body.created_at
            });
            break;
        }
      });
    }
  },
});
