<template>
  <view class="feedback-page">
    <BeaverLayout
      title="意见反馈"
      :show-background="false"
      @back="goBack"
    >
      <!-- 主卡片 -->
      <view class="main-card fade-in">
        <!-- 反馈类型选择 -->
        <view class="section">
          <text class="section-title">反馈类型</text>
          <view class="feedback-types">
            <view 
              v-for="type in feedbackTypes" 
              :key="type.value"
              class="feedback-type"
              :class="{ selected: selectedType === type.value }"
              @tap="selectFeedbackType(type.value)"
            >
              {{ type.label }}
            </view>
          </view>
        </view>

        <!-- 反馈内容 -->
        <view class="section">
          <view class="form-group">
            <text class="form-label">问题描述</text>
            <textarea
              class="form-control"
              v-model="content"
              placeholder="请详细描述您遇到的问题或建议..."
              :maxlength="500"
              @input="updateCharCount"
            />
            <view class="input-footer">
              <text class="char-count">{{ charCount }}/500</text>
            </view>
          </view>
        </view>

        <!-- 图片上传 -->
        <view class="upload-section">
          <view class="upload-title">
            <text class="upload-label">添加截图</text>
            <text class="upload-optional">选填，最多3张</text>
          </view>
          <view class="image-upload-container">
            <!-- 图片预览 -->
            <view 
              v-for="(item, index) in uploadedImages" 
              :key="index"
              class="image-preview"
            >
              <image :src="item.fileKey" mode="aspectFill" />
              <view class="remove-image" @click="removeImage(index)">×</view>
            </view>
            
            <!-- 上传按钮 -->
            <view 
              v-if="uploadedImages.length < 3"
              class="image-upload-box"
              @click="chooseImage"
            >
              <image src="@/static/img/feedback/upload.svg" mode="aspectFit" />
              <text class="image-upload-text">上传图片</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="button-container">
        <view 
          class="submit-btn"
          :class="{ disabled: !canSubmit }"
          @click="submitFeedback"
        >
          提交反馈
        </view>
      </view>
    </BeaverLayout>


  </view>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import BeaverLayout from '@/component/layout/layout.vue';
import Logger from '@/logger/logger';
import { showToast } from '@/component/toast';

interface UploadedImage {
  fileKey: string;
  name: string;
}

interface ImageFile {
  path: string;
  size: number;
}

export default {
  name: 'Feedback',
  components: {
    BeaverLayout
  },
  setup() {
    const feedbackTypes = [
      { label: '功能异常', value: 1},
      { label: '功能建议', value: 2 },
      { label: '使用体验', value: 3 },
      { label: '其他问题', value: 4}
    ];

    const selectedType = ref<number | null>(null);
    const content = ref('');
    const charCount = ref(0);
    const uploadedImages = ref<UploadedImage[]>([]);

    const canSubmit = computed(() => {
      return selectedType.value !== null && content.value.trim().length > 0;
    });

    const goBack = () => {
      uni.navigateBack();
    };

    const selectFeedbackType = (type: number) => {
      selectedType.value = type;
    };

    const updateCharCount = () => {
      charCount.value = content.value.length;
    };

    const chooseImage = async () => {
      try {
        const remainingCount = 3 - uploadedImages.value.length;
        if (remainingCount <= 0) return;

        // 这里应该调用实际的上传逻辑
        // const results = await uploadFiles({
        //   count: remainingCount,
        //   sizeType: ['compressed'],
        //   sourceType: ['album', 'camera']
        // });
        // uploadedImages.value.push(...results);
        
        showToast('图片上传功能待实现', 2000, 'none');
      } catch (error) {
        const logger = new Logger('意见反馈');
        logger.error({
          text: '上传图片失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        showToast('上传图片失败，请重试', 2000, 'error');
      }
    };

    const removeImage = (index: number) => {
      uploadedImages.value.splice(index, 1);
    };



    const submitFeedback = async () => {
      if (!canSubmit.value) return;

      try {
        const fileNames = uploadedImages.value.map(image => image.fileKey);
        // 这里应该调用实际的提交API
        // const submit = await submitFeedbackApi({
        //   content: content.value,
        //   type: selectedType.value,
        //   fileNames
        // });
        // if (submit.code === 0) {
        //   goBack()
        // }
        
        showToast('提交成功！', 2000, 'success');
        setTimeout(() => {
          goBack();
        }, 1500);

      } catch (error) {
        const logger = new Logger('意见反馈');
        logger.error({
          text: '提交反馈失败',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        showToast('提交失败，请稍后重试', 2000, 'error');
      }
    };

    return {
      feedbackTypes,
      selectedType,
      content,
      charCount,
      uploadedImages,
      canSubmit,
      goBack,
      selectFeedbackType,
      updateCharCount,
      chooseImage,
      removeImage,
      submitFeedback
    };
  }
};
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
}

/* 主卡片 */
.main-card {
  background-color: #FFFFFF;
  border-radius: 32rpx;
  margin: 5rpx 32rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.08);
  box-sizing: border-box;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.section {
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 24rpx;
  display: block;
}

/* 反馈类型 */
.feedback-types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.feedback-type {
  height: 88rpx;
  border-radius: 20rpx;
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 28rpx;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  cursor: pointer;

  &.selected {
    background-color: rgba(255, 125, 69, 0.1);
    color: #FF7D45;
    font-weight: 600;
    border-color: #FF7D45;
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 文本区域 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #2D3436;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 28rpx 32rpx;
  border-radius: 20rpx;
  border: 2rpx solid #e9ecef;
  background-color: #f8f9fa;
  font-size: 28rpx;
  color: #333333;
  height: 280rpx;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #FF7D45;
    background-color: #ffffff;
    box-shadow: 0 0 0 4rpx rgba(255, 125, 69, 0.1);
  }
}

.input-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16rpx;
}

.char-count {
  font-size: 24rpx;
  color: #B2BEC3;
}

/* 图片上传 */
.upload-section {
  margin-bottom: 28rpx;
}

.upload-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.upload-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.upload-optional {
  font-size: 24rpx;
  color: #B2BEC3;
}

.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.image-upload-box {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #dee2e6;
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    background-color: #e9ecef;
    transform: scale(0.98);
  }

  image {
    width: 48rpx;
    height: 48rpx;
    margin-bottom: 12rpx;
    opacity: 0.6;
  }
}

.image-upload-text {
  font-size: 24rpx;
  color: #B2BEC3;
}

.image-preview {
  width: 180rpx;
  height: 180rpx;
  border-radius: 20rpx;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.12);
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.remove-image {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background-color: rgba(0,0,0,0.7);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;

  &:active {
    background-color: rgba(0,0,0,0.8);
    transform: scale(0.9);
  }
}

/* 底部按钮区 */
.button-container {
  display: flex;
  padding: 0 32rpx;
}

.submit-btn {
  flex: 1;
  height: 96rpx;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  box-shadow: 0 12rpx 24rpx rgba(255, 125, 69, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    transform: translateY(4rpx) scale(0.98);
    box-shadow: 0 6rpx 12rpx rgba(255, 125, 69, 0.2);
  }

  &.disabled {
    background: #CCCCCC;
    box-shadow: none;
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 提示框 */
.toast {
  position: fixed;
  bottom: 160rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 24rpx 48rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #FFFFFF;
  border-radius: 48rpx;
  font-size: 28rpx;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1000;

  &.show {
    opacity: 1;
  }
}

/* 动画 */
.fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
