<template>
	<view class="message-item-wrapper">
		<view :class="['info', position]">
			<BeaverImage 
				:file-name="sender.fileKey"
				class="img"
				@click="handleGoDetail"
			/>
			<view class="contents">
				<!-- 文本 -->
				<view class="content" v-if="message.type == 1" @longpress="showMenu">
					<rich-text :nodes="convertedContent" class="text"></rich-text>
				</view>
				<!-- 图片 -->
				<view class="contentImg" v-if="message.type == 2">
					<view :style="{ width: imageSize.width + 'rpx', height: imageSize.height + 'rpx' }">
						<BeaverImage 
							:file-name="message.imageMsg.fileKey"
							class="imgMsg"
							mode="aspectFit"
							@click="preview(message.imageMsg.fileKey)"
							@longpress="showMenu"
							@load="onImageLoad"

						/>
					</view>
				</view>
				<!-- 表情 -->
				<view class="contentEmoji" v-if="message.type == 6">
					<BeaverImage 
						:file-name="message.emojiMsg.fileKey"
						class="emojiMsg"
						mode="aspectFit"
						@click="previewEmoji(message.emojiMsg.fileKey)"
						@longpress="showMenu"
					/>
				</view>
			</view>
		</view>
		
		<!-- 消息操作菜单 -->
		<MessageActionMenu 
			:visible="showActionMenu"
			:message="message"
			:is-mine="isMine"
			:position="menuPosition"
			:message-rect="messageRect"
			@close="closeActionMenu"
		/>
	</view>
</template>

<script lang="ts">
import { previewOnlineFileApi } from '@/api/file';
import { emojiMap } from '@/utils/emoji';
import { ref, toRefs, computed } from 'vue';
import BeaverImage from '@/component/image/image.vue';
import BeaverAvatar from '@/component/avatar/avatar.vue';
import MessageActionMenu from '../popup/MessageActionMenu.vue';

export default {
	props: {
		position: {
			type: String,
			default: 'left'
		},
		message: {
			type: Object,
			default: () => ({})
		},
		sender: {
			type: Object,
			default: () => ({})
		},

		currentUserId: {
			type: String,
			default: ''
		},
		conversationId: {
			type: String,
			default: ''
		}
	},
	components: {
		BeaverAvatar,
		BeaverImage,
		MessageActionMenu
	},
	emits: ['scroll-bottom'],
	setup(props: any, { emit }: { emit: (event: string) => void }) {
		const { message } = toRefs(props);
		
		// 菜单状态
		const showActionMenu = ref(false);
		const menuPosition = ref({ x: 0, y: 0 });
		const messageRect = ref({ top: 0, bottom: 0, left: 0, right: 0 });
		
		// 判断是否为自己的消息
		const isMine = computed(() => props.sender.userId === props.currentUserId);

		// 显示菜单
		const showMenu = (event: any) => {
			// 获取消息元素的位置信息
			const messageElement = event.currentTarget;
			const rect = messageElement.getBoundingClientRect();
			
			messageRect.value = {
				top: rect.top,
				bottom: rect.bottom,
				left: rect.left,
				right: rect.right
			};
			
			showActionMenu.value = true;
		};

		// 关闭菜单
		const closeActionMenu = () => {
			showActionMenu.value = false;
		};

		const handleGoDetail = () => {
			// 如果是自己的消息，点击无效
			if (props.sender.userId === props.currentUserId) {
				return;
			}
			uni.navigateTo({
				url: `/pages/detail/detail?id=${props.sender.userId}`
			})
		}

		const preview = (fileKey: string) => {
			uni.previewImage({
				current: 0,
				urls: [previewOnlineFileApi(fileKey)]
			})
		}
		
		const previewEmoji = (fileKey: string) => {
			uni.previewImage({
				current: 0,
				urls: [previewOnlineFileApi(fileKey)]
			})
		}
		// 计算图片尺寸
		const calculateImageSize = (originalWidth: number, originalHeight: number) => {
			// 获取设备信息
			const systemInfo = uni.getSystemInfoSync();
			const screenWidth = systemInfo.screenWidth; // 屏幕宽度
			const screenHeight = systemInfo.screenHeight; // 屏幕高度
			
			// 设置最大宽度和最大高度限制
			const maxWidth = screenWidth * 0.6;  // 最大宽度为屏幕宽度的60%
			const maxHeight = screenHeight * 0.25; // 最大高度为屏幕高度的25%
			
			console.log('原始尺寸:', originalWidth, 'x', originalHeight, '比例:', (originalWidth / originalHeight).toFixed(2));
			console.log('屏幕尺寸:', screenWidth, 'x', screenHeight);
			console.log('最大限制:', maxWidth, 'x', maxHeight);
			
			// 如果图片的宽度和高度都小于最大限制，直接使用原始尺寸
			if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
				console.log('图片尺寸在限制范围内，使用原始尺寸');
				return {
					width: originalWidth * 2, // 转换为rpx
					height: originalHeight * 2
				};
			}
			
			// 计算宽度和高度的缩放比例
			const widthRatio = maxWidth / originalWidth;
			const heightRatio = maxHeight / originalHeight;
			
			// 选择较小的缩放比例，确保图片完全适应限制，同时保持宽高比
			const scaleRatio = Math.min(widthRatio, heightRatio);
			
			const newWidth = originalWidth * scaleRatio;
			const newHeight = originalHeight * scaleRatio;
			
			console.log('缩放比例:', '宽度比例:', widthRatio.toFixed(3), '高度比例:', heightRatio.toFixed(3), '使用比例:', scaleRatio.toFixed(3));
			console.log('缩放后尺寸:', newWidth.toFixed(1), 'x', newHeight.toFixed(1), '比例:', (newWidth / newHeight).toFixed(2));
			
			// 转换为rpx单位（乘以2是因为1px = 2rpx）
			const result = {
				width: newWidth * 2,
				height: newHeight * 2
			};
			
			console.log('最终rpx尺寸:', result.width, 'x', result.height);
			return result;
		};

		// 计算图片尺寸（从消息数据中获取）
		const imageSize = computed(() => {
			if (message.value.type === 2 && message.value.imageMsg) {
				const { width, height } = message.value.imageMsg;
				if (width && height) {
					console.log('计算图片尺寸', message.value.imageMsg.fileKey,calculateImageSize(width, height));
					return calculateImageSize(width, height);
				}
			}
			console.log('没有找到图片尺寸信息，使用默认值');
			// 如果没有尺寸信息，返回默认值
			return { width: 200, height: 200 };
		});

		const onImageLoad = (event: any) => {
			// 图片加载完成后滚动到底部
			emit('scroll-bottom');
		}


		const convertedContent = computed(() => {
			// return content.replace(/\[微笑\]/g, '<img src="path_to_smile_image.png" alt="微笑" />');\
			let content = message.value.textMsg.content;

			const matches = content.match(/\[[^\]]+\]/g);
			if (matches) {
				matches.forEach((match: string) => {
					if (emojiMap(match)) {
						console.error('emojiMap', emojiMap(match));
						// 替换成对应的图片标签，设置与文字行高一致的尺寸
						const imgTag = `<img src="${emojiMap(match)}" style="width:1.8em;height:1.8em;display:inline-block;vertical-align:middle;margin:0 2px;"></img>`;
						content = content.replace(match, imgTag);
					}
				});
			}
			return content;
		})

		return {
			previewOnlineFileApi,
			convertedContent,
			message,
			preview,
			previewEmoji,
			handleGoDetail,
			onImageLoad,
			imageSize,
			BeaverImage,
			BeaverAvatar,
			// 菜单相关
			showActionMenu,
			menuPosition,
			messageRect,
			isMine,
			showMenu,
			closeActionMenu,

		};
	}
}
</script>

<style lang="scss" scoped>

.message-item-wrapper {
	position: relative;
}

/* 禁用浏览器默认的长按菜单 */
.content,
.contentImg,
.contentEmoji {
	-webkit-touch-callout: none !important;
	-webkit-user-select: none !important;
	-khtml-user-select: none !important;
	-moz-user-select: none !important;
	-ms-user-select: none !important;
	user-select: none !important;
	-webkit-tap-highlight-color: transparent !important;
}

.imgMsg,
.emojiMsg {
	-webkit-touch-callout: none !important;
	-webkit-user-select: none !important;
	-khtml-user-select: none !important;
	-moz-user-select: none !important;
	-ms-user-select: none !important;
	user-select: none !important;
	-webkit-tap-highlight-color: transparent !important;
}

.box {
	height: 100vh;
	box-sizing: border-box;
	padding: 15rpx 0;
	background-color: #f5f5f5;
	font-family: STKaiti;

	.container {
		padding: 8rpx 30rpx 0;

		.iconfont {
			font-size: 50rpx;
		}
	}

	.divide {
		margin: 10rpx 0 0;
		height: 1rpx;
		// height: 100px;
		background-color: #e6e6e6;
	}



	.scroll {
		box-sizing: border-box;

		.messageList {
			display: flex;
			flex-direction: column;
			color: #000;



			.time {
				margin: 10rpx 0;

				.time_text {
					text-align: center;
					margin: 10rpx 0;
					font-size: 25rpx;
					color: #5e5e5e;
				}
			}

			.info {
				flex: 1;
				display: flex;
				
				.contents {
					margin-right: 16rpx;
				}
				
				.img {
					margin-left: 16rpx;
					width: 90rpx;
					height: 90rpx;
					border-radius: 100%;
					overflow: hidden;
					flex-shrink: 0;
				}

				.contents {
					display: flex;
					flex-direction: column;
					.content {
						position: relative;
						box-sizing: border-box;
						min-height: 72rpx;
						border-radius: 36rpx;
						background-color: #F5F5F5;
						display: flex;
						align-items: center;
						padding: 20rpx 32rpx;

						.text {
							font-size: 30rpx;
							line-height: 1.4;
							color: #333333;
						}

						&::before {
							content: "";
							position: absolute;
							left: -16rpx;
							top: 24rpx;
							width: 0;
							height: 0;
							border: 16rpx solid transparent;
							border-right: 16rpx solid #F5F5F5;
							border-left: 0;
						}
					}

					.contentImg {
						border-radius: 20rpx;
						overflow: hidden;

						.imgMsg {
							width: 100%;
							height: 100%;
							overflow: hidden;
							vertical-align: top;
						}
					}
					
					.contentEmoji {
						border-radius: 20rpx;
						overflow: hidden;
						max-width: 200rpx;

						.emojiMsg {
							width: 120rpx;
							height: 120rpx;
							display: block;
						}
					}
				}

				.img {
					width: 64rpx;
					height: 64rpx;
					border-radius: 32rpx;
					overflow: hidden;
					flex-shrink: 0;
				}
			}

			.right {
				flex-direction: row-reverse;

				.contents {
					align-items: flex-end;
					
					.content {
						background-color: #FF7D45;

						.text {
							color: #FFFFFF;
						}

						&::before {
							left: auto;
							right: -16rpx;
							border: 16rpx solid transparent;
							border-left: 16rpx solid #FF7D45;
							border-right: 0;
						}
					}
				}
			}
		}

		// .menuList:last-child {
		// 	margin-bottom: 0;
		// }
	}

	.popul {
		position: fixed;
		left: 0;
		right: 0;
		border-top: 1rpx solid #eeeeee;
		font-family: STKaiti;
		padding: 15rpx 30rpx;
		display: flex;
		align-items: center;
		background-color: #f2f2f2;

		.size {
			font-size: 50rpx;
		}

		.input {
			padding: 15rpx;
			margin: 0 5rpx 0 7rpx;
			background-color: #fff;
			border-radius: 10rpx;
			width: 530rpx;
		}

		.second {
			margin: 0 8rpx 0 7rpx;
		}

		.btn {
			width: 120rpx;
			height: 60rpx;
			line-height: 60rpx;
			margin-left: 10rpx;
			text-align: center;
			background-color: #1aa5fc;
			border-radius: 15rpx;
			color: #fff;
			z-index: 99;
			font-size: 25rpx;
		}
	}

	.list {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		border-top: 1rpx solid #d3d3d3;
		padding: 15rpx 20rpx;
		overflow-x: scroll;
		background-color: #f1f1f1;

		.message {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 12.5%;
			height: 80rpx;
			font-size: 50rpx;
		}

	}

	.more {
		padding-bottom: 20rpx;

		.optionItem {
			width: 25%;
			display: flex;
			flex-direction: column;
			align-items: center;
			font-size: 25rpx;

			.icon {
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #fff;
				width: 90rpx;
				height: 90rpx;
				border-radius: 20rpx;
				margin-bottom: 10rpx;

				.iconfont {
					font-size: 45rpx;
				}
			}
		}

		.optionItem:nth-child(n+5) {
			margin-bottom: 40rpx;
		}
	}

}

.audioBg {
	.bg {
		margin-top: 200rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #55ffff;
		width: 400rpx;
		height: 150px;
		border-radius: 20rpx;

		.img {
			width: 50%;
			height: 50%;
		}
	}

}

.info {
	display: flex;
	align-items: flex-start;

	.img {
		width: 64rpx;
		height: 64rpx;
		border-radius: 32rpx;
		overflow: hidden;
		flex-shrink: 0;
	}

	.contents {
		margin-left: 16rpx;
		max-width: 480rpx;

		.content {
			position: relative;
			background-color: #F5F5F5;
			border-radius: 0 20rpx 20rpx 20rpx;
			padding: 24rpx;

			.text {
				font-size: 28rpx;
				color: #333333;
			}

			&::before {
				content: "";
				position: absolute;
				left: -16rpx;
				top: 0;
				width: 0;
				height: 0;
				border: 8rpx solid transparent;
				border-right: 8rpx solid #F5F5F5;
				border-top: 8rpx solid #F5F5F5;
			}
		}

		.contentImg {
			border-radius: 20rpx;
			overflow: hidden;
			.imgMsg {
				width: 100%;
				height: 100%;
				
				vertical-align: top;
			}
		}
	}
}

.right {
	flex-direction: row-reverse;

	.contents {
		margin-left: 0;
		margin-right: 16rpx;
		align-items: flex-end;

		.content {
			background-color: #FF7D45;
			border-radius: 20rpx 0 20rpx 20rpx;

			.text {
				color: #FFFFFF;
			}

			&::before {
				left: auto;
				right: -16rpx;
				border: 8rpx solid transparent;
				border-left: 8rpx solid #FF7D45;
				border-top: 8rpx solid #FF7D45;
			}
		}
	}
}
</style>

<!-- 全局样式，禁用浏览器默认长按菜单 -->
<style lang="scss">
/* 全局禁用长按菜单 */
.content,
.contentImg,
.contentEmoji,
.imgMsg,
.emojiMsg {
	-webkit-touch-callout: none !important;
	-webkit-user-select: none !important;
	-khtml-user-select: none !important;
	-moz-user-select: none !important;
	-ms-user-select: none !important;
	user-select: none !important;
	-webkit-tap-highlight-color: transparent !important;
}

/* 禁用整个页面的长按菜单 */
page {
	-webkit-touch-callout: none !important;
	-webkit-user-select: none !important;
	user-select: none !important;
}
</style>