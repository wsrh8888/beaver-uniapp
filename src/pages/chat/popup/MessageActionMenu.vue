<template>
  <view class="message-action-menu" v-if="visible" @click="closeMenu">
    <view class="menu-overlay"></view>
    <view class="menu-container" :style="menuPosition" @click.stop>
      <view class="menu-content">
        <view class="menu-row">
          <view 
            v-for="item in firstRowItems" 
            :key="item.action"
            class="menu-item"
            :class="{ 'delete-item': item.color === '#FF3B30' }"
            @click="handleAction(item.action)"
          >
            <view class="menu-icon">
              <image :src="item.icon" mode="aspectFit" />
            </view>
            <text class="menu-text" :style="{ color: item.color }">{{ item.label }}</text>
          </view>
        </view>
        <view class="menu-row" v-if="secondRowItems.length > 0">
          <view 
            v-for="item in secondRowItems" 
            :key="item.action"
            class="menu-item"
            :class="{ 'delete-item': item.color === '#FF3B30' }"
            @click="handleAction(item.action)"
          >
            <view class="menu-icon">
              <image :src="item.icon" mode="aspectFit" />
            </view>
            <text class="menu-text" :style="{ color: item.color }">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { computed } from 'vue';
import { getMenuItems } from '../utils/menuConfig';

export default {
  name: 'MessageActionMenu',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    message: {
      type: Object,
      default: () => ({})
    },
    isMine: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    messageRect: {
      type: Object,
      default: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
    }
  },
  emits: ['close', 'delete'],
  setup(props, { emit }) {
    // 计算菜单项
    const menuItems = computed(() => {
      return getMenuItems(props.message.type, props.isMine);
    });

    // 分割为两行，每行最多5个
    const firstRowItems = computed(() => {
      const items = menuItems.value;
      return items.slice(0, 5);
    });

    const secondRowItems = computed(() => {
      const items = menuItems.value;
      return items.slice(5);
    });

    // 计算菜单位置
    const menuPosition = computed(() => {
      const { messageRect, isMine } = props;
      const { top, bottom, left, right } = messageRect;
      
      // 获取屏幕尺寸
      const systemInfo = uni.getSystemInfoSync();
      const screenHeight = systemInfo.screenHeight;
      const screenWidth = systemInfo.screenWidth;
      
      // 计算菜单位置
      let menuTop, menuLeft;
      
      // 垂直位置：优先显示在消息上方，空间不够则显示在下方
      const menuHeight = 160; // 预估菜单高度
      const spaceAbove = top;
      const spaceBelow = screenHeight - bottom;
      
      if (spaceAbove >= menuHeight + 20) {
        // 上方空间足够，显示在上方
        menuTop = top - menuHeight - 10;
      } else {
        // 上方空间不够，显示在下方
        menuTop = bottom + 10;
      }
      
      // 水平位置：根据消息位置对齐
      if (isMine) {
        // 发送者：菜单右边和头像左边对齐
        menuLeft = left - 20; // 头像左边位置
      } else {
        // 接收者：菜单左边和头像右边对齐
        menuLeft = right + 20; // 头像右边位置
      }
      
      // 确保菜单不超出屏幕边界
      const menuWidth = 500; // 预估菜单宽度
      if (menuLeft + menuWidth > screenWidth) {
        menuLeft = screenWidth - menuWidth - 20;
      }
      if (menuLeft < 20) {
        menuLeft = 20;
      }
      
      return {
        top: `${menuTop}px`,
        left: `${menuLeft}px`
      };
    });

    const closeMenu = () => {
      emit('close');
    };

    const handleAction = (action: string) => {
      // 在组件内部处理所有操作
      switch (action) {
        case 'copy':
          handleCopy();
          break;
        case 'preview':
          handlePreview();
          break;
        case 'save':
          handleSave();
          break;
        case 'add-emoji':
          handleAddToEmoji();
          break;
        case 'forward':
          handleForward();
          break;
        case 'reply':
          handleReply();
          break;
        case 'delete':
          handleDelete();
          break;
        case 'download':
          handleDownload();
          break;
        case 'share':
          handleShare();
          break;
      }
      closeMenu();
    };

    const handleCopy = () => {
      if (props.message.type === 1) {
        uni.setClipboardData({
          data: props.message.textMsg.content,
          success: () => {
            uni.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            });
          }
        });
      }
    };

    const handlePreview = () => {
      if (props.message.type === 2) {
        uni.previewImage({
          current: 0,
          urls: [props.message.imageMsg.fileKey]
        });
      } else if (props.message.type === 6) {
        uni.previewImage({
          current: 0,
          urls: [props.message.emojiMsg.fileKey]
        });
      }
    };

    const handleSave = () => {
      uni.showToast({
        title: '保存功能开发中',
        icon: 'none'
      });
    };

    const handleAddToEmoji = () => {
      uni.showToast({
        title: '添加表情功能开发中',
        icon: 'none'
      });
    };

    const handleForward = () => {
      uni.showToast({
        title: '转发功能开发中',
        icon: 'none'
      });
    };

    const handleReply = () => {
      uni.showToast({
        title: '回复功能开发中',
        icon: 'none'
      });
    };

    const handleDownload = () => {
      uni.showToast({
        title: '下载功能开发中',
        icon: 'none'
      });
    };

    const handleShare = () => {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      });
    };

    const handleDelete = () => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条消息吗？',
        success: (res) => {
          if (res.confirm) {
            emit('delete', props.message);
          }
        }
      });
    };

    return {
      menuItems,
      firstRowItems,
      secondRowItems,
      menuPosition,
      closeMenu,
      handleAction
    };
  }
};
</script>

<style lang="scss" scoped>
.message-action-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.menu-container {
  position: absolute;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  max-width: 90vw;
  width: 100%;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-content {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
  min-width: 500rpx;
  max-width: 90vw;
  margin: 0 24rpx;
  width: fit-content;
}

.menu-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  
  &:not(:last-child) {
    margin-bottom: 20rpx;
  }
  
  .menu-item {
    margin-right: 30rpx;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
  
  &:active {
    background: #F5F5F5;
    transform: scale(0.92);
  }
  
  &.delete-item {
    .menu-text {
      color: #FF3B30;
    }
    
    &:active {
      background: #FFF5F5;
    }
  }
}

.menu-icon {
  width: 36rpx;
  height: 36rpx;
  margin-bottom: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  image {
    width: 100%;
    height: 100%;
    filter: brightness(0.8);
  }
}

.menu-text {
  font-size: 20rpx;
  color: #333333;
  font-weight: 400;
  text-align: center;
  line-height: 1.2;
}
</style> 