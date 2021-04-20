from __future__ import annotations

from typing import TYPE_CHECKING

from message import UserMessage

from chatroom.chatroom import Chatroom

if TYPE_CHECKING:
    from user import User


class PrivateChatroom(Chatroom):
    PRIVATE_TAG = '[PRIV]'

    def __init__(self, name: str) -> None:
        super().__init__(PrivateChatroom.PRIVATE_TAG + name)
        self._logs: list[UserMessage] = []

    def message(self, message: UserMessage) -> None:
        super().message(message)
        self._logs.append(message)

    def get_logs(self) -> list[UserMessage]:
        return self._logs.copy()
