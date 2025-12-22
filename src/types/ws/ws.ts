export interface IWsContent {
  timestamp: number;
  messageId?: string;
  data: {
    type: string;
    body: {
      id: number;
      conversationId: string;
      msg: {
        type: number;
        textMsg: {
          content: string;
        };
        imageMsg: null;
      };
      sender: {
        userId: string;
        avatar: string;
        nickName: string;
      };
      created_at: string;
      msgPreview: string;
    };
  };
}

export interface IWsStore {
  code: number;
  command: "CHAT_MESSAGE" | 'COMMON_UPDATE_MESSAGE';
  content: IWsContent;
  messageId?: string;
}
