
from __future__ import annotations

from datetime import date, datetime, time, timedelta

from flask_socketio import leave_room, rooms
from pymongo import mongo_client

from chatroom.chatroom import Chatroom, ChatroomList
from instance import Instance, InstanceList
from mongo_manager import MongoManager
import pickle


class User(Instance):
    def __init__(self, name, sid) -> None:
        super().__init__(name)
        self.sid = sid
        self.connexion_time = datetime.now()
        self.connexion_time_stamp = self.connexion_time.strftime('%B %d, %Y %H:%M:%S')
        self.rooms: ChatroomList = ChatroomList()
        self.mongo_manager = MongoManager()

    def __del__(self) -> None:
        session_length = self.calculate_session_length()
        pass
    
    def get_avatar(self):
        db_user = self.mongo_manager.get_user(self.name)
        return db_user['avatar']

    def get_first_name(self):
        db_user = self.mongo_manager.get_user(self.name)
        return db_user['first_name']

    def get_last_name(self):
        db_user = self.mongo_manager.get_user(self.name)
        return db_user['last_name']

    def leave_all_rooms(self) -> None:
        for room in rooms(self.sid)[1:]:
            leave_room(room, self.sid)

    def join_room(self, room: Chatroom) -> None:
        self.rooms.add(room)
        room.join(self)
        self.mongo_manager.add_user_chatroom(self.name, room.name)

    def leave_room(self, room: Chatroom) -> None:
        self.rooms.remove(room)
        room.leave(self)
        self.mongo_manager.remove_user_chatroom(self.name, room.name)

    def calculate_session_length(self):
        return datetime.now() - self.connexion_time

    def get_stats(self) -> dict:
        user_data = self.mongo_manager.get_user(self.name)
        win_count = user_data['win_count']
        lose_count = user_data['lose_count']
        game_times = user_data['game_times']
        object_game_times = [pickle.loads(item) for item in game_times] 
        total_game_time = self.get_timedelta_sum(object_game_times)
        connections: list[datetime] = user_data['connection_timestamps']
        disconnections: list[datetime] = user_data['disconnection_timestamps']
        connection_timestamps = [User.jsonify_date(entry) for entry in connections]
        disconnection_timestamps = [User.jsonify_date(entry) for entry in disconnections]
        user_stats = {
            'first_name': self.get_first_name(),
            'last_name': self.get_last_name(),
            'user_name': self.name,
            'avatar': self.get_avatar(),
            'game_count': win_count + lose_count,
            'win_ratio': 0.00 if win_count + lose_count == 0 else (win_count / (win_count + lose_count)) * 100,
            'average_game_time': User.jsonify_timedelta(timedelta(seconds=0)) if len(game_times) == 0 else User.jsonify_timedelta((total_game_time / len(game_times))),
            'total_game_time': User.jsonify_timedelta(total_game_time),
            'connection_timestamps': connection_timestamps,
            'disconnection_timestamps': disconnection_timestamps,
            'solo_max_score':self.get_max_solo_score(),
            'game_history': user_data['game_history']
        }
        return user_stats

    def log_connection(self) -> None:
        self.mongo_manager.add_connection(self.name, datetime.now())

    def log_disconnection(self) -> None:
        self.mongo_manager.add_disconnection(self.name, datetime.now())

    def log_game_results(self, results: dict) -> None:
        self.mongo_manager.add_game_results(self.name, results)

    def log_win(self) -> None:
        self.mongo_manager.increment_win_count(self.name)

    def log_lose(self) -> None:
        self.mongo_manager.increment_lose_count(self.name)

    def log_game_time(self, game_time: timedelta) -> None:
        game_time = pickle.dumps(game_time)
        self.mongo_manager.add_game_time(self.name, game_time)

    def get_timedelta_sum(self, deltas: list[timedelta]) -> timedelta:
        sum = timedelta(seconds=0)
        for delta in deltas:
            sum = sum + delta
        return sum
    
    def get_max_solo_score(self):
        user_data = self.mongo_manager.get_user(self.name)
        game_data = user_data['game_history']
        max_score = 0
        for game in game_data:
            if game['game_mode'] == 'solo':
                score = game['result']
                if score > max_score:
                    max_score = score

        return max_score        

    @staticmethod
    def jsonify_date(date: datetime):
        return {
            'date': {
                'year': date.year,
                'month': date.month,
                'day': date.day
            },
            'time': {
                'hour': date.hour,
                'minute': date.minute,
                'second': date.second
            }
        }

    @staticmethod
    def jsonify_timedelta(timedelta: timedelta):
        return {
            'days': timedelta.days,
            'hours': timedelta.seconds//3600,
            'minutes':(timedelta.seconds//60)%60,
            'seconds': timedelta.seconds % 60
        }
class UserList(InstanceList):
    def get_instance_by_sid(self, sid) -> User:
        for user in self.instances:
            if sid == user.sid:
                return user

    def get_usernames(self) -> list[str]:
        usernames = []
        for user in self.instances:
            usernames.append(user.name)
        return usernames
