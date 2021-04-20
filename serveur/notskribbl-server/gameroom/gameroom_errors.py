class RoomAlreadyFullError(Exception):
    def __init__(self, message="The gameroom is already full") -> None:
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        return self.message


class UserAlreadyInRoomError(Exception):
    def __init__(self, message="The user is already in the room") -> None:
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        return self.message