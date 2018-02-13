/**
 * Created by jiangtao on 21/01/2018.
 */
var Error_Msg ={
    SUCCESSED:0,
    FAILD:1
};

var MsgType = {
    MSG:{

    },
    CODE:{

    }
};

var config = {
    //severIp:"wss://xm-test.egret-labs.org:6008",
    //severIp:"ws://10.10.10.103:6008",
    //severIp:"ws://10.8.119.63:6008"
    severIp:"ws://lobby.tao-studio.net:6001"
};



var Define_Mask = {
    REQ:0,
    RSP:1,
    TRS:2,
    NTF:3,
    ACK:4,
    GTA:5,
};

var Define_App_Code = {
    MT_ACCOUNT:0xFF0,
    MT_LOBBY  :0xFF1,
};

var Define_Account = {
    CREATE_ACCOUNT:1, // 1
    USER_SIGN_IN:2,   // 2
    GUEST_SIGN_IN:3,  // 3
    GET_USER_INFO:4,   //4,
    UPDATE_USER_INFO:5,  // 5
    BIND_ACCOUNT:6,      // 6
};


var Define_Lobby =
  {
    CREATE_ROOM:1,  //1
    ENTER_ROOM:2,   //2
    GET_ROOM_LIST:3,//3
    LEAVE_ROOM:4,   //4
    DISBAND_ROOM:5, //5
    GET_ROOM_INFO:6, // 6
    APPLY_TOKEN:7,   // 7
    LEAVE_APP:8,     // 8
    CREATE_PK_ROOM:9, //
  };

  var Define_Cmd = {
    USER_NUM:0xFFF0,
    USER_LIST:0xFFF1,
    ROOM_INFO:0xFFF2,
    SCENCE_READY:0xFFF3,
  };




