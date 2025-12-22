<template>
  <view class="voice-recorder">
    <!-- 语音录制按钮 -->
    <view 
      class="voice-btn"
      :class="{ 'voice-btn-active': isRecording }"
      @touchstart.stop="startVoiceRecord"
      @touchend.prevent="endVoiceRecord"
      @touchmove.prevent="moveVoiceRecord"
    >
      <text>{{ voiceButtonText }}</text>
    </view>

    <!-- 语音录制提示 -->
    <view v-if="isRecording" class="voice-recording-modal">
      <view class="voice-recording-content">
        <image 
          class="voice-icon" 
          :src="isCancelVoice ? '/static/img/chat/voice-cancel.svg' : '/static/img/chat/voice-record.svg'" 
          mode="aspectFit" 
        />
        <view v-if="!isCancelVoice" class="voice-waves">
          <view class="wave" v-for="i in 3" :key="i"></view>
        </view>
        <text class="voice-tip">
          {{ isCancelVoice ? '松开手指，取消发送' : '松开发送，上滑取消' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';
import { MessageType } from '../types/store/message';
import { messageManager } from '@/message-manager';
import Logger from '@/logger/logger';
import { showToast } from '@/component/toast';
import { uploadFileApi } from '@/api/file';

export default {
  name: 'VoiceRecorder',
  props: {
    conversationId: {
      type: String,
      required: true
    }
  },
  emits: ['voiceRecorded'],
  setup(props, { emit }) {
    const logger = new Logger('语音录制组件');
    
    // 录音状态
    const isRecording = ref(false);
    const isCancelVoice = ref(false);
    const recorderManager = ref<any>(null);
    
    // 计算属性
    const voiceButtonText = computed(() => {
      if (isRecording.value) {
        return isCancelVoice.value ? '松开取消' : '松开发送';
      }
      return '按住说话';
    });

    // 开始录音
    const startVoiceRecord = () => {
      if (!recorderManager.value) return;
      
      try {
        isRecording.value = true;
        isCancelVoice.value = false;
        recorderManager.value.start({
          duration: 60000, // 最大录制时长60秒
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 192000,
          format: 'mp3'
        });
      } catch (error) {
        logger.error({
          text: '开始录音失败',
          data: {
            error: (error as any)?.message
          }
        });
        console.error('开始录音失败:', error);
        isRecording.value = false;
        showToast('录音启动失败', 2000, 'error');
      }
    };

    // 结束录音
    const endVoiceRecord = () => {
      if (!recorderManager.value || !isRecording.value) return;
      
      try {
        recorderManager.value.stop();
      } catch (error) {
        console.error('停止录音失败:', error);
      }
    };

    // 移动录音（用于取消）
    const moveVoiceRecord = (event: any) => {
      if (!isRecording.value) return;
      
      const touch = event.touches[0];
      const button = event.target.getBoundingClientRect();
      const buttonCenterY = button.top + button.height / 2;
      
      isCancelVoice.value = touch.clientY < buttonCenterY - 100;
    };

    // 上传语音文件
    const uploadVoiceFile = async (tempFilePath: string, duration: number): Promise<string> => {
      try {
        const result = await uploadFileApi(tempFilePath,  `voice_${Date.now()}.mp3`);
        return result.fileKey;
      } catch (error) {
        logger.error({
          text: '语音文件上传失败',
          data: {
            error: (error as any)?.message
          }
        });
        throw new Error('语音文件上传失败');
      }
    };

    // 发送语音消息
    const sendVoiceMessage = async (fileKey: string, duration: number) => {
      try {
        const messageId = await messageManager.getInstance().sendMessage(
          props.conversationId,
          { 
            fileKey, 
            duration: Math.round(duration / 1000) // 转换为秒
          },
          MessageType.VOICE
        );
        
        emit('voiceRecorded', { messageId, fileKey, duration });
        showToast('语音发送成功', 2000, 'success');
      } catch (error) {
        logger.error({
          text: '发送语音消息失败',
          data: {
            error: (error as any)?.message
          }
        });
        showToast('语音发送失败', 2000, 'error');
      }
    };

    // 初始化录音管理器
    const initRecorderManager = () => {
      try {
        recorderManager.value = uni.getRecorderManager();
        
        recorderManager.value.onStart(() => {
          console.log('录音开始');
        });

        recorderManager.value.onStop(async (res: any) => {
          console.log('录音结束');
          isRecording.value = false;
          
          if (isCancelVoice.value) {
            isCancelVoice.value = false;
            return;
          }
          
          const { tempFilePath, duration } = res;
          
          if (!tempFilePath || duration < 1000) {
            showToast('录音时间太短', 2000, 'warning');
            return;
          }
          
          try {
            showToast('正在上传语音文件...', 2000, 'info');
            
            // 上传语音文件
            const fileKey = await uploadVoiceFile(tempFilePath, duration);
            
            // 发送语音消息
            await sendVoiceMessage(fileKey, duration);
            
          } catch (error) {
            console.error('处理语音消息失败:', error);
            showToast('语音处理失败', 2000, 'error');
          }
        });

        recorderManager.value.onError((error: any) => {
          console.error('录音错误:', error);
          isRecording.value = false;
          isCancelVoice.value = false;
          showToast('录音出错', 2000, 'error');
        });

        recorderManager.value.onInterruptionBegin(() => {
          console.log('录音被中断开始');
        });

        recorderManager.value.onInterruptionEnd(() => {
          console.log('录音中断结束');
        });
      } catch (error) {
        console.error('初始化录音管理器失败:', error);
      }
    };

    // 生命周期
    onMounted(() => {
      initRecorderManager();
    });

    onBeforeUnmount(() => {
      if (recorderManager.value && isRecording.value) {
        recorderManager.value.stop();
      }
    });

    return {
      // 状态
      isRecording,
      isCancelVoice,
      
      // 计算属性
      voiceButtonText,
      
      // 方法
      startVoiceRecord,
      endVoiceRecord,
      moveVoiceRecord,
    };
  },
}
</script>

<style lang="scss" scoped>
.voice-recorder {
  position: relative;
}

.voice-btn {
  flex: 1;
  height: 72rpx;
  background: #F9FAFB;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #636E72;
  transition: all 0.2s ease;
  user-select: none;

  &.voice-btn-active {
    background: #FF7D45;
    color: white;
    transform: scale(0.98);
  }
}

.voice-recording-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.voice-recording-content {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 32rpx;
  padding: 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 240rpx;
}

.voice-icon {
  width: 96rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
}

.voice-waves {
  display: flex;
  margin-bottom: 24rpx;
  
  .wave {
    margin-right: 8rpx;
    
    &:last-child {
      margin-right: 0;
    }
  }
}

.wave {
  width: 8rpx;
  height: 32rpx;
  background: #FF7D45;
  border-radius: 4rpx;
  animation: wave 1s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.5);
  }
}

.voice-tip {
  color: white;
  font-size: 24rpx;
  text-align: center;
}
</style> 