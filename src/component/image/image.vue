<template>
  <image
    :src="imageSrc"
    :mode="mode"
    :lazy-load="lazyLoad"
    :class="imageClass"
    :style="imageStyle"
    @load="$emit('load', $event)"
    @error="$emit('error', $event)"
    @click="$emit('click', $event)"
  />
</template>

<script lang="ts">
import { ref, watch, computed } from 'vue';
import { getFile} from '@/cache/file';
import { previewOnlineFileApi } from '@/api/file';

export default {
  name: 'BeaverImage',
  props: {
    fileKey: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      default: 'aspectFill'
    },
    lazyLoad: {
      type: Boolean,
      default: true
    },
    imageClass: {
      type: String,
      default: ''
    },
    imageStyle: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['load', 'error', 'click'],
  setup(props: any) {
    const imageSrc = ref('');
    
    // 检查当前平台
    const isH5 = computed(() => {
      // #ifdef H5
      return true;
      // #endif
      return false;
    });
    
    const updateImage = async () => {
      if (!props.fileKey) {
        imageSrc.value = '';
        return;
      }
      
      try {
        imageSrc.value = await getFile(props.fileKey);
      } catch (error) {
        console.error('加载图片失败:', error);
        // 降级到直接URL
        imageSrc.value = previewOnlineFileApi(props.fileKey);
      }
    };
    
    // 监听 fileKey 变化
    watch(() => props.fileKey, (newFileName, oldFileName) => {
      if (newFileName !== oldFileName) {
        updateImage();
      }
    }, { immediate: true });
    
    return { imageSrc };
  }
};
</script>

<style lang="scss" scoped>
// 可以添加一些默认样式
</style> 