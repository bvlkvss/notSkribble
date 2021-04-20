from __future__ import annotations

from typing import TYPE_CHECKING

from flask_socketio import close_room, emit, join_room, leave_room
from instance import Instance, InstanceList
from message import UserMessage

if TYPE_CHECKING:
    from user import User


class Chatroom(Instance):
    def __init__(self, name: str) -> None:
        super().__init__(name)

    def join(self, user: User) -> None:
        join_room(self.name, user.sid)

    def leave(self, user: User) -> None:
        leave_room(self.name, user.sid)

    def message(self, message: UserMessage) -> None:
        data = message.to_dict()
        data.update({'chatroom': self.name})
        emit('chatroom_message', {
            'code': 1,
            'data': data
        }, room=self.name)

    def get_logs(self) -> list[UserMessage]:
        raise NotImplementedError()

    def close(self):
        close_room(self.name)


class ChatroomList(InstanceList):
    def remove(self, chatroom: Chatroom) -> None:
        super().remove(chatroom)

    def message(self, message: UserMessage, room: Chatroom) -> None:
        room.message(message)
