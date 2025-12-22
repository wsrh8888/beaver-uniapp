<script lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { getLocal } from './utils/local';
import messageManager from '@/message-manager'
import cacheManager from '@/cache'
import { useInitStore } from '@/pinia/init/init'
import { useThemeStore } from '@/pinia/theme/theme'
import { track } from '@/logger/track'
import { reportVersionApi } from '@/api/update'
import Logger from '@/logger/logger'
import { showToast } from '@/component/toast'

export default {
	setup() {
		const logger = new Logger('应用启动');		
		onLaunch( async () => {
			console.log("App Launch");

			// 初始化缓存管理器
			try {
				await cacheManager.init();
				console.log('缓存管理器初始化成功');
			} catch (error: any) {
				logger.error({
					text: '缓存管理器初始化失败',
					data: {
						error: error?.message || '未知错误'
					}
				});
				console.error('缓存管理器初始化失败:', error);
			}

			// 初始化消息管理器
			try {
				messageManager.init();
				console.log('消息管理器初始化成功');
			} catch (error: any) {
				logger.error({
					text: '消息管理器初始化失败',
					data: {
						error: error?.message || '未知错误'
					}
				});
				console.error('消息管理器初始化失败:', error);
			}

			// 初始化主题
			const themeStore = useThemeStore();
			themeStore.initTheme();
			
			// 上报版本信息（仅在启动时调用一次）
			try {
				await reportVersionApi();
				console.log('版本信息上报成功');
			} catch (error: any) {
				logger.error({
					text: '版本信息上报失败',
					data: {
						error: error?.message || '未知错误'
					}
				});
				console.error('版本信息上报失败:', error);
			}
			
			// 追踪应用启动
			track.view('APP_LAUNCH', {
				timestamp: Date.now(),
				hasToken: !!getLocal('token')
			})
			
			const initStore = useInitStore();
			
			// 无论是否有token，都先测试认证接口是否可用
			
			if (!getLocal('token')) {				
				uni.reLaunch({
					url: 'pages/login/login'
				});
				return
			} else {
				await initStore.getAuthentication();

			}
			
			// 有token，初始化应用
			await initStore.initApp()
		});


		onHide(() => {
			// 应用进入后台时的清理逻辑
			console.log('应用进入后台');
		});

		return {
		};
	}
};
</script>


<style>

page {
	height: 100vh;
}

#app {
	color: #333;
}

/* 这个高度我们得手动去掉，否则纵向滚动做不了，它会撑开盒子高度导致两个滚动条 */
:deep(.uni-app--showtabbar uni-page-wrapper::after) {
	display: none !important;
	height: 0 !important;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
	display: none;
	width: 0 !important;
	height: 0 !important;
	-webkit-appearance: none;
	background: transparent;
	color: transparent;
}
</style>
