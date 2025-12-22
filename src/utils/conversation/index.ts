export const parseConversation = (conversationID: string, userId: string) =>{
  // 检查conversationID是否包含"_"
  if (conversationID.includes("_")) {
      // 使用 "_" 拆分 conversationID
      return conversationID.replace(/_/g, "").replace(userId, "").trim()
  }
  return conversationID
}

/**
 * 根据conversationId判断聊天类型
 * @param conversationId 会话ID
 * @returns 'single' | 'group'
 */
export const getChatType = (conversationId: string): 'single' | 'group' => {
  return conversationId.includes('private_') ? 'single' : 'group';
}
