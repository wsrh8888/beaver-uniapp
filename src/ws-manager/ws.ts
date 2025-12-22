import { getLocal } from "@/utils/local";
import { ws } from '@/env.json'
import type { IWsMessage } from '@/types/ws/command';
import Logger from '@/logger/logger';
import { syncManager } from '@/database/manager';

/**
 * @description: WebSocket配置选项
 */
interface WsConfig {
  reconnectInterval?: number; // 重连间隔时间
  maxReconnectAttempts?: number; // 最大重连次数
  heartbeatInterval?: number; // 心跳间隔
  connectionQualityCheckInterval?: number; // 连接质量检测间隔
  maxHeartbeatFailures?: number; // 最大心跳失败次数
  networkRecoveryDelay?: number; // 网络恢复后的延迟重连时间
}

/**
 * @description: WebSocket状态
 */
type WsStatus = 'connecting' | 'connected' | 'closed' | 'error';

/**
 * @description: WebSocket事件回调
 */
interface WsEventCallbacks {
  onMessage?: (message: IWsMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

/**
 * @description: WebSocket连接管理器 - 纯连接层，不处理业务逻辑
 */
class WsManager {
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private heartbeatInterval: number;
  private connectionQualityCheckInterval: number;
  private maxHeartbeatFailures: number;
  private networkRecoveryDelay: number;

  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private connectionQualityTimer: number | null = null;
  private networkRecoveryTimer: number | null = null;
  private reconnectAttempts = 0;
  private heartbeatFailures = 0;
  private lastHeartbeatTime: number = 0; // 最后一次心跳时间
  private heartbeatTimeoutTimer: number | null = null; // 心跳超时定时器
  private isManualClose = false; // 是否手动关闭
  private isNetworkAvailable = true; // 网络是否可用
  private isAppInBackground = false; // 应用是否在后台
  private lastNetworkStatus: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'none' | 'unknown' = 'unknown';
  private eventCallbacks: WsEventCallbacks = {};
  
  public isConnected = false;
  public isClose = false;
  public status: WsStatus = 'closed';

  constructor(config: WsConfig = {}) {
    this.reconnectInterval = config.reconnectInterval || 5000;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    this.connectionQualityCheckInterval = config.connectionQualityCheckInterval || 60000; // 1分钟检查一次连接质量
    this.maxHeartbeatFailures = config.maxHeartbeatFailures || 3;
    this.networkRecoveryDelay = config.networkRecoveryDelay || 2000; // 网络恢复后2秒再连接

    this.initEventListeners();
    this.initAppStateListeners();
    this.initNetworkStatusListener();
    this.startConnectionQualityCheck();
  }

  /**
   * @description: 设置事件回调
   */
  public setEventCallbacks(callbacks: WsEventCallbacks) {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks };
  }

  /**
   * @description: 初始化WebSocket事件监听
   */
  private initEventListeners(): void {
    uni.onSocketOpen(this.onOpen.bind(this));
    uni.onSocketClose(this.onClose.bind(this));
    uni.onSocketError(this.onError.bind(this));
    uni.onSocketMessage(this.onMessage.bind(this));
  }

  /**
   * @description: 初始化网络状态监听
   */
  private initNetworkStatusListener(): void {
    // 监听详细网络状态变化
    uni.onNetworkStatusChange((res) => {
      console.log('网络状态变化:', res);
      const wasNetworkAvailable = this.isNetworkAvailable;
      this.isNetworkAvailable = res.isConnected;
      this.lastNetworkStatus = res.networkType as any;

      if (res.isConnected && !wasNetworkAvailable) {
        // 网络从不可用变为可用
        console.log('网络恢复，延迟重连以确保网络稳定');
        this.scheduleNetworkRecoveryReconnect();
      } else if (!res.isConnected && wasNetworkAvailable) {
        // 网络从可用变为不可用
        console.log('网络断开，停止重连尝试');
        this.handleNetworkUnavailable();
      }
    });
  }

  /**
   * @description: 初始化应用状态监听
   */
  private initAppStateListeners(): void {
    // 监听应用状态变化
    uni.onAppShow(() => {
      console.log('应用进入前台');
      this.isAppInBackground = false;

      // 应用回到前台，如果网络可用且未连接，则尝试连接
      if (this.isNetworkAvailable && !this.isConnected && !this.isManualClose) {
        setTimeout(() => {
          this.attemptReconnect('app_foreground');
        }, 500);
      }
    });

    uni.onAppHide(() => {
      console.log('应用进入后台');
      this.isAppInBackground = true;
      this.clearHeartbeatTimeout();

      // 应用进入后台时，可以保持连接但减少心跳频率
      // 这里暂时保持现有逻辑
    });
  }

  /**
   * @description: 计划网络恢复后的重连
   */
  private scheduleNetworkRecoveryReconnect(): void {
    this.clearNetworkRecoveryTimer();
    this.networkRecoveryTimer = setTimeout(() => {
      if (this.isNetworkAvailable && !this.isConnected && !this.isManualClose) {
        this.attemptReconnect('network_recovery');
      }
    }, this.networkRecoveryDelay) as any;
  }

  /**
   * @description: 处理网络不可用的情况
   */
  private handleNetworkUnavailable(): void {
    console.log('网络不可用，清除所有重连定时器');
    this.clearReconnectTimer();
    this.clearNetworkRecoveryTimer();
    this.reconnectAttempts = 0; // 重置重连次数，网络恢复后重新计算
  }

  /**
   * @description: 尝试重连（统一的入口）
   */
  private attemptReconnect(reason: string): void {
    console.log(`尝试重连，原因: ${reason}, 网络可用: ${this.isNetworkAvailable}, 应用后台: ${this.isAppInBackground}`);

    // 只有在网络可用且应用在前台时才尝试重连
    if (!this.isNetworkAvailable) {
      console.log('网络不可用，跳过重连');
      return;
    }

    if (this.isAppInBackground) {
      console.log('应用在后台，跳过重连');
      return;
    }

    if (this.isConnected || this.status === 'connecting') {
      console.log('已经连接或正在连接中，跳过重连');
      return;
    }

    if (this.isManualClose) {
      console.log('手动关闭状态，跳过重连');
      return;
    }

    this.initSocket().catch((error) => {
      console.error('重连失败:', error);
    });
  }

  /**
   * @description: 初始化WebSocket连接
   */
  public async initSocket(): Promise<void> {
    // 增加更多的前置检查
    if (!this.isNetworkAvailable) {
      console.log('网络不可用，跳过连接');
      return;
    }

    if (this.isAppInBackground) {
      console.log('应用在后台，跳过连接');
      return;
    }

    if (this.isConnected || this.status === 'connecting') {
      return;
    }

    const token = getLocal('token');
    if (!token) {
      console.error('未登录，无法连接 WebSocket');
      throw new Error('No token available');
    }

    this.status = 'connecting';
    this.isClose = false;
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        uni.connectSocket({
          url: `${ws}?token=${token}`,
          method: 'GET',
          success: () => {
            console.log('WebSocket 连接请求成功');
            resolve();
          },
          fail: (error) => {
            console.error('WebSocket 连接请求失败:', error);
            this.status = 'error';
            reject(error);
          }
        });
      } catch (error) {
        const logger = new Logger('WebSocket管理');
        logger.error({
          text: 'WebSocket连接异常',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
        console.error('WebSocket 连接异常:', error);
        this.status = 'error';
        reject(error);
      }
    });
  }

  /**
   * @description: WebSocket连接成功回调
   */
  private onOpen(): void {
    console.log('WebSocket 连接成功');
    this.isConnected = true;
    this.status = 'connected';
    this.reconnectAttempts = 0;
    this.heartbeatFailures = 0; // 重置心跳失败次数
    this.clearTimers();
    this.startHeartbeat();
    this.startConnectionQualityCheck();

    // 触发连接成功回调
    if (this.eventCallbacks.onConnect) {
      this.eventCallbacks.onConnect();
    }
  }

  /**
   * @description: WebSocket连接关闭回调
   */
  private onClose(data: any): void {
    console.log('WebSocket 连接关闭', data);
    this.isConnected = false;
    this.status = 'closed';
    this.clearTimers();

    // 分析关闭原因
    if (data.code === 1006) {
      console.warn('WebSocket 异常关闭 (1006)，可能是网络问题或服务器问题');
    } else if (data.code === 1000) {
      console.log('WebSocket 正常关闭');
    } else if (data.code === 1001) {
      console.log('WebSocket 端点离线或服务器重启');
    }

    // 触发断开连接回调
    if (this.eventCallbacks.onDisconnect) {
      this.eventCallbacks.onDisconnect();
    }

    // 只有在非手动关闭且网络可用且应用在前台时才尝试重连
    if (!this.isManualClose && this.isNetworkAvailable && !this.isAppInBackground) {
      this.attemptReconnect('connection_closed');
    } else {
      console.log('跳过重连: 手动关闭或网络不可用或应用在后台');
    }
  }

  /**
   * @description: WebSocket连接错误回调
   */
  private onError(error: any): void {
    console.error('WebSocket 连接错误:', error);
    this.isConnected = false;
    this.status = 'error';
    this.clearTimers();

    // 触发错误回调
    if (this.eventCallbacks.onError) {
      this.eventCallbacks.onError(error);
    }

    // 只有在网络可用且应用在前台时才尝试重连
    if (!this.isManualClose && this.isNetworkAvailable && !this.isAppInBackground) {
      this.attemptReconnect('connection_error');
    }
  }

  /**
   * @description: 处理接收到的消息 - 转发给同步管理器和消息处理器
   */
  private onMessage(event: any): void {
    try {
      const data = JSON.parse(event.data);
      console.log('收到WebSocket消息:', data);

      // 转发给同步管理器处理数据同步（自动更新本地数据库）
      syncManager.handleWsMessage(data).catch((error) => {
        console.error('同步管理器处理消息失败:', error);
      });

      // 触发连接活跃回调（用于重置心跳超时）
      if (data.command === 'HEARTBEAT') {
        this.resetHeartbeatTimeout();
      }

      // 转发给消息处理器（保持向后兼容）
      if (this.eventCallbacks.onMessage) {
        this.eventCallbacks.onMessage(data);
      }

      // 广播消息事件给其他模块
      this.broadcastMessage(data);
    } catch (error) {
      console.error('解析WebSocket消息失败:', error);
    }
  }

  /**
   * @description: 重置心跳超时
   */
  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * @description: 广播消息事件
   */
  private broadcastMessage(message: IWsMessage): void {
    // 通过 uni.$emit 广播消息事件，让其他页面/组件能够监听到
    uni.$emit('ws_message', message);

    // 同时通过全局事件广播
    if (typeof getApp !== 'undefined') {
      const app = getApp();
      if (app && app.globalData) {
        // 存储最新消息到全局状态
        if (!app.globalData.latestMessages) {
          app.globalData.latestMessages = [];
        }
        app.globalData.latestMessages.push(message);

        // 只保留最近的10条消息
        if (app.globalData.latestMessages.length > 10) {
          app.globalData.latestMessages = app.globalData.latestMessages.slice(-10);
        }
      }
    }
  }

  /**
   * @description: 重连机制
   */
  private reconnect(): void {
    if (this.isManualClose || !this.isNetworkAvailable || this.isAppInBackground) {
      console.log('跳过重连: 手动关闭或网络不可用或应用在后台');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`第 ${this.reconnectAttempts} 次重连尝试`);

    this.reconnectTimer = setTimeout(() => {
      this.attemptReconnect('reconnect_attempt');
    }, this.reconnectInterval) as any;
  }

  /**
   * @description: 开始心跳
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval) as any;
  }

  /**
   * @description: 发送心跳
   */
  private sendHeartbeat(): void {
    if (!this.isConnected) return;

    // 如果应用在后台，减少心跳频率
    if (this.isAppInBackground) {
      console.log('应用在后台，跳过心跳');
      return;
    }

    const heartbeatMessage: IWsMessage = {
      command: 'HEARTBEAT' as any,
      content: {
        timestamp: Date.now(),
        data: {
          type: 'heartbeat' as any,
          body: {}
        }
      }
    };

    try {
      this._sendMessage(heartbeatMessage);
      this.lastHeartbeatTime = Date.now();
      this.startHeartbeatTimeout();
    } catch (error) {
      console.error('发送心跳失败:', error);
      this.heartbeatFailures++;
      if (this.heartbeatFailures >= this.maxHeartbeatFailures) {
        console.warn(`心跳失败次数达到上限(${this.maxHeartbeatFailures})，断开连接`);
        this.disconnect();
      }
    }
  }

  /**
   * @description: 开始心跳超时检测
   */
  private startHeartbeatTimeout(): void {
    this.clearHeartbeatTimeout();
    this.heartbeatTimeoutTimer = setTimeout(() => {
      console.warn('心跳超时，关闭连接');
      this.disconnect();
    }, this.heartbeatInterval * 2) as any;
  }

  /**
   * @description: 清除心跳超时定时器
   */
  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * @description: 清除网络恢复定时器
   */
  private clearNetworkRecoveryTimer(): void {
    if (this.networkRecoveryTimer) {
      clearTimeout(this.networkRecoveryTimer);
      this.networkRecoveryTimer = null;
    }
  }

  /**
   * @description: 清除重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * @description: 开始连接质量检查
   */
  private startConnectionQualityCheck(): void {
    this.connectionQualityTimer = setInterval(() => {
      this.checkConnectionQuality();
    }, this.connectionQualityCheckInterval) as any;
  }

  /**
   * @description: 检查连接质量
   */
  private checkConnectionQuality(): void {
    if (!this.isConnected) return;

    const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeatTime;
    if (timeSinceLastHeartbeat > this.heartbeatInterval * 2) {
      console.warn('连接质量差，最后心跳时间过久，主动重连');
      this.disconnect();
      setTimeout(() => {
        this.attemptReconnect('connection_quality_check');
      }, 1000);
    }
  }

  /**
   * @description: 发送消息 - 纯数据发送，不处理业务逻辑
   */
  public sendMessage(message: IWsMessage): void {
    if (!this.isConnected) {
      console.error('WebSocket未连接，无法发送消息');
      throw new Error('WebSocket not connected');
    }

    this._sendMessage(message);
  }

  /**
   * @description: 内部发送消息方法
   */
  private _sendMessage(message: IWsMessage): void {
    try {
      const messageStr = JSON.stringify(message);
      uni.sendSocketMessage({
        data: messageStr,
        success: () => {
          console.log('消息发送成功:', message);
        },
        fail: (error) => {
          console.error('消息发送失败:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('发送消息异常:', error);
      throw error;
    }
  }

  /**
   * @description: 清除所有定时器
   */
  private clearTimers(): void {
    this.clearReconnectTimer();
    this.clearNetworkRecoveryTimer();
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.connectionQualityTimer) {
      clearInterval(this.connectionQualityTimer);
      this.connectionQualityTimer = null;
    }
    this.clearHeartbeatTimeout();
  }

  /**
   * @description: 断开连接
   */
  public disconnect(): void {
    console.log('手动断开WebSocket连接');
    this.isManualClose = true;
    this.clearTimers();
    
    if (this.isConnected) {
      uni.closeSocket({
        success: () => {
          console.log('WebSocket连接已关闭');
        },
        fail: (error) => {
          console.error('关闭WebSocket连接失败:', error);
        }
      });
    }
  }

  /**
   * @description: 获取连接状态
   */
  public getStatus(): WsStatus {
    return this.status;
  }

  /**
   * @description: 获取连接信息
   */
  public getConnectionInfo(): object {
    return {
      isConnected: this.isConnected,
      status: this.status,
      reconnectAttempts: this.reconnectAttempts,
      heartbeatFailures: this.heartbeatFailures,
      lastHeartbeatTime: this.lastHeartbeatTime,
      isNetworkAvailable: this.isNetworkAvailable,
      lastNetworkStatus: this.lastNetworkStatus,
      isAppInBackground: this.isAppInBackground
    };
  }
}

// 导出单例
const wsManager = new WsManager();
export default wsManager;
