//chat 相关协议

var DefineChat_Cmd = {
    TEXT_MSG:1,  // 发文字聊天
    ANSWER:2,    // 回答问题
    INFO:3,      // 服务器向客户端发送的通知信息
    START_GAME:4, // 开始答题游戏
};

var DefineChat_Ntf_Type = {
    COUNT_DWON:1,   // 倒计时
    SHOW_QUESTION:2, //出题
    SHOW_RANK:3,     //实时排行
    SHOW_RESULT:4,    //结果
};