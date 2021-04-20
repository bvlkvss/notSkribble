from datetime import datetime
from user import User
from flask_socketio import emit

from gameroom.gameroom import Gameroom


class FreeGameroom(Gameroom):
    def __init__(self, name:str, lang:str, diff:str):
        self.MAX_USERS = 1
        super().__init__(name, lang, diff)

    def on_start(self, timestamp):
        starting_word = self.current_word['word']
        resp = {'word':starting_word}
        self.start_time = timestamp
        emit('start_gameroom',{'code':1,'data':resp}, room = self.chatroom.name)
        self.is_started = True

    def get_word(self):
        resp = {'word':self._get_word()['word']}
        emit('get_word', {'code':1,'data':resp}, room = self.chatroom.name)

    def get_type(self):
        return "free"
    
    def send_gameroom_stats(self, time):
        game_time = time - self.start_time
        timestamp = User.jsonify_date(time)
        stat_object = {"game_mode":self.get_type(),"timestamp":timestamp, "players":self.users.get_usernames(), "result":0}
        for user in self.users: 
            user.log_game_time(game_time)
            user.log_game_results(stat_object)

    def game_done(self):
        self.is_done = True
        emit('game_done', {'code': 1, 'data': {}}, room=self.chatroom.name)
        self.send_gameroom_stats(datetime.now())
