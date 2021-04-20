from gameroom.gameroom import Gameroom


class TutoGameroom(Gameroom):
    def __init__(self, name: str, lang: str, diff: str):
        self.MAX_USERS = 1
        super().__init__(name, lang, diff)
        self.guesser = ""
        
    def join(self, user):
        super().join(user)
        self.guesser = user.name
