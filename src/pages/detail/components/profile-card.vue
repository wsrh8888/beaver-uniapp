<template>
	<view class="profile-card">
		<!-- 用户基本信息头部 -->
		<view class="profile-header">
			<view class="user-avatar">
				<BeaverImage 
					:fileKey="userInfo.fileKey"
					:image-class="'avatar-img'"
				/>
			</view>
			<view class="user-name">
				{{ userInfo.nickName }}
				<image v-if="userInfo.gender === 'male'" src="@/static/img/detail/gender-male-icon.svg" mode="aspectFit" class="gender-icon" />
			</view>
			<view v-if="userInfo.remarkName" class="user-alias">备注: {{ userInfo.remarkName }}</view>
			<view class="user-id">ID: {{ userInfo.userId }}</view>
			<view class="user-signature">{{ userInfo.signature || '这个人很懒，什么都没写~' }}</view>
		</view>
	</view>
</template>

<script lang="ts">
import BeaverImage from '@/component/image/image.vue';

export interface UserInfo {
	userId: string;
	nickName: string;
	fileKey: string;
	remarkName?: string;
	signature?: string;
	gender?: string;
	location?: string;
	age?: string;
	constellation?: string;
	occupation?: string;
	education?: string;
	hobbies?: string;
	photos?: string[];
	conversationId?: string;
}

export default {
	name: 'ProfileCard',
	components: {
		BeaverImage
	},
	props: {
		userInfo: {
			type: Object as () => UserInfo,
			required: true
		}
	}
};
</script>

<style lang="scss" scoped>
/* 用户资料卡片 */
.profile-card {
	padding: 0;
	position: relative;
	z-index: 2;
	padding-top: 24rpx;
}

.profile-header {
	background-color: white;
	border-radius: 20rpx;
	padding: 32rpx;
	box-shadow: 0 2rpx 16rpx rgba(0,0,0,0.06);
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 0;
}

.user-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
	margin-bottom: 20rpx;
	border: 3rpx solid white;
	box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.08);
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2D3436;
	margin-bottom: 8rpx;
	display: flex;
	align-items: center;
	text-align: center;
}

.gender-icon {
	width: 28rpx;
	height: 28rpx;
	margin-left: 8rpx;
}

.user-alias {
	font-size: 24rpx;
	color: #FF7D45;
	margin-bottom: 8rpx;
	background: rgba(255, 125, 69, 0.1);
	padding: 2rpx 12rpx;
	border-radius: 12rpx;
	font-weight: 500;
}

.user-id {
	font-size: 22rpx;
	color: #B2BEC3;
	margin-bottom: 16rpx;
}

.user-signature {
	font-size: 26rpx;
	color: #636E72;
	text-align: center;
	max-width: 480rpx;
	line-height: 1.5;
	padding: 12rpx 20rpx;
	background: #F8F9FA;
	border-radius: 12rpx;
}
</style> 