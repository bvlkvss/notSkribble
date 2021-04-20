from user import User
from flask_socketio import emit
from datetime import timedelta, datetime
from virtual_player import VirtualPlayer

from gameroom.gameroom import Gameroom


class SoloGameroom(Gameroom):
    def __init__(self, name: str, lang: str, diff: str):
        self.MAX_USERS = 1
        super().__init__(name, lang, diff)
        self.guesser = ""
        self.virt_player = VirtualPlayer('[VIRT] Nico', diff, 'nice', lang, self.chatroom)
        self.drawer = self.virt_player.name
        self.current_pair  = self.virt_player.pair
        self.points = 0
    
    def join(self, user):
        super().join(user)
        self.guesser = user.name

    def leave(self, user):
        super().leave(user)
        emit('end_gameroom', {'code': 1, 'message': 'user quitted while in gameroom', 'data': {
            }}, room=self.chatroom.name)

    def on_start(self, timestamp):
        self.start_time = timestamp
        start_time, round_ending_time_stamp = self.init_round(timestamp)
        resp = {'startTime': start_time, 'endTime':round_ending_time_stamp, 'tries': self.tries, 'word':self.current_pair['word']}
        emit('start_gameroom', {'code': 1, 'data': resp}, room=self.chatroom.name)
        self.is_started = True
        self.virt_player.send_response(self.virt_player.get_start_response())
        self.draw_word()
    
    def next_round(self, timestamp):
        self.init_round(timestamp)
        self.virt_player.next_pair()
        self.current_pair = self.virt_player.pair
        resp = {'tries': self.tries, 'word':self.current_pair['word']}
        emit('next_round', {'code': 1, 'data': resp}, room=self.chatroom.name)
        self.draw_word()

    def handle_gameroom_message(self, user, message):
        super().handle_gameroom_message(user, message)
        if self.is_started and user.name == self.guesser:
            is_valid = self.verify_pair(message)
            time = 0
            if is_valid:
                self.virt_player.stop_drawing = True
                time = self.get_time_to_add()
                self.virt_player.send_response(self.virt_player.get_win_response())
                self.points += 1
            else:
                self.tries -= 1
                if self.tries == 0:
                    self.virt_player.send_response(self.virt_player.get_lose_response())

            emit("verify_answer", {'code': 1, 'data': {
                 'is_valid': is_valid, 'tries': self.tries, 'time':time, 'is_reply_right': False}}, room=self.chatroom.name)

    def get_hint(self, user):
        self.virt_player.send_response(self.virt_player.get_hint_response())

    def get_type(self):
        return "solo"

    def init_round(self, timestamp):
        start_timestamp = timestamp+timedelta(seconds=1)
        start_time = start_timestamp.strftime('%B %d, %Y %H:%M:%S')
        round_ending_time_stamp = self.get_end_time_stamp(start_timestamp)
        self.tries = self.get_number_of_tries()
        return start_time, round_ending_time_stamp
    
    def verify_pair(self, answer):
        return self.current_pair['word'].lower() == answer.lower()

    def draw_word(self):
        self.virt_player.solo_draw()
    
    def get_time_to_add(self):
        time = 0
        if self.diff == "hard":
            time = 3
        elif self.diff == "mid":
            time = 5
        elif self.diff == "easy":
            time = 10

        return time

    def get_end_time_stamp(self, start_time_stamp):
        end_time_stamp = ""
        if self.diff == "hard":
            end_time_stamp = start_time_stamp + timedelta(minutes=2)
        elif self.diff == "mid":
            end_time_stamp = start_time_stamp + timedelta(minutes=3)
        elif self.diff == "easy":
            end_time_stamp = start_time_stamp + \
                timedelta(minutes=4)

        return end_time_stamp.strftime('%B %d, %Y %H:%M:%S')
    
    def send_gameroom_stats(self, time):
        timestamp = User.jsonify_date(time)
        game_time = time - self.start_time
        stat_object = {"game_mode":self.get_type(),"timestamp":timestamp, "players":self.users.get_usernames(), "result":self.points}
        for user in self.users: 
            user.log_game_time(game_time)
            user.log_game_results(stat_object)
    
    def game_done(self):
        self.is_started = False
        emit('game_done', {'code': 1, 'data': {}}, room=self.chatroom.name)
        self.send_gameroom_stats(datetime.now())
