from __future__ import annotations

from typing import TYPE_CHECKING

from message import UserMessage
from mongo_manager import MongoManager

from chatroom.chatroom import Chatroom
from chatroom.chatroom_errors import InvalidName
from chatroom.private_chatroom import PrivateChatroom

if TYPE_CHECKING:
    from user import User


class PublicChatroom(Chatroom):
    def __init__(self, name: str) -> None:
        if name.startswith(PrivateChatroom.PRIVATE_TAG):
            raise InvalidName()

        super().__init__(name)
        self.mongo_manager = MongoManager()
        try:
            self.mongo_manager.create_chatroom(name)
        except Exception:
            # TODO MAYBE HANDLE THIS BETTER, MAYBE IGNORE
            pass

    def message(self, message: UserMessage) -> None:
        super().message(message)
        self.mongo_manager.add_chatroom_logs(self.name, message)

    def get_logs(self) -> list[UserMessage]:
        return self.mongo_manager.get_chatroom_logs(self.name)
