<template>
	<BeaverLayout
		:title="pageTitle"
		:show-back="true"
		:scrollable="true"
		:scroll-y="true"
		:show-scrollbar="false"
		:show-background="true"
		background-type="gradient"
		:background-height="180"
		:after-height="168"
		@back="handleClickGoBack"
	>
		<template #right>
			<view class="more-button" @click="toggleMoreMenu" v-if="isFriend">
				<image src="@/static/img/detail/more-icon.svg" mode="aspectFit" class="more-icon" />
			</view>
		</template>

		<!-- 内容区域 -->
		<view class="content">
			<!-- 统一的用户信息卡片 -->
			<view class="user-info-card">
				<!-- 用户头像和基本信息 -->
				<view class="user-basic-info">
					<view class="user-avatar">
						<BeaverImage 
							:fileKey="userInfo.fileKey"
							:image-class="'avatar-img'"
						/>
					</view>
					<view class="user-details">
						<view class="user-name-row">
							<view class="user-name">{{ userInfo.remarkName || userInfo.nickName }}</view>
							<image v-if="userInfo.gender === 'male'" src="@/static/img/detail/gender-male-icon.svg" mode="aspectFit" class="gender-icon" />
						</view>
						<view class="user-id">ID: {{ userInfo.userId }}</view>
						<view class="user-signature">{{ userInfo.signature || '这个人很懒，什么都没写~' }}</view>
					</view>
				</view>

				<!-- 信息列表 -->
				<view class="info-list">
					<!-- 好友信息（仅好友显示） -->
					<template v-if="isFriend && friendInfoItems.length > 0">
						<view class="info-item" v-for="(item, index) in friendInfoItems" :key="'friend-' + index">
							<view class="info-label">{{ item.label }}</view>
							<view class="info-value">{{ item.value }}</view>
						</view>
					</template>

					<!-- 基本资料 -->
					<view class="info-item" v-for="(item, index) in basicInfoItems" :key="'basic-' + index">
						<view class="info-label">{{ item.label }}</view>
						<view class="info-value">{{ item.value }}</view>
					</view>
				</view>
			</view>

			<!-- 相册预览卡片 -->
			<PhotoCard 
				:photos="userInfo.photos"
				@view-all="viewAllPhotos"
			/>
		</view>

		<!-- 底部操作栏 -->
		<template #after>
			<ActionBar 
				:is-friend="isFriend"
				:user-id="userInfo.userId"
				:source="source"
				@send-message="sendMessage"
				@audio-call="audioCall"
				@video-call="videoCall"
				@add-friend-success="handleAddFriendSuccess"
			/>
		</template>

		<!-- 编辑备注弹窗 -->
		<BeaverDialog
			v-model="showEditNoteDialog"
			title="编辑备注"
			:show-cancel="true"
			cancel-text="取消"
			confirm-text="保存"
			@confirm="saveRemarkName"
			@cancel="closeEditNote"
		>
			<view class="input-group">
				<input type="text" class="input-field" v-model="newRemarkName" placeholder="请输入备注名称" />
			</view>
		</BeaverDialog>

		<!-- 更多菜单下拉 -->
		<view class="dropdown" :class="{ 'show': showMoreMenu }" :style="{ top: (statusBarHeight + 88) + 'rpx' }">
			<view class="dropdown-item" @click="showEditNote">
				<view class="dropdown-icon">
					<image src="@/static/img/detail/edit-note-icon.svg" mode="aspectFit" class="icon-img" />
				</view>
				<text>编辑备注</text>
			</view>
			<view class="dropdown-divider"></view>
			<view class="dropdown-item danger" @click="confirmDelete">
				<view class="dropdown-icon">
					<image src="@/static/img/detail/delete-icon.svg" mode="aspectFit" class="icon-img" />
				</view>
				<text>删除好友</text>
			</view>
		</view>

		<!-- 遮罩层 -->
		<view class="mask" :class="{ 'show': showMoreMenu }" @click="showMoreMenu = false"></view>
	</BeaverLayout>
</template>

<script lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { noticeUpdateApi, friendDeleteApi, friendInfoApi } from '@/api/friend';
import BeaverLayout from '@/component/layout/layout.vue';
import BeaverDialog from '@/component/dialog/index.vue';
import BeaverImage from '@/component/image/image.vue';
import PhotoCard from './components/photo-card.vue';
import ActionBar from './components/action-bar.vue';
import Logger from '@/logger/logger';
import { useFriendStore } from '@/pinia/friend/friend';

export default {
	components: {
	BeaverImage,
		BeaverLayout,
		BeaverDialog,
		PhotoCard,
		ActionBar
	},
	setup() {
		const userInfo = ref({
			userId: '',
			nickName: '',
			fileKey: '',
			remarkName: '',
			signature: '',
			gender: '',
			location: '',
			age: '',
			constellation: '',
			occupation: '',
			education: '',
			hobbies: '',
			photos: [] as string[],
			conversationId: '',
			source: ''
		});
		const logger = new Logger('用户详情页');
		const friendStore = useFriendStore();

		const isFriend = ref(false);
		const newRemarkName = ref('');
		const showEditNoteDialog = ref(false);
		const showMoreMenu = ref(false);
		const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0);
		const source = ref(''); // 添加好友来源

		// 计算页面标题
		const pageTitle = computed(() => {
			return isFriend.value ? '好友资料' : '用户资料';
		});

		// 格式化来源文本
		const getSourceText = (source: string) => {
			const sourceMap: Record<string, string> = {
				'search': '搜索', 'qrcode': '二维码', 'group': '群聊',
				'card': '名片', 'link': '链接', 'other': '其他'
			};
			return sourceMap[source] || source;
		};

		// 计算基本资料项
		const basicInfoItems = computed(() => {
			const items = [];
			
			// 添加昵称
			if (userInfo.value.nickName) {
				items.push({ label: '昵称', value: userInfo.value.nickName });
			}
			
			// 添加性别
			items.push({ label: '性别', value: userInfo.value.gender === 'male' ? '男' : userInfo.value.gender === 'female' ? '女' : '未设置' });
			
			return items;
		});

		// 计算好友信息项
		const friendInfoItems = computed(() => {
			const items = [];
			
			// 添加备注
			if (userInfo.value.remarkName) {
				items.push({ label: '备注', value: userInfo.value.remarkName });
			}
			
			// 添加好友来源
			if (userInfo.value.source) {
				items.push({ label: '来源', value: getSourceText(userInfo.value.source) });
			}
			
			return items;
		});

		onLoad((option: any) => {
			console.log('detail页面参数:', option);
			if (option.id) {
				loadUserInfo(option.id);
			}
			// 记录添加好友来源
			if (option.source) {
				source.value = option.source;
				console.log('添加好友来源:', source.value);
			}
		});

		const loadUserInfo = async (userId: string) => {
			try {
				const res = await friendInfoApi({ friendId: userId });
				if (res.code === 0) {
					userInfo.value = { ...userInfo.value, ...res.result };
					// 使用接口返回的isFriend字段判断好友关系
					isFriend.value = res.result.isFriend || false;
					// 确保 source 字段正确设置
					if (res.result.source) {
						userInfo.value.source = res.result.source;
					}
					// 确保备注字段正确设置（后端返回的是 notice，前端使用 remarkName）
					if (res.result.notice) {
						userInfo.value.remarkName = res.result.notice;
					}
					console.log('接口返回的isFriend:', res.result.isFriend);
					console.log('设置isFriend为:', isFriend.value);
					console.log('好友来源:', res.result.source);
					console.log('好友备注:', res.result.notice);
				}
			} catch (error) {
				logger.error({
					text: '获取用户信息失败',
					data: {
						error: error instanceof Error ? error.message : String(error),
						userId
					}
				});
				uni.showToast({ title: '获取用户信息失败', icon: 'none' });
			}
		};

		const handleClickGoBack = () => {
			uni.navigateBack();
		};

		const toggleMoreMenu = () => {
			showMoreMenu.value = true;
		};

		const showEditNote = () => {
			showMoreMenu.value = false;
			newRemarkName.value = userInfo.value.remarkName;
			showEditNoteDialog.value = true;
		};

		const closeEditNote = () => {
			showEditNoteDialog.value = false;
		};

		const saveRemarkName = async () => {
			const res = await noticeUpdateApi({
				friendId: userInfo.value.userId,
				notice: newRemarkName.value
			});
			
			if (res.code === 0) {
				// 更新本地用户信息
				userInfo.value.remarkName = newRemarkName.value;
				
				// 更新本地好友数据
				await friendStore.updateFriendInfo(userInfo.value.userId);
				
				uni.showToast({ title: '备注更新成功', icon: 'success' });
				closeEditNote();
			} else {
				// API 返回错误
				logger.error({
					text: '更新备注失败',
					data: {
						code: res.code,
						msg: res.msg,
						friendId: userInfo.value.userId,
						remarkName: newRemarkName.value
					}
				});
				uni.showToast({ title: res.msg || '更新备注失败', icon: 'none' });
			}
		};

		const confirmDelete = () => {
			showMoreMenu.value = false;
			uni.showModal({
				title: '删除好友',
				content: '确定要删除该好友吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							const result = await friendDeleteApi({ friendId: userInfo.value.userId });
							if (result.code === 0) {
								uni.showToast({ title: '删除成功', icon: 'success' });
								setTimeout(() => {
									uni.navigateBack();
								}, 1500);
							}
						} catch (error) {
							const logger = new Logger('用户详情页');
							logger.error({
								text: '删除好友失败',
								data: {
									error: error instanceof Error ? error.message : String(error),
									friendId: userInfo.value.userId
								}
							});
							uni.showToast({ title: '删除失败', icon: 'none' });
						}
					}
				}
			});
		};

		const sendMessage = () => {
			if (isFriend.value && userInfo.value.conversationId) {
				uni.navigateTo({
					url: `/pages/chat/chat?id=${userInfo.value.conversationId}`,
					animationType: 'slide-in-right',
					animationDuration: 200
				});
			} else {
				uni.showToast({ title: '暂不支持与非好友聊天', icon: 'none' });
			}
		};

		const audioCall = () => {
			uni.showToast({ title: '发起语音通话', icon: 'none' });
		};

		const videoCall = () => {
			uni.showToast({ title: '发起视频通话', icon: 'none' });
		};

		const addFriend = () => {
			uni.navigateTo({
				url: `/pages/searchFriend/searchFriend?userId=${userInfo.value.userId}&source=${source.value}`,
				animationType: 'slide-in-right',
				animationDuration: 200
			});
		};

		const viewAllPhotos = () => {
			uni.showToast({ title: '查看更多照片', icon: 'none' });
		};

		const handleAddFriendSuccess = () => {
			uni.showToast({ title: '添加好友成功', icon: 'success' });
			isFriend.value = true; // 更新好友状态
			uni.navigateBack(); // 返回上一页
		};

		return {
			userInfo,
			isFriend,
			pageTitle,
			basicInfoItems,
			friendInfoItems,
			newRemarkName,
			showEditNoteDialog,
			showMoreMenu,
			statusBarHeight,
			handleClickGoBack,
			toggleMoreMenu,
			showEditNote,
			closeEditNote,
			saveRemarkName,
			confirmDelete,
			sendMessage,
			audioCall,
			videoCall,
			addFriend,
			viewAllPhotos,
			source,
			handleAddFriendSuccess
		};
	}
};
</script>

<style lang="scss" scoped>
/* 移除 header 的边框 */
:deep(.header-content) {
  border-bottom: none !important;
}

/* 基础样式 */
.content {
	padding: 0 24rpx;
	padding-bottom: 120rpx; /* 为底部操作栏留出空间 */
	max-width: 750rpx;
	box-sizing: border-box;
	margin: 0 auto;
}

/* 信息卡片容器 */
.info-section {
	display: flex;
	flex-direction: column;
}

.info-section > * {
	margin-bottom: 24rpx; /* 统一卡片间距 */
}

.info-section > *:last-child {
	margin-bottom: 0;
}

/* 统一用户信息卡片 */
.user-info-card {
	background-color: white;
	border-radius: 24rpx;
	padding: 40rpx 32rpx;
	box-shadow: 0 4rpx 24rpx rgba(0,0,0,0.08);
	margin-bottom: 0;
}

.user-basic-info {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	margin-bottom: 40rpx;
	padding-bottom: 32rpx;
	border-bottom: 1rpx solid #F0F3F4;
}

.user-avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 24rpx;
	border: 4rpx solid white;
	box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.12);
}

.avatar-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.user-details {
	width: 100%;
}

.user-name-row {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
}

.gender-icon {
	width: 36rpx;
	height: 36rpx;
	margin-left: 16rpx;
}

.user-name {
	font-size: 40rpx;
	font-weight: 700;
	color: #2D3436;
}

.user-alias {
	font-size: 30rpx;
	color: #FF7D45;
	margin-bottom: 10rpx;
	font-weight: 600;
	background: rgba(255, 125, 69, 0.08);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	display: inline-block;
}

.user-id {
	font-size: 24rpx;
	color: #B2BEC3;
	margin-bottom: 16rpx;
	font-family: 'Monaco', 'Menlo', monospace;
	letter-spacing: 0.5rpx;
}

.user-signature {
	font-size: 28rpx;
	color: #636E72;
	line-height: 1.6;
	padding: 16rpx 20rpx;
	background: #F8F9FA;
	border-radius: 16rpx;
	max-width: 480rpx;
	margin: 0 auto;
}

/* 信息列表 */
.info-list {
	display: flex;
	flex-direction: column;
}

.info-list > * {
	margin-bottom: 12rpx;
}

.info-list > *:last-child {
	margin-bottom: 0;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 24rpx;
	background: linear-gradient(135deg, #F8F9FA 0%, #F0F3F4 100%);
	border-radius: 16rpx;
	border: 1rpx solid transparent;
}

.info-label {
	color: #636E72;
	font-size: 28rpx;
	font-weight: 600;
}

.info-value {
	color: #2D3436;
	font-size: 28rpx;
	font-weight: 700;
	text-align: right;
	max-width: 60%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 更多按钮样式 */
.more-button {
	width: 44rpx;
	height: 44rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.9);
	box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
	transition: all 0.2s ease;

	&:active {
		transform: scale(0.95);
	}
}

.more-icon {
	width: 32rpx;
	height: 32rpx;
}

/* 编辑备注弹窗 */
.input-group {
	margin-bottom: 0;
}

.input-field {
	width: 100%;
	height: 88rpx;
	border-radius: 16rpx;
	border: 2rpx solid #E8EBED;
	padding: 0 24rpx;
	font-size: 28rpx;
	transition: all 0.2s;
	background-color: #F9FAFB;
	box-sizing: border-box;

	&:focus {
		outline: none;
		border-color: #FF7D45;
		box-shadow: 0 0 0 4rpx rgba(255, 125, 69, 0.1);
		background-color: white;
	}
}

/* 下拉菜单 */
.dropdown {
	position: fixed;
	right: 24rpx;
	background: white;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	border-radius: 16rpx;
	width: 280rpx;
	overflow: hidden;
	z-index: 1000;
	display: none;
	opacity: 0;
	transform: translateY(-8rpx) scale(0.95);
	transform-origin: top right;
	transition: all 0.2s ease;
}

.dropdown.show {
	display: block;
	opacity: 1;
	transform: translateY(0) scale(1);
}

.dropdown-item {
	height: 88rpx;
	padding: 0 24rpx;
	display: flex;
	align-items: center;
	color: #2D3436;
	font-weight: 500;
	font-size: 28rpx;
	transition: background-color 0.2s ease;
	cursor: pointer;

	&:active {
		background-color: #F8F9FA;
	}

	&.danger {
		color: #2D3436;
		
		&:active {
			background-color: #FFF5F5;
		}
	}
}

.dropdown-icon {
	width: 36rpx;
	height: 36rpx;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dropdown-divider {
	height: 1rpx;
	background-color: #F0F3F4;
	margin: 0 24rpx;
}

/* 遮罩层 */
.mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.3);
	z-index: 999;
	display: none;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.mask.show {
	display: block;
	opacity: 1;
}
</style>