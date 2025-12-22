<template>
	<view class="container">
		<view class="content">
			<!-- 个人信息头部 -->
			<view class="header">
				<!-- 装饰元素 -->
				<view class="header-decoration"></view>
				<view class="header-decoration"></view>
				
				<!-- 顶部操作栏 -->
				<view class="top-bar">
					<view class="qrcode-button" @click="navigateToQRCode">
						<image src="@/static/img/common/qrcode.svg" mode="aspectFit" class="qrcode-icon"></image>
					</view>
				</view>
				
				<!-- 个人信息 -->
				<view class="profile-info" @click="navigateToProfile">
					<view class="profile-avatar-wrapper">
						<view class="profile-avatar">
							<beaver-image v-if="userInfo.userId" :file-name="userInfo.fileKey" mode="aspectFill" class="avatar-img"></beaver-image>
						</view>
					</view>
					<view class="profile-name">{{ userInfo.nickName || 'Beaver' }}</view>
					<view class="profile-name">ID: {{ userInfo.userId || '未设置' }}</view>
				</view>
			</view>
			
			<!-- 主体卡片 -->
			<view class="main-card">
				<view class="card-title">设置</view>
				
				<view class="settings-list">
					<!-- 通用设置 -->
					<view class="list-item" @click="navigateToSettings">
						<view class="item-icon">
							<image src="@/static/img/common/settings.svg" mode="aspectFit" class="icon-img"></image>
						</view>
						<view class="item-content">
							<view class="item-title">通用</view>
							<view class="item-right">
								<image src="@/static/img/common/arrow-right.svg" mode="aspectFit" class="arrow-icon"></image>
							</view>
						</view>
					</view>
					
					<!-- 意见反馈 -->
					<view class="list-item" @click="navigateToFeedback">
						<view class="item-icon">
							<image src="@/static/img/common/feedback.svg" mode="aspectFit" class="icon-img"></image>
						</view>
						<view class="item-content">
							<view class="item-title">意见反馈</view>
							<view class="item-right">
								<image src="@/static/img/common/arrow-right.svg" mode="aspectFit" class="arrow-icon"></image>
							</view>
						</view>
					</view>
					
					<!-- 项目声明 -->
					<view class="list-item" @click="navigateToDisclaimer">
						<view class="item-icon">
							<image src="@/static/img/common/about.svg" mode="aspectFit" class="icon-img"></image>
						</view>
						<view class="item-content">
							<view class="item-title">项目声明</view>
							<view class="item-right">
								<image src="@/static/img/common/arrow-right.svg" mode="aspectFit" class="arrow-icon"></image>
							</view>
						</view>
					</view>
					
					<!-- 关于 -->
					<view class="list-item" @click="navigateToAbout">
						<view class="item-icon">
							<image src="@/static/img/common/about.svg" mode="aspectFit" class="icon-img"></image>
						</view>
						<view class="item-content">
							<view class="item-title">关于 Beaver</view>
							<view class="item-right">
								<image src="@/static/img/common/arrow-right.svg" mode="aspectFit" class="arrow-icon"></image>
							</view>
						</view>
					</view>
					
					<!-- 检查更新 -->
					<view class="list-item" @click="navigateToUpdate">
						<view class="item-icon">
							<image src="@/static/img/update/update-icon.svg" mode="aspectFit" class="icon-img"></image>
						</view>
						<view class="item-content">
							<view class="item-title">检查更新</view>
							<view class="item-right">
								<image src="@/static/img/common/arrow-right.svg" mode="aspectFit" class="arrow-icon"></image>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/pinia/user/user';
import BeaverImage from '@/component/image/image.vue';

export default {
	components: {
		BeaverImage
	},
	setup() {
		const store = useUserStore();
		const userInfo = computed(() => store.userInfo);

		// 路由跳转方法
		const navigateToProfile = () => {
			uni.navigateTo({
				url: '/pages/profile/profile'
			});
		};

		const navigateToQRCode = () => {
			uni.navigateTo({
				url: '/pages/qrcode/qrcode'
			});
		};

		const navigateToSettings = () => {
			uni.navigateTo({
				url: '/pages/setting/setting'
			});
		};

		const navigateToFeedback = () => {
			uni.navigateTo({
				url: '/pages/feedback/feedback'
			});
		};

		const navigateToDisclaimer = () => {
			uni.navigateTo({
				url: '/pages/disclaimer/disclaimer'
			});
		};

		const navigateToAbout = () => {
			uni.navigateTo({
				url: '/pages/about/about'
			});
		};

		const navigateToUpdate = () => {
			uni.navigateTo({
				url: '/pages/update/update'
			});
		};

		return {
			userInfo,
			navigateToProfile,
			navigateToQRCode,
			navigateToSettings,
			navigateToFeedback,
			navigateToDisclaimer,
			navigateToAbout,
			navigateToUpdate
		};
	}
};
</script>

<style lang="scss" scoped>
/* 基础样式 */
.container {
	min-height: 100vh;
	background-color: #F9FAFB;
	position: relative;
}

/* 主要内容区 */
.content {
	padding-bottom: calc(env(safe-area-inset-bottom) + 100rpx);
}

/* 个人资料区域 */
.header {
	position: relative;
	padding: 48rpx 32rpx 160rpx;
	background: linear-gradient(150deg, #FF7D45 0%, #E86835 100%);
	border-bottom-left-radius: 64rpx;
	border-bottom-right-radius: 64rpx;
}

/* 波浪形装饰 */
.header::after {
	content: "";
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 48rpx;
	background: #F9FAFB;
	border-top-left-radius: 64rpx;
	border-top-right-radius: 64rpx;
}

/* 装饰性图案 */
.header-decoration {
	position: absolute;
	top: 10%;
	right: 10%;
	width: 240rpx;
	height: 240rpx;
	border-radius: 50%;
	background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15), transparent 60%);
}

.header-decoration:nth-child(2) {
	top: 40%;
	left: 5%;
	width: 160rpx;
	height: 160rpx;
}

/* 顶部操作栏 */
.top-bar {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-bottom: 32rpx;
}

/* 二维码图标按钮 */
.qrcode-button {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	transition: all 0.2s;
}

.qrcode-icon {
	width: 36rpx;
	height: 36rpx;
	filter: invert(1); /* 将黑色SVG转为白色 */
}

.qrcode-button:active {
	transform: scale(0.98);
	background: rgba(255, 255, 255, 0.25);
}

/* 用户信息 */
.profile-info {
	position: relative;
	z-index: 10;
	text-align: center;
}

.profile-avatar-wrapper {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	margin: 0 auto 28rpx;
}

.profile-avatar {
	width: 160rpx;
	height: 160rpx;
	background: white;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #FF7D45;
	font-size: 64rpx;
	font-weight: 600;
	box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.15);
	overflow: hidden;
	position: relative;
	border-radius: 100%;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

/* 头像内部高光 */
.profile-fileKey::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%);
}

.profile-name {
	font-size: 40rpx;
	font-weight: 600;
	color: white;
	margin-bottom: 4rpx;
	line-height: 1.3;
}

.profile-name {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
}

/* 卡片主体 */
.main-card {
	margin: -112rpx 32rpx 32rpx;
	background: white;
	border-radius: 36rpx;
	padding: 36rpx;
	box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.06);
	position: relative;
	z-index: 5;
}

/* 卡片标题 */
.card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #2D3436;
	margin-bottom: 28rpx;
	position: relative;
	padding-left: 4rpx;
}

/* 设置项列表 */
.settings-list {
	display: grid;
	grid-gap: 16rpx;
}

/* 列表项 */
.list-item {
	display: flex;
	align-items: center;
	height: 96rpx;
	padding: 0 24rpx;
	background: #FFFFFF;
	border-radius: 20rpx;
	transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.02);
	border: 2rpx solid rgba(235, 238, 245, 0.7);
	position: relative;
}

/* 增加微妙的点击效果 */
.list-item:active {
	border-color: rgba(255, 125, 69, 0.2);
	background: rgba(255, 125, 69, 0.02);
	transform: translateY(-2rpx);
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

/* 图标容器 */
.item-icon {
	width: 60rpx;
	height: 60rpx;
	border-radius: 16rpx;
	background: rgba(255, 125, 69, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
}

.icon-img {
	width: 32rpx;
	height: 32rpx;
	filter: invert(55%) sepia(88%) saturate(2082%) hue-rotate(337deg) brightness(99%) contrast(98%);
	/* 使用filter来将黑色SVG转化为橙色 #FF7D45 */
}

/* 图标内部高光 */
.item-icon::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 40%;
	background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
}

/* 为每个图标添加不同的轻微背景色调 */
.list-item:nth-child(1) .item-icon {
	background: rgba(255, 125, 69, 0.1);
}

.list-item:nth-child(2) .item-icon {
	background: rgba(255, 150, 80, 0.1);
}

.list-item:nth-child(3) .item-icon {
	background: rgba(255, 175, 95, 0.1);
}

.item-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-right: 8rpx;
}

.item-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #2D3436;
}

.item-right {
	width: 48rpx;
	height: 48rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #B2BEC3;
	transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
}

.arrow-icon {
	width: 28rpx;
	height: 28rpx;
	filter: invert(79%) sepia(9%) saturate(298%) hue-rotate(159deg) brightness(93%) contrast(84%);
	/* 使用filter将黑色SVG转化为灰色 #B2BEC3 */
}

.list-item:active .item-right {
	transform: translateX(8rpx);
}

.list-item:active .arrow-icon {
	filter: invert(40%) sepia(10%) saturate(545%) hue-rotate(155deg) brightness(98%) contrast(85%);
	/* 点击时使用filter将箭头转化为深灰色 #636E72 */
}

/* 版本信息 */
.footer {
	text-align: center;
	padding: 48rpx 0 80rpx;
	color: #B2BEC3;
	font-size: 24rpx;
}
</style>