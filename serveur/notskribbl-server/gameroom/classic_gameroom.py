import random
from datetime import timedelta, datetime

import eventlet
from virtual_player import VirtualPlayer

from flask_socketio import emit
from message import UserMessage
from user import User

from gameroom.gameroom import Gameroom

VIRT_NAMES = ['[VIRT] Moha', '[VIRT] Gullit', '[VIRT] Sarah', '[VIRT] Simeon', '[VIRT] Alexis', '[VIRT] Nibrass','[VIRT] Mihaile', '[VIRT] Hakz']
class ClassicGameroom(Gameroom):
    def __init__(self, name: str, lang: str, diff: str, isBlind=False):
        super().__init__(name, lang, diff)
        self.red_virt_player = {}
        self.blue_virt_player = {}
        self.isBlind = isBlind
        self.red_team = []
        self.blue_team = []
        self.blue_previous_drawer = ""
        self.red_previous_drawer = ""
        self.drawer = ""
        self.guesser = ""
        self.playing_team = []
        self.reply_right_team = []
        self.on_reply_right = False
        self.blue_team_points = 0
        self.red_team_points = 0

    def join(self, user: User):
        super().join(user)
        if len(self.blue_team) == 0:
            self.add_to_team(user.name, 'blue')
        elif len(self.blue_team) == 1 and len(self.red_team) == 0:
            self.add_to_team(user.name, 'red')
        elif len(self.blue_team) == 1 and len(self.red_team) == 1:
            self.add_to_team(user.name, 'blue')
        elif len(self.blue_team) == 1 and len(self.red_team) == 2:
            self.add_to_team(user.name, 'blue')
        else:
            self.add_to_team(user.name, 'red')
        resp_object = {'red': self.red_team, 'red_avatars':self.get_avatars("red"), 'blue': self.blue_team, 'blue_avatars':self.get_avatars("blue")}
        emit('join_gameroom', {'code': 1,
                               'data': resp_object}, room=self.chatroom.name)

    def leave(self, user):
        super().leave(user)
        if self.is_started:
            emit('end_gameroom', {'code': 2, 'message': 'user quitted while playing', 'data': {
            }}, room=self.chatroom.name)
            copy_users = self.users.instances.copy()
            for user in copy_users:
                super().leave(user)
        elif user == self.creator:
            emit('end_gameroom', {'code': 3, 'message': 'the creator of this gameroom disconnected', 'data': {
            }}, room=self.chatroom.name)
            copy_users = self.users.instances.copy()
            for user in copy_users:
                super().leave(user)
        else:
            self.resend_teams()
            emit('join_gameroom', {'code': 2, 'message': f'user {user.name} quitted the gameroom', 'data': {
                 'red': self.red_team, 'red_avatars':self.get_avatars("red"), 'blue': self.blue_team, 'blue_avatars':self.get_avatars("blue")}}, room=self.chatroom.name)

    
    def add_virt_player(self, type, team):
        if team == "red" and len(self.red_team) < 2 :
            team_name = "red team" if self.lang == "en" else "équipe rouge"
            self.red_virt_player = VirtualPlayer((random.choice(VIRT_NAMES) + " -> " + team_name), self.diff, type, self.lang, self.chatroom)
            self.users.add(self.red_virt_player)
            self.add_to_team(self.red_virt_player.name, 'red')
        elif team == "blue" and len(self.blue_team) < 2:
            team_name = "blue team" if self.lang == "en" else "équipe bleu"
            self.blue_virt_player = VirtualPlayer((random.choice(VIRT_NAMES)+ " -> " + team_name), self.diff, type, self.lang, self.chatroom)   
            self.users.add(self.blue_virt_player)
            self.add_to_team(self.blue_virt_player.name, 'blue')

        resp_object = {'red': self.red_team,'red_avatars':self.get_avatars("red"), 'blue': self.blue_team, 'blue_avatars':self.get_avatars("blue")}
        emit('join_gameroom', {'code': 1,
                               'data': resp_object}, room=self.chatroom.name)

    def remove_virt_player(self, team):
        if team == "red":
            self.red_team.remove(self.red_virt_player.name)
            self.users.remove(self.red_virt_player)
            self.red_virt_player = {}
        if team == "blue":
            self.blue_team.remove(self.blue_virt_player.name)
            self.users.remove(self.blue_virt_player)
            self.blue_virt_player = {}

        resp_object = {'red': self.red_team,'red_avatars':self.get_avatars("red"), 'blue': self.blue_team, 'blue_avatars':self.get_avatars("blue")}
        emit('join_gameroom', {'code': 1,
                               'data': resp_object}, room=self.chatroom.name)

    def on_start(self, timestamp):
        self.start_time = timestamp
        self.playing_team = self.blue_team
        start_time, round_ending_time_stamp = self.init_round(timestamp, True)
        self.blue_previous_drawer = self.drawer
        self.word = self.current_word['word']
        if isinstance(self.blue_virt_player, VirtualPlayer) and self.drawer == self.blue_virt_player.name:
            self.word = self.blue_virt_player.pair['word']
            self.blue_virt_player.send_response(self.blue_virt_player.get_start_response())
        
        if isinstance(self.red_virt_player, VirtualPlayer):
            self.red_virt_player.send_response(self.red_virt_player.get_start_response())

        resp = {'drawer': self.drawer, 'startTime': start_time, 'endTime': round_ending_time_stamp,
                'word': self.word, 'tries': self.tries}
        emit('start_gameroom', {'code': 1, 'data': resp},
             room=self.chatroom.name)
        self.is_started = True
        if isinstance(self.blue_virt_player, VirtualPlayer) and self.drawer == self.blue_virt_player.name:
            eventlet.sleep(5)
            self.blue_virt_player.solo_draw()
            
        
        

    def reply_right(self, timestamp):
        self.on_reply_right = True
        self.reply_right_team = self.red_team if self.playing_team == self.blue_team else self.blue_team
        start_timestamp = timestamp+timedelta(seconds=5)
        start_time = start_timestamp.strftime('%B %d, %Y %H:%M:%S')
        round_ending_time_stamp = start_timestamp+timedelta(seconds=30)
        round_ending_time_stamp_str = round_ending_time_stamp.strftime(
            '%B %d, %Y %H:%M:%S')
        resp = {'startTime': start_time,
                'endTime': round_ending_time_stamp_str}
        emit('reply_right', {'code': 1, 'data': resp}, room=self.chatroom.name)

    def next_round(self, timestamp):
        self.on_reply_right = False
        self.playing_team = self.red_team if self.playing_team == self.blue_team else self.blue_team
        start_time, round_ending_time_stamp = self.init_round(timestamp)
        self.current_word = self._get_word()
        self.word = self.current_word['word']
        if self.playing_team == self.red_team:
            self.red_previous_drawer = self.drawer
        
        if isinstance(self.blue_virt_player, VirtualPlayer) and self.drawer == self.blue_virt_player.name:
            self.blue_virt_player.next_pair()
            self.word = self.blue_virt_player.pair['word']
        elif isinstance(self.red_virt_player, VirtualPlayer) and self.drawer == self.red_virt_player.name:
            self.red_virt_player.next_pair()
            self.word = self.red_virt_player.pair['word']
            
        resp = {'drawer': self.drawer, 'startTime': start_time, 'endTime': round_ending_time_stamp, 'word': self.word,
                'tries': self.tries, 'red_team_pts': self.red_team_points, 'blue_team_pts': self.blue_team_points}
        emit('next_round', {'code': 1, 'data': resp}, room=self.chatroom.name)
        
        if isinstance(self.blue_virt_player, VirtualPlayer) and self.drawer == self.blue_virt_player.name:
            eventlet.sleep(5)
            self.blue_virt_player.solo_draw()
        elif isinstance(self.red_virt_player, VirtualPlayer) and self.drawer == self.red_virt_player.name:
            eventlet.sleep(5)
            self.red_virt_player.solo_draw()

    def game_done(self):
        self.is_started = False
        winner = "equal"
        if self.blue_team_points > self.red_team_points:
            winner = "blue"
        elif self.red_team_points > self.blue_team_points:
            winner = "red"
        
        resp = {'red_team_pts': self.red_team_points,
                'blue_team_pts': self.blue_team_points, 'winner': winner}
        emit('game_done', {'code': 1, 'data': resp}, room=self.chatroom.name)

        self.send_gameroom_stats(datetime.now())


    def handle_gameroom_message(self, user: User, message: str):
        super().handle_gameroom_message(user, message)
        if self.on_reply_right:
            if user.name in self.reply_right_team:
                is_valid = self.verify_answer(message)
                self.tries = 0
                if is_valid:
                    self.update_points(self.reply_right_team)
                emit("verify_answer", {'code': 1, 'data': {
                     'is_valid': is_valid, 'tries': self.tries, 'is_reply_right': True}}, room=self.chatroom.name)

        elif self.is_started and user.name == self.guesser:
            is_valid = self.verify_answer(message)
            if is_valid:
                self.update_points(self.playing_team)
                if isinstance(self.red_virt_player, VirtualPlayer) and self.red_virt_player.name in self.playing_team:
                    self.red_virt_player.send_response(self.red_virt_player.get_win_response())
                elif isinstance(self.blue_virt_player, VirtualPlayer) and self.blue_virt_player.name in self.playing_team:
                    self.blue_virt_player.send_response(self.blue_virt_player.get_win_response())
            else:
                self.tries -= 1
                if self.tries == 0:
                    if isinstance(self.red_virt_player, VirtualPlayer) and self.red_virt_player.name in self.playing_team:
                        self.red_virt_player.send_response(self.red_virt_player.get_lose_response())
                    elif isinstance(self.blue_virt_player, VirtualPlayer) and self.blue_virt_player.name in self.playing_team:
                        self.blue_virt_player.send_response(self.blue_virt_player.get_lose_response())

            emit("verify_answer", {'code': 1, 'data': {
                 'is_valid': is_valid, 'tries': self.tries, 'is_reply_right': False}}, room=self.chatroom.name)
    
    def get_hint(self,user):
        if self.on_reply_right:
            if isinstance(self.blue_virt_player, VirtualPlayer) and self.blue_virt_player.name not in self.reply_right_team:
                self.blue_virt_player.send_response(self.blue_virt_player.get_hint_response())
            elif isinstance(self.red_virt_player, VirtualPlayer) and self.red_virt_player.name not in self.reply_right_team:
                self.red_virt_player.send_response(self.red_virt_player.get_hint_response())

        else:
            if isinstance(self.blue_virt_player, VirtualPlayer) and self.blue_virt_player.name in self.playing_team:
                self.blue_virt_player.send_response(self.blue_virt_player.get_hint_response())
            elif isinstance(self.red_virt_player, VirtualPlayer) and self.red_virt_player.name in self.playing_team:
                self.red_virt_player.send_response(self.red_virt_player.get_hint_response())

    def get_type(self):
        if self.isBlind:
            return "blind"

        return "classic"

    ### TODO : Make methods below private ###

    def send_gameroom_stats(self, time):
        timestamp = User.jsonify_date(time)
        game_time = time - self.start_time
        stat_object = {"game_mode":self.get_type(),"timestamp":timestamp, "players":self.users.get_usernames(), "result": f"{self.blue_team_points} - {self.red_team_points}"}
        for user in self.users:
            if not isinstance(user, VirtualPlayer):
                if user.name in self.red_team:
                    if self.red_team_points > self.blue_team_points:
                        user.log_win()
                    else:
                        user.log_lose()

                elif user.name in self.blue_team:
                    if self.blue_team_points > self.red_team_points:
                        user.log_win()
                    else:
                        user.log_lose()
            
                user.log_game_time(game_time)
                user.log_game_results(stat_object)

    def resend_teams(self):
        self.blue_team = []
        self.red_team = []
        usernames = self.get_usernames()
        for user in usernames:
            if not user.startswith("[VIRT]"):
                if len(self.blue_team) == 0:
                    self.add_to_team(user, 'blue')
                    if self.blue_virt_player != {}:
                        self.blue_team.append(self.blue_virt_player.name)
                elif len(self.blue_team) == 1 and len(self.red_team) == 0:
                    self.add_to_team(user, 'red')
                    if self.red_virt_player != {}:
                        self.red_team.append(self.red_virt_player.name) 
                elif len(self.blue_team) == 1 and len(self.red_team) == 1:
                    self.add_to_team(user, 'blue')
                elif len(self.blue_team) == 1 and len(self.red_team) ==2:
                    self.add_to_team(user, 'blue')
                else:
                    self.add_to_team(user, 'red')
                
    def add_to_team(self, username, team):
        if team == 'blue':
            self.blue_team.append(username)
        elif team == 'red':
            self.red_team.append(username)

    def init_round(self, timestamp, on_start=False):
        self.round_counter += 1
        start_timestamp = timestamp+timedelta(seconds=5)
        start_time = start_timestamp.strftime('%B %d, %Y %H:%M:%S')
        round_ending_time_stamp = self.get_end_time_stamp(start_timestamp)
        self.tries = self.get_number_of_tries()
        self.drawer = self._get_drawer(on_start)
        self.guesser = self._get_guesser()
        return start_time, round_ending_time_stamp

    def update_points(self, team):
        if team == self.blue_team:
            self.blue_team_points += 1
        else:
            self.red_team_points += 1
    
    def get_avatars(self, team):
        avatars = []
        if team == "blue":
            for user in self.users:
                if user.name in self.blue_team:
                    avatars.append(user.get_avatar())

        if team == "red":
            for user in self.users:
                if user.name in self.red_team:
                    avatars.append(user.get_avatar())
        
        return avatars

    def _get_guesser(self):
        return self.playing_team[0] if self.playing_team[0] is not self.drawer else self.playing_team[1]

    def _get_drawer(self, on_start=False):
        for username in self.playing_team:
            if username.startswith('[VIRT]'):
                return username
        player = ""
        if on_start or self.red_previous_drawer == "":
            player = self.playing_team[random.randint(0, 1)]
        else:
            if self.playing_team == self.blue_team:
                player = self.blue_team[0] if self.blue_previous_drawer == self.blue_team[1] else self.blue_team[1]
            else:
                player = self.red_team[0] if self.red_previous_drawer == self.red_team[1] else self.red_team[1]

        return player
