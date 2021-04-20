class UnauthorizedUser(Exception):
    def __init__(self,
                 message="You are not authorized to join this room") -> None:
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        return self.message


class InvalidName(Exception):
    def __init__(self, message="The chosen name is invalid") -> None:
        self.message = message
        super().__init__(message)

    def __str__(self) -> str:
        return self.message