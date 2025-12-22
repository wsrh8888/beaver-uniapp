<template>
  <view class="contact-item" @click="$emit('click', contact)">
    <view class="contact-avatar">
      <BeaverImage class="contact-avatar-img" :fileKey="contact.fileKey" mode="aspectFill" />
    </view>
    <view class="contact-info">
      <view class="contact-name">{{ contact.nickName || contact.nickName }}</view>
    </view>
    <view 
      v-if="showAction" 
      class="contact-action" 
      :class="{
        'add-btn': actionType === 'add',
        'remove-btn': actionType === 'remove',
        'active': isSelected
      }"
    >
      <image 
        class="contact-action-icon"
        :src="actionType === 'add' ? '/static/img/groupMember/add.svg' : '/static/img/groupMember/remove.svg'" 
        mode="aspectFill" 
      />
    </view>
  </view>
</template>

<script lang="ts">
import BeaverImage from '@/component/image/image.vue';

export default {
  name: 'ContactItem',
  components: {
    BeaverImage
  },
  props: {
    contact: {
      type: Object,
      required: true
    },
    showAction: {
      type: Boolean,
      default: false
    },
    actionType: {
      type: String as () => 'add' | 'remove',
      default: 'add'
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
};
</script>

<style lang="scss" scoped>
.contact-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  position: relative;
  transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);

  &:active {
    background: #F9FAFB;
  }

  &:after {
    content: '';
    position: absolute;
    left: 32rpx;
    right: 32rpx;
    bottom: 0;
    height: 2rpx;
    background: #EBEEF5;
  }

  &:last-child:after {
    display: none;
  }
}

.contact-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(74, 111, 161, 0.2);
  .contact-avatar-img {
    width: 96rpx;
    height: 96rpx;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
  }
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #2D3436;
}

.contact-action {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
  .contact-action-icon {
    width: 32rpx;
    height: 32rpx;
  }

  &:active {
    transform: scale(0.95);
  }

  &.add-btn {
    background: #F9FAFB;
    border: 2rpx dashed #B2BEC3;

    &.active {
      background: #FF7D45;
      border: none;

      image {
        color: white;
      }
    }
  }

  &.remove-btn {
    background: #F9FAFB;
    border: 2rpx dashed #B2BEC3;

    &.active {
      background: #FF5252;
      border: none;

      image {
        color: white;
      }
    }
  }

  image {
    width: 32rpx;
    height: 32rpx;
  }
}
</style> 