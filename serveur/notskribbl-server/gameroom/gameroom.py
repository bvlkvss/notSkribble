import random
from datetime import timedelta

from chatroom.private_chatroom import PrivateChatroom
from flask_socketio import emit
from instance import Instance, InstanceList
from message import UserMessage
from mongo_manager import MongoManager
from user import User, UserList
from virtual_player import VirtualPlayer

from gameroom.gameroom_errors import (RoomAlreadyFullError,
                                      UserAlreadyInRoomError)


class Gameroom(Instance):
    MAX_USERS = 4
    ROLES = ["Dessinateur", "Devineur"]

    def __init__(self, name: str, lang: str, diff: str = '') -> None:
        super().__init__(name)
        self.users: UserList = UserList()
        self.chatroom: PrivateChatroom = PrivateChatroom(name)
        self.current_img = ""
        self.mongo_manager = MongoManager()
        self.lang = lang
        self.diff = diff
        self.current_word = self._get_word()
        self.word = self.current_word['word']
        self.tries = 0
        self.round_counter = 0
        self.is_full = (self.users.length() == self.MAX_USERS)
        self.creator = None
        self.is_started = False
       

    def on_start(self, timestamp):
        pass

    def send_drawing_info(self, drawing_info):
        emit('drawing_info', {'code': 1,
                              'data': drawing_info}, room=self.chatroom.name)

    def emit_end_line(self, type):
        emit('end_line', {'code': 1, 'data': {'type': type}},
             room=self.chatroom.name)

    def is_user_here(self, user):
        if user in self.users:
            return True

        return False

    def reply_right(self, timestamp):
        pass
    
    def clear_users(self):
        copy_users = self.users.instances.copy()
        for user in copy_users:
            self.users.remove(user)
            if(not isinstance(user, VirtualPlayer)):
                user.rooms.remove(self.chatroom)
                self.chatroom.leave(user)
               
    def game_done(self):
        pass
    
    def add_virt_player(self, type, team):
        pass
    
    def remove_virt_player(self, team):
        pass

    def join(self, user: User) -> None:
        if self.users.length() >= self.MAX_USERS:
            raise RoomAlreadyFullError()
        if self.users.get_instance_by_sid(user.sid) is not None:
            raise UserAlreadyInRoomError()
        self.users.add(user)
        if(not isinstance(user, VirtualPlayer)):
            self.chatroom.join(user)
            user.rooms.add(self.chatroom)

    def leave(self, user: User) -> None:
        self.users.remove(user)
        if(not isinstance(user, VirtualPlayer)):
            user.rooms.remove(self.chatroom)
            self.chatroom.leave(user)

    def message(self, message: UserMessage) -> None:
        self.chatroom.message(message)

    def get_logs(self):
        return self.chatroom.get_logs()

    def verify_answer(self, answer: str) -> bool:
        return self.word.lower() == answer.lower()

    def handle_gameroom_message(self, user: User, message: str):
        message = UserMessage(user.name, message)
        self.chatroom.message(message)

    def get_end_time_stamp(self, start_time_stamp):
        end_time_stamp = ""
        if self.diff == "hard":
            end_time_stamp = start_time_stamp + timedelta(seconds=30)
        elif self.diff == "mid":
            end_time_stamp = start_time_stamp + timedelta(minutes=1)
        elif self.diff == "easy":
            end_time_stamp = start_time_stamp + \
                timedelta(minutes=1, seconds=30)

        return end_time_stamp.strftime('%B %d, %Y %H:%M:%S')

    def get_number_of_tries(self):
        num_of_tries = 0
        if self.diff == "hard":
            num_of_tries = 2
        elif self.diff == "mid":
            num_of_tries = 4
        elif self.diff == "easy":
            num_of_tries = 6

        return num_of_tries

    def get_hint(self, user):
        pass

    def get_type(self):
        pass

    def get_word():
        pass

    def _get_word(self) -> str:
        words = self.mongo_manager.get_words({'lang': self.lang, 'diff': self.diff})
        rand = random.randint(0, len(words) - 1)
        return words[rand]

    def get_usernames(self):
        usernames = []
        for user in self.users:
            usernames.append(user.name)

        return usernames


class GameroomList(InstanceList):
    def message(self, message: UserMessage, room: Gameroom) -> None:
        room.message(message)

    def get_gamerooms_by_type_and_difficulty(self, type, diff, lang):
        gamerooms = []
        for gameroom in self.instances:
            if gameroom.get_type() == type and gameroom.diff == diff and gameroom.lang == lang:
                if not gameroom.is_full and not gameroom.is_started:
                    gamerooms.append(gameroom)

        return gamerooms

    def remove_empty_gameroom(self, gameroom):
        if gameroom.users.is_empty() or self.all_users_are_virtual(gameroom):
            self.remove(gameroom)
        
    def all_users_are_virtual(self, gameroom):
        res = True
        for user in gameroom.users:
            if not isinstance(user, VirtualPlayer):
                res = False

        return res

    def remove_user_from_gameroom(self, user):
        gameroom = self.get_gameroom_by_user_in(user)
        if gameroom is not None:
            gameroom.leave(user)
            self.remove_empty_gameroom(gameroom)

    def get_gameroom_by_user_in(self, user):
        for gameroom in self.instances:
            if gameroom.is_user_here(user):
                return gameroom

        return None
