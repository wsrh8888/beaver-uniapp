import { defineStore } from 'pinia';
import {
  groupMineApi,
  getGroupMembersApi,
  groupInfoApi,
} from '@/api/group';
import type {
  IGroupInfo,
  IGroupMember,
} from '@/types/ajax/group';
import { preloadFiles } from '@/cache/file';

import { useFriendStore } from '../friend/friend';

interface IMemberCache {
  memberList: IGroupMember[];
  lastUpdateTime: number;
}

export const useGroupStore = defineStore('useGroupStore', {
  state: (): {
    groupList: IGroupInfo[],
    groupMap: Map<string, IGroupInfo>,
    _memberMap: Map<string, IMemberCache>,
  } => ({
    /**
     * @description: 群组列表
     */
    groupList: [],
    /**
     * @description: 群组列表Map形式
     */
    groupMap: new Map(),
    /**
     * @description: 群成员Map，key为群组ID
     */
    _memberMap: new Map(),
  }),
  
  getters: {
    /**
     * @description: 根据群组ID获取群组信息
     * @param {string} groupId - 群组ID (实际上是conversationId)
     * @returns {IGroupInfo | undefined} 群组信息
     */
    getGroupById: (state) => (groupId: string): IGroupInfo => {
      const group = state.groupMap.get(groupId);
      if (!group) {
        console.error('当前群组Map keys:', groupId, state.groupMap);
      }
      return group;
    },
    
    /**
     * @description: 根据群组ID获取群成员列表
     * @param {string} groupId - 群组ID
     * @returns {IGroupMember[]} 群成员列表
     */
    getMembersByGroupId: (state) => (groupId: string): IGroupMember[] => {
      const cache = state._memberMap.get(groupId);
      if (!cache) return [];
    
      return cache.memberList
    },
  },
  
  actions: {
    reset() {
      this.groupList = [];
      this.groupMap = new Map();
      this._memberMap = new Map();
    },

    /**
     * @description: 预加载群组头像
     */
    async preloadGroupAvatars() {
      try {
        const fileNames = this.groupList
          .filter(group => group.avatar)
          .map(group => group.avatar!);
        
        if (fileNames.length > 0) {
          console.log('预加载群组头像:', fileNames.length, '张');
          await preloadFiles(fileNames);
        }
      } catch (error) {
        console.error('预加载群组头像失败:', error);
      }
    },
    
    /**
     * @description: 获取群组列表
     */
    async initGroupListApi() {
      try {
        const getGroupApi = await groupMineApi({
          page: 1,
          limit: 100
        });
        if (getGroupApi.code === 0 && getGroupApi.result?.list?.length > 0) {
          // 直接使用API返回的数据
          this.groupList = getGroupApi.result.list;
          console.log('群组列表加载成功，数量:', this.groupList.length);
          console.log('群组列表:', this.groupList);
          
          this.convertGroupListToMap();
          console.log('群组Map转换完成，Map大小:', this.groupMap.size);
          
          // 预加载群组头像
          await this.preloadGroupAvatars();
        }
      } catch (error) {
        console.error('Failed to initialize group list:', error);
        throw error;
      }
    },

    updateGroupInfo(groupId: string) {
      return groupInfoApi({ groupId }).then(res => {
        if (res.code === 0) {
          const groupInfo = res.result;
          
          // 获取现有的群组信息或创建新的
          const existingGroup = this.groupMap.get(groupId);
          const updatedGroup: IGroupInfo = {
            ...groupInfo,
            memberCount: existingGroup?.memberCount || groupInfo.memberCount,
          };
          
          this.groupMap.set(groupId, updatedGroup);
          
          // 更新 groupList 中的对应项
          const index = this.groupList.findIndex(group => group.conversationId === groupId);
          if (index !== -1) {
            this.groupList[index] = updatedGroup;
          } else {
            this.groupList.push(updatedGroup);
          }
          
          return res;
        }
        return res;
      }).catch(error => {
        console.error('Failed to update group info:', error);
        throw error;
      });
    },
    
    /**
     * @description: 将groupList转换为Map形式
     */
    convertGroupListToMap() {
      const groupMap = new Map();
      this.groupList?.forEach((group: IGroupInfo) => {
        groupMap.set(group.conversationId, group);
      });
      this.groupMap = groupMap;
    },

    /**
     * @description: 获取群成员列表
     * @param {string} groupId - 群组ID
     * @param {boolean} forceUpdate - 是否强制更新
     * @param {number} page - 页码，可选
     * @param {number} limit - 每页数量，可选
     */
    async getGroupMembersApi(groupId: string, forceUpdate = false, page?: number, limit?: number) {
      const cache = this._memberMap.get(groupId);
      const now = Date.now();

      if (cache && !forceUpdate && (now - cache.lastUpdateTime < 5 * 60 * 1000)) {
        return { code: 0, result: { list: this.getMembersByGroupId(groupId) } };
      }

      try {
        const res = await getGroupMembersApi({ groupId, page, limit });
        if (res.code === 0) {
          // 直接使用API返回的数据
          this._memberMap.set(groupId, {
            memberList: res.result.list,
            lastUpdateTime: now
          });
        }
        return res;
      } catch (error) {
        console.error('Failed to get group members:', error);
        throw error;
      }
    },

    /**
     * @description: 添加群成员
     * @param {string} groupId - 群组ID
     * @param {IGroupMember[]} members - 要添加的成员列表
     */
    addMembers(groupId: string, members: IGroupMember[]) {
      const cache = this._memberMap.get(groupId);
      if (cache) {
        cache.memberList.push(...members);
        cache.lastUpdateTime = Date.now();
      }
    },

    /**
     * @description: 移除群成员
     * @param {string} groupId - 群组ID
     * @param {string[]} memberIds - 要移除的成员ID列表
     */
    removeMembers(groupId: string, memberIds: string[]) {
      const cache = this._memberMap.get(groupId);
      if (cache) {
        cache.memberList = cache.memberList.filter(member => !memberIds.includes(member.userId));
        cache.lastUpdateTime = Date.now();
      }
    },

    /**
     * @description: 移除群组
     * @param {string} groupId - 群组ID
     */
    removeGroup(groupId: string) {
      // 从群组列表中移除
      this.groupList = this.groupList.filter(group => group.conversationId !== groupId);
      
      // 从群组Map中移除
      this.groupMap.delete(groupId);
      
      // 从成员Map中移除
      this._memberMap.delete(groupId);
      
      console.log('群组已移除:', groupId);
    },
  },
});

