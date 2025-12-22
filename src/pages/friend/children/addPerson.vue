<template>
	<view class="add-person">
		<view class="person-search">
			<uni-icons type="left" color="#333" size="26" @click="goBack"></uni-icons>
			<view class="search-box">
				<uni-icons type="search" color="#888B92" size="20"></uni-icons>
				<input type="text" placeholder-class="place" v-model="personNumber" placeholder="请输入手机号" />
			</view>
			<view @click="getFriendInfo">搜索</view>
		</view>
		<view class="search-tab">
			<view v-for="(tab,index) in tabList" :key="tab">
				<text :class="[index === selectTab ? 'select' :'']" @click="handleTab(index)">{{ tab }}</text>
			</view>
		</view>
		<view class="content">
			<view class="user">
				<!-- <view class="info" v-for="user in userInfo" :key="user.userId">
          <img :src="user.avatar" alt="">
          <text>{{ user.nickName }}</text>
          <view>添加</view>
        </view> -->

				<view class="info">
					<img :src="APP_CONFIG.logo" alt="">
					<view class="info-right">
						<text class="nickName">{{ userInfo.nickName }}</text>
						<view class="add-btn" @click="confirmAddPerson(userInfo)">添加</view>
					</view>
				</view>
				<view class="info">
					<img :src="APP_CONFIG.logo" alt="">
					<view class="info-right">
						<text class="nickName">{{ userInfo.nickName }}</text>
						<view class="add-btn">添加</view>
					</view>
				</view>

			</view>
		</view>
	</view>
</template>
<script lang="ts">
	import { defineComponent, ref } from "vue";
	// import { showMsg } from '@/utils/Toast';
	import {
		getAddFriendApi,
		searchApi,
	} from "@/api/friend";
	import type { IResSearchUserInfo } from "@/types/friend/friend";
	import { APP_CONFIG } from '@/config/data';
	export default defineComponent({
		setup() {
			const tabList = ["全部", "用户", "群聊"]
			const personNumber = ref("");
			const selectTab = ref(0)
			const userInfo = ref<IResSearchUserInfo>();
			const getFriendInfo = () => {
				searchApi({ phone: personNumber.value }).then((res) => {
					if (res.code === 0) {
						userInfo.value = res.result;
					}
				});
			};
			const handleTab = (index : number) => {
				console.log(index);

				selectTab.value = Number(index)
			}
			const goBack = () => {
				uni.switchTab({
					url: "/pages/friend/friend",
				});
			}
			const confirmAddPerson = (userInfo)=>{
				getAddFriendApi({friendId: userInfo.userId,verify:"userInfo"}).then(res=>{
					if(res.code === 0){
						// showMsg('添加成功');
					}
				})
			}
			return {
				personNumber,
				getFriendInfo,
				userInfo,
				tabList,
				selectTab,
				handleTab,
				goBack,
				confirmAddPerson,
				APP_CONFIG
			};
		},
	});
</script>

<style lang="less" scoped>
	.add-person {
		width: 100%;
		height: 100%;
		background: #f5f8ff;
		box-sizing: border-box;
		color: #333;

		.person-search {
			display: flex;
			gap: 10rpx;
			padding: 20rpx 10rpx;
			align-items: center;
			color: #409eff;
			background-color: #fff;

			.search-box {
				flex: 1;
				display: flex;
				color: #333;
				padding: 14rpx;
				background-color: #f5f8ff;
				border-radius: 10rpx;
			}
		}

		/deep/ .place {
			color: #888b92;
		}

		.search-tab {
			background-color: #fff;
			display: flex;
			padding: 20rpx;
			gap: 16rpx;

			.select {
				color: #007aff;
				position: relative;
			}

			.select:before {
				position: absolute;
				content: "";
				height: 2rpx;
				bottom: -10rpx;
				width: 100%;
				left: 0;
				background-color: #007aff;
			}
		}

		.content {
			padding: 10rpx;
			.user {
				width: 100%;
				height: 400px;
				box-sizing: border-box;
				border-radius: 10rpx;
				background-color: #fff;
				padding: 20rpx;
				.info {
					display: flex;
					gap: 10rpx;
					align-items: center;
					padding: 20rpx;

					img {
						width: 80rpx;
						height: 80rpx;
						border-radius: 50%;
						background-color: #eee;
					}

					.info-right {
						flex: 1;
						height: 100rpx;
						display: flex;
						align-items: center;
						// border-bottom: 2rpx solid #F5F8FF;
						border-bottom: 2rpx solid #eee;

						.nickName {
							flex: 1;
						}

						.add-btn {
							height: auto;
							padding: 4rpx 12rpx;
							border: 1px solid #999;
							background-color: #fff;
							border-radius: 8rpx;
							font-size: 24rpx;
						}
					}
				}

				.info:last-child .info-right {
					border: 0px;
				}
			}
		}
	}
</style>