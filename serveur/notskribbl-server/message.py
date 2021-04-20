from datetime import datetime
from time import strftime, gmtime


class UserMessage:
    def __init__(self, user: str,  message: str, date_time: str= None, timestamp: str = None, timezone: str = None) -> None:
        self.user = user
        self.message = message
        self.date_time = date_time or datetime.now().strftime('%B %d, %Y %H:%M:%S')
        self.timestamp = timestamp or datetime.now().strftime('%H:%M:%S')
        self.timezone = timezone or strftime('%z', gmtime())

    @classmethod
    def from_dict(cls, obj: dict):
        return cls(
            obj['user'],
            obj['message'],
            obj.get('date_time', None),
            obj.get('timestamp', None),
            obj.get('timezone', None)
        )

    def to_dict(self):
        return vars(self)

    def __str__(self) -> str:
        return f"[{self.timestamp}] {self.user}: {self.message}"
