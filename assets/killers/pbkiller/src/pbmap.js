/*eslint-disable*/
module.exports = {
    'ActionCode': {
        'AC': 0,
        'LOGIN': 1,
        'ENTER_HALL': 2,
        'ENTER_ROOM': 3,
        'SEND_CHAT_MESSAGE': 4,
        'table': {
            '0': {
                'name': 'AC',
                'code': 0,
                'req': null,
                'rsp': null
            },
            '1': {
                'name': 'LOGIN',
                'code': 1,
                'req': 'LoginReq',
                'rsp': 'LoginRsp'
            },
            '2': {
                'name': 'ENTER_HALL',
                'code': 2,
                'req': 'EnterHallReq',
                'rsp': 'EnterHallRsp'
            },
            '3': {
                'name': 'ENTER_ROOM',
                'code': 3,
                'req': 'EnterRoomReq',
                'rsp': 'EnterRoomRsp'
            },
            '4': {
                'name': 'SEND_CHAT_MESSAGE',
                'code': 4,
                'req': 'SendChatMessageReq',
                'rsp': 'null'
            }
        }
    },
    'PushCode': {
        'PC_START': 0,
        'RECV_CHAT_MESSAGE': 1,
        'USER_INFO_CHANGE': 2,
        'USER_ENTER_ROOM': 3,
        'USER_EXIT_ROOM': 4,
        'table': {
            '1': {
                'code': 1,
                'name': 'RECV_CHAT_MESSAGE',
                'push': 'ChatMessage'
            },
            '2': {
                'code': 2,
                'name': 'USER_INFO_CHANGE',
                'push': 'UserInfo'
            },
            '3': {
                'code': 3,
                'name': 'USER_ENTER_ROOM',
                'push': 'UserInfo'
            },
            '4': {
                'code': 4,
                'name': 'USER_EXIT_ROOM',
                'push': 'UserInfo'
            }
        }
    },
    'ErrorCode': {
        'SUCCESS': 0,
        'ERROR_TOKEN': 1
    }
};
