from user import User
from message import UserMessage
import random

from flask_socketio import emit

from chatroom.private_chatroom import PrivateChatroom
from data.virtual_players import (EMPTY_HINTS_TAG, LOSE_TAG, PLAYERS,
                                  START_TAG, WIN_TAG)
from instance import Instance
from mongo_manager import MongoManager
import eventlet

class VirtualPlayer(User):
    DRAWING_TIME = {
        'easy': 15,
        'mid': 20,
        'hard': 30
    }

    def __init__(self, name: str, difficulty: str, temper: str, lang: str, chatroom: PrivateChatroom):
        super().__init__(name, sid = random.randint(0,19999999))
        self.lang = lang
        self.temper = temper
        self.config = PLAYERS[temper]
        self.chatroom = chatroom
        self.responses = self.config['responses'][lang]
        self.drawing_time = VirtualPlayer.DRAWING_TIME[difficulty]
        self.diff = difficulty
        self.stop_drawing = False
        self.next_pair()

    def get_avatar(self):
        if self.temper == "nice":
            return 9
        elif self.temper == "rude":
            return 10
        elif self.temper == "arrogant":
            return 11

    def next_pair(self):
        diff = self.diff
        if self.diff == 'mid':
            diff = 'medium'
        pairs = self.mongo_manager.get_pairs({'lang': self.lang, 'difficulty':diff})
        rand = random.randint(0, len(pairs) - 1)
        self.pair = pairs[rand]
        self.hints = iter(self.pair['hints'])

    def solo_draw(self):
        lines = self.pair['lines']
        if self.pair['random']:
            random.shuffle(lines)
        drawing_data = {
            'lines':lines,
            'line_color': self.pair['line_color'],
            'type': self.pair['type'],
            'background': self.pair['background'],
            'drawing_time':self.drawing_time
        }
        emit('virtual_draw', {'code': 1,
                                'data': drawing_data}, room=self.chatroom.name)

    def draw(self):
        lines = self.pair['lines']
        if self.pair['random']:
            random.shuffle(lines)
        points = [point for line in lines for point in line]
        delta = self.drawing_time / len(points)
        drawing_data = {
            'line_color': self.pair['line_color'],
            'type': self.pair['type'],
            'background': self.pair['background']
        }
        for point in points:
            drawing_data['point'] = point
            emit('virtual_draw', {'code': 1,
                                'data': drawing_data}, room=self.chatroom.name)
            
            if self.stop_drawing:
                break

            eventlet.sleep(delta)

    def get_start_response(self):
        return self.responses[START_TAG]

    def get_win_response(self):
        return self.responses[WIN_TAG]

    def get_lose_response(self):
        return self.responses[LOSE_TAG]

    def get_hint_response(self):
        try:
            return next(self.hints)
        except StopIteration:
            return self.responses[EMPTY_HINTS_TAG]
    
    def send_response(self, response):
        message = UserMessage(self.name, response)
        self.chatroom.message(message)
