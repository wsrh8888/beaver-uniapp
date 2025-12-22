// 消息类型枚举
export enum MessageType {
  TEXT = 1,
  IMAGE = 2,
  VOICE = 3,
  VIDEO = 4,
  FILE = 5,
}

// 聊天类型
export type ChatType = 'single' | 'group';

// 消息发送者信息
export interface MessageSender {
  userId: string;
  avatar: string;
  nickName?: string;
}

// 文本消息
export interface TextMessage {
  type: MessageType.TEXT;
  textMsg: {
    content: string;
  };
}

// 图片消息
export interface ImageMessage {
  type: MessageType.IMAGE;
  imageMsg: {
    src: string;
    width?: number;
    height?: number;
  };
}

// 语音消息
export interface VoiceMessage {
  type: MessageType.VOICE;
  voiceMsg: {
    src: string;
    duration: number;
  };
}

// 视频消息
export interface VideoMessage {
  type: MessageType.VIDEO;
  videoMsg: {
    src: string;
    cover?: string;
    duration?: number;
  };
}

// 文件消息
export interface FileMessage {
  type: MessageType.FILE;
  fileMsg: {
    name: string;
    size: number;
    url: string;
  };
}

// 聊天消息
export type MessageContent = TextMessage | ImageMessage | VoiceMessage | VideoMessage | FileMessage;

// 完整的消息结构
export interface ChatMessage {
  id: number | string;
  conversationId: string;
  msg: MessageContent;
  sender: MessageSender;
  timestamp?: number;
  status?: 'sending' | 'sent' | 'failed';
}

// 聊天状态
export interface ChatState {
  inputMode: 'text' | 'voice';
  showEmoji: boolean;
  showMore: boolean;
  isRecording: boolean;
  keyboardHeight: number;
  emojiHeight: number;
}

// 事件类型
export interface ChatEvents {
  sendMessage: (message: ChatMessage) => void;
  recordStart: () => void;
  recordEnd: () => void;
  recordCancel: () => void;
  imageSelect: (paths: string[]) => void;
  emojiSelect: (emoji: string) => void;
}

// 聊天配置选项
export interface ChatOptions {
  maxImageSize?: number;
  maxVoiceDuration?: number;
  enableVoiceMessage?: boolean;
  enableImageMessage?: boolean;
  enableEmojiMessage?: boolean;
} 