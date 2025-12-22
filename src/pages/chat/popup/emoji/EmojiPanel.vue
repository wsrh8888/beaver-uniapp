<template>
  <view class="emoji-popup"  :style="{ height: emojiHeight + 'rpx' }">
    <!-- 表情内容区域 -->
    <!-- <view class="emoji-content-wrapper" :style="{ height: emojiHeight + 'rpx' }"></view> -->
    <scroll-view 
      scroll-y 
      class="emoji-content" 
      :scroll-top="scrollTop"
      @scroll="onScroll"
      :style="{ height: (emojiHeight -134) + 'rpx' }"
    >
      <!-- 表情包详情 -->
      <view v-if="currentView === 'package-detail'" class="package-detail">
        <PackageEmojiList 
          :emojis="currentPackageEmojis" 
          @addEmoji="addEmoji"
        />
      </view>

      <!-- 收藏表情列表 -->
      <view v-else-if="currentView === 'favorite-emojis'" class="favorite-emojis">
        <EmojiList 
          :emojis="favoriteEmojis" 
          @addEmoji="addEmoji"
        />
      </view>

      <!-- 默认表情 -->
      <view v-else class="default-emojis">
        <DefaultEmojiList 
          :emojis="defaultEmojis" 
          @addEmoji="addEmoji"
        />
      </view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <view class="emoji-tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item"
        :class="{ active: currentTab === index }"
        @tap="switchTab(index)"
      >
        <image v-if="index === 0" class="tab-icon" src="/static/emoji/add.svg" mode="aspectFit" />
        <image v-else-if="index === 1" class="tab-icon" src="/static/emoji/default.svg" mode="aspectFit" />
        <image v-else-if="index === 2" class="tab-icon" src="/static/emoji/favorite.svg" mode="aspectFit" />
        <image v-else class="tab-icon" :src="getImageUrl(tab.icon)" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { emojiList } from '@/utils/emoji'
import { usePageChatStore } from '@/pinia/page/pageChat/pageChat'
import {
  getEmojisListApi,
  getEmojiPackagesApi,
  getEmojiPackageDetailApi,
  updateFavoriteEmojiPackageApi,
  getUserFavoritePackagesApi
} from '@/api/emoji'
import { previewOnlineFileApi } from '../../../../api/file'
import type { IEmojiItem, IEmojiPackageItem } from '@/types/ajax/emoji'
import DefaultEmojiList from './components/DefaultEmojiList.vue'
import EmojiList from './components/EmojiList.vue'
import PackageEmojiList from './components/PackageEmojiList.vue'

export default {
  name: 'EmojiPopup',
  components: {
    DefaultEmojiList,
    EmojiList,
    PackageEmojiList
  },
  emits: ['addEmoji', 'openEmojiStore'],
  setup(props, { emit }) {
    // 注入聊天状态
    const chatState = inject<any>('chatState')
    const pageChatStore = usePageChatStore()

    // 响应式数据
    const currentTab = ref(0)
    const currentView = ref('default-emojis')
    const currentPackage = ref<IEmojiPackageItem | null>(null)
    const favoriteEmojis = ref<IEmojiItem[]>([])
    const emojiPackages = ref<IEmojiPackageItem[]>([])
    const userFavoritePackages = ref<IEmojiPackageItem[]>([])
    const scrollTop = ref(0)

    // 默认表情
    const defaultEmojis = computed(() => emojiList)

    // 当前表情包的表情列表
    const currentPackageEmojis = computed(() => {
      return currentPackage.value?.emojis || []
    })

    // 底部导航栏
    const tabs = computed(() => [
      {
        icon: '/static/emoji/add.svg',
        view: 'emoji-store',
        title: '表情包商城'
      },
      {
        icon: '/static/emoji/default.svg',
        view: 'default-emojis',
        title: '默认表情'
      },
      {
        icon: '/static/emoji/favorite.svg',
        view: 'favorite-emojis',
        title: '我的收藏'
      },
      ...userFavoritePackages.value.map(pkg => ({
        icon: pkg.coverFile,
        view: 'package-detail',
        title: pkg.title,
        packageId: pkg.packageId
      }))
    ])

    // 表情面板高度
    const emojiHeight = computed(() => pageChatStore.emojiHeight)

    // 处理图片URL
    const getImageUrl = (fileKey: string) => {
      return previewOnlineFileApi(fileKey)
    }

    // 滚动事件处理
    const onScroll = (e: any) => {
      scrollTop.value = e.detail.scrollTop
    }

    // 重置滚动位置
    const resetScroll = () => {
      scrollTop.value = 0
    }

    // 切换底部导航
    const switchTab = async (index: number) => {
      currentTab.value = index
      const tab = tabs.value[index]
      
      if (tab.view === 'emoji-store') {
        // 触发打开表情包商城事件
        emit('openEmojiStore')
        return
      } else if (tab.view === 'default-emojis') {
        currentView.value = 'default-emojis'
        resetScroll()
      } else if (tab.view === 'favorite-emojis') {
        currentView.value = 'favorite-emojis'
        await loadFavoriteEmojis()
        resetScroll()
      } else if (tab.view === 'package-detail') {
        await openPackage(tab)
        resetScroll()
      }
    }

    // 加载收藏表情
    const loadFavoriteEmojis = async () => {
      try {
        const res = await getEmojisListApi({ page: 1, size: 50 })
        // 按时间倒序排列，最新的在前面
        favoriteEmojis.value = (res.result.list || []).sort((a: any, b: any) => {
          return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
        })
      } catch (error) {
        console.error('加载收藏表情失败:', error)
      }
    }

    // 加载表情包列表
    const loadEmojiPackages = async () => {
      try {
        const res = await getEmojiPackagesApi({ page: 1, size: 20 })
        emojiPackages.value = res.result.list || []
      } catch (error) {
        console.error('加载表情包列表失败:', error)
      }
    }

    // 加载用户收藏的表情包
    const loadUserFavoritePackages = async () => {
      try {
        const res = await getUserFavoritePackagesApi({ page: 1, size: 10 })
        // 按时间倒序排列，最新的在前面
        userFavoritePackages.value = (res.result.list || []).sort((a: any, b: any) => {
          return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime()
        })
      } catch (error) {
        console.error('加载用户收藏表情包失败:', error)
      }
    }

    // 打开表情包详情
    const openPackage = async (packageItem: any) => {
      try {
        const res = await getEmojiPackageDetailApi({ packageId: packageItem.packageId })
        currentPackage.value = res.result
        currentView.value = 'package-detail'
      } catch (error) {
        console.error('加载表情包详情失败:', error)
      }
    }

    // 切换表情包收藏状态
    const togglePackageFavorite = async (pkg?: IEmojiPackageItem) => {
      const targetPackage = pkg || currentPackage.value
      if (!targetPackage) return
      
      try {
        const type = targetPackage.isCollected ? 'unfavorite' : 'favorite'
        await updateFavoriteEmojiPackageApi({
          packageId: targetPackage.packageId,
          type
        })
        
        // 更新状态
        targetPackage.isCollected = !targetPackage.isCollected
        
        // 重新加载收藏列表
        await loadUserFavoritePackages()
      } catch (error) {
        console.error('切换收藏状态失败:', error)
      }
    }

    // 添加表情到输入框
    const addEmoji = (emoji: any) => {
      const emojiText = emoji.name || emoji.title || '[表情]'
      emit('addEmoji', emojiText)
    }

    // 组件挂载时加载数据
    onMounted(async () => {
      await Promise.all([
        loadFavoriteEmojis(),
        loadEmojiPackages(),
        loadUserFavoritePackages()
      ])
    })

    return {
      currentTab,
      currentView,
      currentPackage,
      favoriteEmojis,
      emojiPackages,
      userFavoritePackages,
      defaultEmojis,
      currentPackageEmojis,
      tabs,
      emojiHeight,
      scrollTop,
      getImageUrl,
      onScroll,
      resetScroll,
      switchTab,
      loadFavoriteEmojis,
      loadEmojiPackages,
      loadUserFavoritePackages,
      openPackage,
      togglePackageFavorite,
      addEmoji
    }
  }
}
</script>

<style lang="scss" scoped>
.emoji-popup {
  background: #FFFFFF;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.emoji-content {
  flex: 1;
  padding: 0 10rpx;
  overflow-y: auto;
  box-sizing: border-box;
}

// 底部导航栏
.emoji-tabs {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #F8F9FA;
  border-top: 2rpx solid #E9ECEF;
  overflow-x: auto;
  height: 100rpx;
  
  .tab-item {
    margin-right: 16rpx;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.tab-item {
  flex-shrink: 0;
  width: 88rpx;
  height: 88rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
  color: #636E72;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  &.active {
    background: rgba(255, 125, 69, 0.1);
    color: #FF7D45;
    transform: scale(1.05);
    box-shadow: 0 4rpx 12rpx rgba(255, 125, 69, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 8rpx;
}
</style>