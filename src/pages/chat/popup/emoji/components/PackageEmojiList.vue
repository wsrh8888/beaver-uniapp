<template>
  <view class="emoji-list">
    <view 
      v-for="(emoji, index) in emojis" 
      :key="index" 
      class="emoji-item" 
      @tap="addEmoji(emoji)"
    >
      <image class="emoji-icon" :src="getImageUrl(emoji.fileKey)" mode="aspectFit" />
      <text class="emoji-name">{{ emoji.title || '表情' }}</text>
    </view>
  </view>
</template>

<script lang="ts">
import { previewOnlineFileApi } from '@/api/file'
import { usePageChatStore } from '@/pinia/page/pageChat/pageChat'
import { MessageType } from '../../../../../types/store/message'

export default {
  name: 'PackageEmojiList',
  props: {
    emojis: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const pageChatStore = usePageChatStore();

    // 处理图片URL
    const getImageUrl = (fileKey: string) => {
      if (!fileKey) return ''
      if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
        return fileKey
      }
      return previewOnlineFileApi(fileKey)
    }

    const addEmoji = (emoji: any) => {
      // 表情包表情直接发送表情消息
      const emojiData = {
        fileKey: emoji.fileKey || emoji.file_id,
        emojiId: emoji.emojiId || emoji.emoji_id || emoji.id,
        packageId: emoji.packageId || emoji.package_id
      }
      
      pageChatStore.sendMessage(emojiData, MessageType.EMOJI)
    }

    return {
      getImageUrl,
      addEmoji
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-list {
  display: flex;
  flex-wrap: wrap;
  padding: 16rpx 0;
}

.emoji-item {
  width: 140rpx;
  height: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 16rpx;
  border-radius: 16rpx;
  transition: all 0.2s;
  background: transparent;

  &:active {
    background: rgba(0, 0, 0, 0.05);
    transform: scale(0.95);
  }
}

.emoji-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.emoji-name {
  font-size: 22rpx;
  color: #666;
  text-align: center;
  line-height: 1.2;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style> 