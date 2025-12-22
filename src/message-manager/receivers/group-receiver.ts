import type { IWsMessage } from '@/types/ws/command';
import { WsType } from '@/types/ws/command';
import { useGroupStore } from '@/pinia/group/group';
import { useUserStore } from '@/pinia/user/user';

/**
 * @description: 群组操作接收器
 */
export class GroupReceiver {
  /**
   * @description: 获取群组 store
   */
  private get groupStore() {
    return useGroupStore();
  }

  /**
   * @description: 获取用户 store
   */
  private get userStore() {
    return useUserStore();
  }

  /**
   * @description: 处理群组操作
   * @param {IWsMessage} wsMessage - WebSocket 消息
   */
  handleGroupOperation(wsMessage: IWsMessage) {
    const { data } = wsMessage.content;
    
    switch (data.type) {
      case WsType.MESSAGE_GROUP_CREATE:
        this.handleGroupCreate(data.body);
        break;
      case WsType.GROUP_UPDATE:
        this.handleGroupUpdate(data.body);
        break;
      case WsType.GROUP_MEMBER_UPDATE:
        this.handleGroupMemberUpdate(data.body);
        break;
      default:
        console.warn('未处理的群组操作类型:', data.type);
    }
  }

  /**
   * @description: 处理群组创建
   * @param {any} createData - 创建数据
   */
  private handleGroupCreate(createData: any) {
    console.log('处理群组创建:', createData);
    this.groupStore.updateGroupInfo(createData.conversationId);
  }

  /**
   * @description: 处理群组更新
   * @param {any} updateData - 更新数据
   */
  private handleGroupUpdate(updateData: any) {
    console.log('处理群组更新:', updateData);
    this.groupStore.updateGroupInfo(updateData.groupId);
  }

  /**
   * @description: 处理群成员更新
   * @param {any} memberData - 成员数据
   */
  private handleGroupMemberUpdate(memberData: any) {
    console.log('处理群成员更新:', memberData);
    
    const { groupId, type, userIds, memberIds, operator, memberId, needFullInfo } = memberData;
    
    switch (type) {
      case 'add':
        // 处理添加成员通知（已存在的成员收到）
        console.log('群成员添加通知:', { groupId, userIds, operator });
        // 强制更新群成员列表
        this.groupStore.getGroupMembersApi(groupId, true);
        break;
        
      case 'joined':
        // 处理自己加入群组通知（新加入的成员收到）
        console.log('加入群组通知:', { groupId, operator, needFullInfo });
        if (needFullInfo) {
          // 新加入的成员需要获取完整的群组信息
          this.handleNewMemberJoined(groupId);
        } else {
          // 如果是自己加入，需要更新群组信息
          if (this.userStore.getUserId !== operator) {
            this.groupStore.updateGroupInfo(groupId);
          }
        }
        break;
        
      case 'leave':
        // 处理成员离开
        console.log('成员离开通知:', { groupId, userId: memberData.userId });
        // 强制更新群成员列表
        this.groupStore.getGroupMembersApi(groupId, true);
        break;
        
      default:
        // 处理移除成员或其他变动
        console.log('群成员变动通知:', memberData);
        // 检查是否自己被移除
        if (memberId && this.userStore.getUserId === memberId) {
          console.log('自己被移出群组:', groupId);
          // 从群组列表中移除该群组
          this.groupStore.removeGroup(groupId);
        } else {
          // 强制更新群成员列表
          this.groupStore.getGroupMembersApi(groupId, true);
        }
        break;
    }
  }

  /**
   * @description: 处理新成员加入群组
   * @param {string} groupId - 群组ID
   */
  private async handleNewMemberJoined(groupId: string) {
    try {
      console.log('新成员加入，开始获取完整群组信息:', groupId);
      
      // 1. 获取群组信息
      await this.groupStore.updateGroupInfo(groupId);
      
      // 2. 获取群成员列表
      await this.groupStore.getGroupMembersApi(groupId, true);
      
      // 3. 更新会话列表（这里可能需要调用会话相关的API）
      // 注意：会话列表的更新可能需要通过其他方式处理
      console.log('新成员加入群组完成，群组信息已更新:', groupId);
    } catch (error) {
      console.error('新成员加入群组时获取信息失败:', error);
    }
  }
} 