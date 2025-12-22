<template>
  <BeaverLayout
    title="编辑个人资料"
    :show-back="true"
    :scrollable="true"
    :scroll-y="true"
    :show-scrollbar="false"
    @back="goBack"
  >
  <!-- 安全距离 -->
    <view class="safe-area"></view>
    <!-- 头像上传 -->
    <view class="avatar-upload" @click="chooseAvatar">
      <view class="avatar-container">
        <beaver-image 
          :file-name="userInfo.fileKey" 
          id="avatar-preview" 
          mode="aspectFill"
        ></beaver-image>
        <view class="edit-icon">更换</view>
      </view>
      <view class="avatar-label">点击更换头像</view>
    </view>
    
    <!-- 个人信息列表 -->
    <view class="info-list">
      <view class="info-item" @click="openModal('nickName')">
        <view class="info-label">昵称</view>
        <view class="info-content" id="nickName-display">{{ userInfo.nickName }}</view>
        <view class="arrow-icon">
          <image src="@/static/img/common/arrow-right.svg" mode="aspectFit"></image>
        </view>
      </view>
      <!-- 个人简介 - 特殊处理允许预览 -->
      <view class="info-description" @click="openModal('description')">
        <view class="info-description-header">
          <view class="info-description-text">个人简介</view>
          <view class="edit-icon-text">
            编辑
            <image src="@/static/img/common/edit.svg" mode="aspectFit"></image>
          </view>
        </view>
        <view class="description-content">
          <text v-if="userInfo.abstract" class="bio-text">{{ userInfo.abstract }}</text>
          <text v-else class="info-placeholder">介绍一下自己，让更多人了解你</text>
        </view>
      </view>
      
      <view class="info-item" @click="openModal('email')">
        <view class="info-label">邮箱</view>
        <view class="info-content">{{ formatEmail(userInfo.email) }}</view>
        <view class="arrow-icon">
          <image src="@/static/img/common/arrow-right.svg" mode="aspectFit"></image>
        </view>
      </view>
      
      <view class="info-item" @click="openModal('gender')">
        <view class="info-label">性别</view>
        <view class="info-content">{{ userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未设置' }}</view>
        <view class="arrow-icon">
          <image src="@/static/img/common/arrow-right.svg" mode="aspectFit"></image>
        </view>
      </view>
    </view>
    
    <!-- 弹窗 - 修改昵称 -->
    <BeaverDialog
      v-model="modals.nickName"
      title="修改昵称"
      size="medium"
      :show-buttons="false"
      @confirm="saveNickname"
    >
      <view class="form-group">
        <input type="text" class="form-control" v-model="formData.nickName" placeholder="请输入昵称" maxlength="20" />
        <view class="char-count"><text>{{ formData.nickName.length }}</text>/20</view>
      </view>
      <view class="dialog-actions">
        <view class="btn-cancel" @click="closeModal('nickName')">取消</view>
        <view class="btn-save" @click="saveNickname">确定</view>
      </view>
    </BeaverDialog>
    
    <!-- 弹窗 - 修改邮箱 -->
    <BeaverDialog
      v-model="modals.email"
      title="修改邮箱"
       size="medium"
      :show-buttons="false"
      @confirm="saveEmail"
    >
      <view class="email-form">
        <view class="form-group">
          <view class="form-row">
            <view class="form-label">邮箱</view>
            <input type="email" class="form-control" v-model="formData.email" placeholder="请输入邮箱地址" />
          </view>
        </view>
        
        <view class="form-group">
          <view class="form-row">
            <view class="form-label">验证码</view>
            <view class="code-input-group">
              <input type="text" class="form-control code-input" v-model="formData.emailCode" placeholder="请输入验证码" maxlength="6" />
              <button 
                class="btn-send-code" 
                :class="{ disabled: isCodeSending || countdown > 0 }"
                @click="sendEmailCode"
                :disabled="isCodeSending || countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </button>
            </view>
          </view>
        </view>
      </view>
      <view class="dialog-actions">
        <view class="btn-cancel" @click="closeModal('email')">取消</view>
        <view class="btn-save" @click="saveEmail">确定</view>
      </view>
    </BeaverDialog>
    
    <!-- 弹窗 - 修改个人简介 -->
    <BeaverDialog
      v-model="modals.description"
      title="个人简介"
        size="medium"
      :show-buttons="false"
      @confirm="saveBio"
    >
      <view class="form-group">
        <textarea class="form-control" v-model="formData.bio" placeholder="介绍一下自己吧～" rows="5" maxlength="100"></textarea>
        <view class="char-count"><text>{{ formData.bio.length }}</text>/100</view>
      </view>
      <view class="dialog-actions">
        <view class="btn-cancel" @click="closeModal('description')">取消</view>
        <view class="btn-save" @click="saveBio">确定</view>
      </view>
    </BeaverDialog>
    
    <!-- 弹窗 - 选择性别 -->
    <BeaverDialog
      v-model="modals.gender"
      title="选择性别"
      size="medium"
      :show-buttons="false"
      @confirm="saveGender"
    >
      <view class="gender-options">
        <view 
          class="gender-option" 
          :class="{ selected: formData.gender === 1 }" 
          @click="selectGender(1)"
        >
          <view class="gender-option-text">男</view>
          <view class="radio-custom"></view>
        </view>
        <view 
          class="gender-option" 
          :class="{ selected: formData.gender === 2 }"
          @click="selectGender(2)"
        >
          <view class="gender-option-text">女</view>
          <view class="radio-custom"></view>
        </view>
        <view 
          class="gender-option" 
          :class="{ selected: formData.gender === 3 }"
          @click="selectGender(3)"
        >
          <view class="gender-option-text">未知</view>
          <view class="radio-custom"></view>
        </view>
      </view>
      <view class="dialog-actions">
        <view class="btn-cancel" @click="closeModal('gender')">取消</view>
        <view class="btn-save" @click="saveGender">确定</view>
      </view>
        </BeaverDialog>
    

      
    </BeaverLayout>
</template>

<script lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { useUserStore } from '@/pinia/user/user';
import { getEmailCodeApi } from '@/api/auth';
import { updateEmailApi } from '@/api/user';
import { openAlbum, CompressMode } from '@/utils/upload/upload';
import BeaverLayout from '@/component/layout/layout.vue';
import BeaverDialog from '@/component/dialog/index.vue';
import BeaverImage from '@/component/image/image.vue';
import { APP_CONFIG } from '@/config/data';
import Logger from '@/logger/logger';
import { showToast } from '@/component/toast';

export default {
  components: {
    BeaverLayout,
    BeaverDialog,
    BeaverImage
  },
  setup() {
    const logger = new Logger('个人资料页面');
    const userStore = useUserStore();
    const userInfo = computed(() => userStore.userInfo);
    
    // 引用toast组件
    const uToast = ref();
    
    // 弹窗状态管理
    const modals = reactive({
      nickName: false,
      email: false,
      description: false,
      gender: false
    });
    
    // 表单数据
    const formData = reactive({
      nickName: userInfo.value.nickName || '',
      email: userInfo.value.email || '',
      emailCode: '',
      bio: userInfo.value.bio || '',
      gender: userInfo.value.gender || 1,
    });
    
    // 邮箱验证码相关
    const isCodeSending = ref(false);
    const countdown = ref(0);
    
    // 头像相关
    const userAvatar = ref(userInfo.value.fileKey || '');
    

    
    // 监听用户信息变化，更新表单数据
    watch(() => userInfo.value, (newUserInfo) => {
      formData.nickName = newUserInfo.nickName || '';
      formData.email = newUserInfo.email || '';
      formData.bio = newUserInfo.abstract || '';
      formData.gender = newUserInfo.gender || 1;
      userAvatar.value = newUserInfo.fileKey || '';
    });
    

    
    // 格式化邮箱
    const formatEmail = (email: string) => {
      if (!email) return '未设置';
      const [username, domain] = email.split('@');
      if (username.length <= 2) {
        return email;
      }
      return `${username.substring(0, 2)}***@${domain}`;
    };
    
    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };
    
    // 打开模态框
    const openModal = (type: string) => {
      switch (type) {
        case 'nickName':
          formData.nickName = userInfo.value.nickName || '';
          modals.nickName = true;
          break;
        case 'email':
          formData.email = '';
          formData.emailCode = '';
          modals.email = true;
          break;
        case 'description':
          formData.bio = userInfo.value.abstract || '';
          modals.description = true;
          break;
        case 'gender':
          formData.gender = userInfo.value.gender || 1;
          modals.gender = true;
          break;
      }
    };
    
    // 关闭模态框
    const closeModal = (type: string) => {
      switch (type) {
        case 'nickName':
          modals.nickName = false;
          break;
        case 'email':
          modals.email = false;
          break;
        case 'description':
          modals.description = false;
          break;
        case 'gender':
          modals.gender = false;
          break;
      }
    };
    
    // 选择性别
    const selectGender = (gender: number) => {
      formData.gender = gender;
    };
    
    // 选择头像
    const chooseAvatar = () => {
      // 头像：100KB，小尺寸高质量
      const maxSize = 100 * 1024; // 100KB
      openAlbum('album', 1, CompressMode.CUSTOM, maxSize).then((res) => {
        console.log('头像上传成功:', res);
        userStore.updateUserInfo({ fileKey: res.fileKey });
        showToast('头像更新成功');
      }).catch((error) => {
        logger.error({
          text: '选择头像失败',
          data: {
            error: error?.message
          }
        });
        console.error('选择头像失败:', error);
        showToast('选择头像失败');
      });
    };
    
    // 保存昵称
    const saveNickname = () => {
      if (!formData.nickName.trim()) {
        showToast('昵称不能为空');
        return;
      }
      
      userStore.updateUserInfo({ nickName: formData.nickName.trim() });
      showToast('修改成功');
      closeModal('nickName');
    };
    
    // 发送邮箱验证码
    const sendEmailCode = () => {
      if (!formData.email) {
        showToast('请先输入邮箱地址');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('请输入有效的邮箱地址');
        return;
      }
      
      isCodeSending.value = true;
      getEmailCodeApi({
        email: formData.email,
        type: 'update_email'
      }).then((res) => {
        if (res.code === 0) {
          showToast('验证码已发送');
          countdown.value = 60;
          const timer = setInterval(() => {
            countdown.value--;
            if (countdown.value <= 0) {
              clearInterval(timer);
            }
          }, 1000);
        } else {
          showToast(res.msg || '发送失败');
        }
      }).finally(() => {
        isCodeSending.value = false;
      });
    };
    
    // 保存邮箱
    const saveEmail = () => {
      if (!formData.email) {
        showToast('请输入邮箱地址');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast('请输入有效的邮箱地址');
        return;
      }
      
      if (!formData.emailCode) {
        showToast('请输入验证码');
        return;
      }
      
      if (!/^\d{6}$/.test(formData.emailCode)) {
        showToast('请输入6位数字验证码');
        return;
      }
      
      // 调用更新邮箱接口
      updateEmailApi({
        email: formData.email,
        code: formData.emailCode
      }).then((res) => {
        if (res.code === 0) {
          userStore.updateUserInfo({ email: formData.email }, false);
          showToast('邮箱修改成功');
          closeModal('email');
        } else {
          showToast(res.msg || '修改失败');
        }
      }).catch((error) => {
        logger.error({
          text: '更新邮箱失败',
          data: {
            error: error?.message,
            email: formData.email
          }
        });
        showToast('修改失败，请重试');
      });
    };
    
    // 保存个人简介
    const saveBio = () => {
      userStore.updateUserInfo({ abstract: formData.bio.trim() });
      showToast('修改成功');
      closeModal('description');
    };
    
    // 保存性别
    const saveGender = () => {
      userStore.updateUserInfo({ gender: formData.gender });
      showToast('修改成功');
      closeModal('gender');
    };
    
    
    return {
      userInfo,
      userAvatar,
      modals,
      formData,
      isCodeSending,
      countdown,
      uToast,
      goBack,
      openModal,
      closeModal,
      selectGender,
      chooseAvatar,
      saveNickname,
      sendEmailCode,
      saveEmail,
      saveBio,
      saveGender,
      formatEmail,
      showToast,
      APP_CONFIG
    };
  }
};
</script>

<style lang="scss" scoped>
.safe-area {
  height: 32rpx;
}
/* 头像上传 */
.avatar-upload {
  text-align: center;
  padding: 32px 24px;
  background: white;
  margin: 0 16px;
  margin-bottom: 32rpx;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(255, 125, 69, 0.2);
}

.avatar-container image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-icon {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-label {
  font-size: 13px;
  color: #636E72;
}

/* 个人信息列表 */
.info-list {
  background: white;
  margin: 0 16px 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F2F5;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:active {
    background-color: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 15px;
  color: #2D3436;
  font-weight: 500;
  width: 80px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  font-size: 15px;
  color: #636E72;
  text-align: right;
  margin-right: 12px;
}

.info-placeholder {
  color: #B2BEC3;
  font-size: 15px;
}

.arrow-icon {
  width: 20px;
  height: 20px;
}

.arrow-icon image {
  width: 100%;
  height: 100%;
}

/* 个人简介特殊样式 */
.info-description {
  padding: 16px 20px;
  border-bottom: 1px solid #F0F2F5;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:active {
    background-color: #F9FAFB;
  }
}

.info-description-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-description-text {
  font-size: 15px;
  color: #2D3436;
  font-weight: 500;
}

.edit-icon-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #FF7D45;
}

.edit-icon-text image {
  width: 16px;
  height: 16px;
}

.description-content {
  min-height: 20px;
}

.bio-text {
  font-size: 13px;
  color: #636E72;
  line-height: 1.5;
}

.birthday-text {
  color: #636E72;
  font-size: 15px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 14px;
  color: #2D3436;
  background: white;
  box-sizing: border-box;
  transition: all 0.2s ease;
  min-height: 44px;
  display: block;
  flex: 1;
  text-align: left;

  &:focus {
    outline: none;
    border-color: #FF7D45;
    box-shadow: 0 0 0 2px rgba(255, 125, 69, 0.1);
  }

  &::placeholder {
    color: #B2BEC3;
  }
}

textarea.form-control {
  resize: none;
  min-height: 100px;
  height: 100px;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: #B2BEC3;
  margin-top: 4px;
}

/* 邮箱表单样式优化 */
.email-form {
  width: 100%;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  color: #2D3436;
  font-weight: 500;
  min-width: 40px;
  flex-shrink: 0;
  line-height: 44px;
  margin: 0;
}

/* 邮箱验证码样式优化 */
.code-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
}

.code-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  font-size: 14px;
  min-height: 44px;
}

.btn-send-code {
  padding: 0 12px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  min-width: 80px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    transform: scale(0.98);
  }

  &.disabled {
    background: #B2BEC3;
    cursor: not-allowed;
    transform: none;
  }
}

/* 弹窗按钮样式 */
.dialog-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 10px 16px;
  background: #F8F9FA;
  color: #636E72;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.4;

  &:active {
    background: #E9ECEF;
  }
}

.btn-save {
  flex: 1;
  padding: 10px 16px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.4;

  &:active {
    transform: scale(0.98);
  }
}

/* 性别选择 */
.gender-options {
  margin-bottom: 24px;
}

.gender-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;

  &:active {
    background: #F8F9FA;
  }

  &.selected {
    border-color: #FF7D45;
    background: rgba(255, 125, 69, 0.05);
  }
}

.gender-option-text {
  font-size: 14px;
  color: #2D3436;
  font-weight: 500;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 1px solid #E1E8ED;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
  background: white;
}

.gender-option.selected .radio-custom {
  border-color: #FF7D45;
  background: #FF7D45;
}

.gender-option.selected .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}


</style>
