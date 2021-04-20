from datetime import datetime, timedelta
import pymongo
from pymongo.collection import Collection
from werkzeug.security import check_password_hash, generate_password_hash

from message import UserMessage
from data.words import WORDS


class MissingParameterError(Exception):
    pass


class EntryAlreadyExistsError(Exception):
    pass


class AbsentEntryError(Exception):
    pass


class MongoManager:
    def __init__(self) -> None:
        self.mongo_client = pymongo.MongoClient()
        self.db = self.mongo_client['NotSkribbl']
        self.users = self.db['users']
        self.words = self.db['words']
        self.chatrooms = self.db['chatrooms']
        self.pairs = self.db['pairs']
        self.init_db()

    def init_db(self) -> None:
        self.users.create_index("username", unique=True)
        self.words.create_index([("word", 1), ("lang", 1), ("diff",1)], unique=True)
        self.chatrooms.create_index("name", unique=True)
        self.pairs.create_index([("word", 1), ("lang", 1), ("difficulty",1)], unique=True)
        for word in WORDS:
            try:
                self.words.insert_one(word)
            except:
                pass

    #############
    # CHATROOMS #
    #############
    def create_chatroom(self, name: str) -> None:
        chatroom = {
            'name': name,
            'logs': []
        }
        try:
            self.chatrooms.insert_one(chatroom)
        except:
            pass

    def get_chatroom(self, name: str) -> dict:
        chatroom_filter = {
            'name': name
        }
        MongoManagerValidator.validate_present(self.chatrooms, chatroom_filter)
        return self.chatrooms.find_one(
            chatroom_filter, {'_id': 0}
        )

    def add_chatroom_logs(self, name: str, message: UserMessage) -> None:
        self.chatrooms.update_one(
            {'name': name},
            {'$push': {'logs': message.to_dict()}}
        )

    def get_chatroom_logs(self, name: str) -> list[UserMessage]:
        chatroom = self.get_chatroom(name)
        logs = []
        for entry in chatroom['logs']:
            logs.append(UserMessage.from_dict(entry))
        return logs

    #########
    # WORDS #
    #########
    def get_words(self, filter={}) -> list:
        return self.get_all(
            self.words,
            filter,
            {'_id': 0, 'word': 1, 'lang': 1, 'diff':1}
        )

    def get_all(self, collection: Collection, filter={}, fields: dict = None) -> list:
        items = []
        for i in collection.find(filter, fields):
            items.append(i)
        return items

    #########
    # USERS #
    #########
    def add_user(self, user_obj: dict):
        MongoManagerValidator.validate_user(user_obj)
        self.hash_user_password(user_obj)
        user_obj.update({'chatrooms': []})
        user_obj.update({'win_count': 0})
        user_obj.update({'lose_count': 0})
        user_obj.update({'game_times': []})
        user_obj.update({'connection_timestamps': []})
        user_obj.update({'disconnection_timestamps': []})
        user_obj.update({'game_history': []})
        self.users.insert_one(user_obj)

    def get_user(self, username: str):
        user_filter = {
            'username': username
        }
        MongoManagerValidator.validate_present(self.users, user_filter)
        return self.users.find_one(user_filter)

    def get_user_chatrooms(self, username: str) -> list[str]:
        return self.get_user(username)['chatrooms']

    def get_user_win_count(self, username: str) -> float:
        return self.get_user(username)['win_count']

    def get_user_lose_count(self, username: str) -> float:
        return self.get_user(username)['lose_count']

    def get_user_game_times(self, username: str) -> list[str]:
        return self.get_user(username)['game_times']

    def get_user_connection_timestamps(self, username: str) -> list[str]:
        return self.get_user(username)['connection_timestamps']

    def get_user_disconnection_timestamps(self, username: str) -> list[str]:
        return self.get_user(username)['disconnection_timestamps']

    def get_user_game_history(self, username: str) -> list[dict]:
        return self.get_user(username)['game_history']

    def increment_win_count(self, username: str) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$inc': {'win_count': 1}}
        )

    def increment_lose_count(self, username: str) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$inc': {'lose_count': 1}}
        )

    def add_game_time(self, username: str, game_time: timedelta) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$addToSet': {'game_times': game_time}}
        )

    def add_disconnection(self, username: str, time: datetime) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$addToSet': {'disconnection_timestamps': time}}
        )

    def add_connection(self, username: str, time: datetime) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$addToSet': {'connection_timestamps': time}}
        )

    def add_game_results(self, username: str, results: dict) -> None:
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$addToSet': {'game_history': results}}
        )

    def authenticate_user(self, user_obj: dict):
        MongoManagerValidator.validate_user_auth(user_obj)
        user = self.get_user(user_obj['username'])
        return check_password_hash(user['password'], user_obj['password'])

    def hash_user_password(self, data: dict):
        password = data['password']
        hashed_password = generate_password_hash(password)
        data['password'] = hashed_password

    def add_user_chatroom(self, username: str, chatroom: str) -> None:
        chatroom_filter = {'name': chatroom}
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.chatrooms, chatroom_filter)
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update_one(
            user_filter,
            {'$addToSet': {'chatrooms': chatroom}}
        )

    def remove_user_chatroom(self, username: str, chatroom: str) -> None:
        chatroom_filter = {'name': chatroom}
        user_filter = {'username': username}
        MongoManagerValidator.validate_present(self.chatrooms, chatroom_filter)
        MongoManagerValidator.validate_present(self.users, user_filter)
        self.users.update(
            user_filter,
            {'$pull': {'chatrooms': chatroom}}
        )

    ########
    # PAIR #
    ########
    def add_pair(self, pair_obj: dict):
        MongoManagerValidator.validate_pair(pair_obj)
        self.pairs.insert_one(pair_obj)

    def get_pair(self, word: str, lang: str, diff:str):
        pair_filter = {
            'word': word,
            'lang': lang,
            'difficulty': diff,
        }
        MongoManagerValidator.validate_present(self.pairs, pair_filter)
        return self.pairs.find_one(pair_filter, {'_id': 0})

    def get_pairs(self, filter={}) -> list:
        return self.get_all(
            self.pairs,
            filter,
            {'_id': 0}
        )


class MongoManagerValidator:
    USER_FIELDS = ['username', 'first_name',
                   'last_name', 'password', 'avatar']  
    USER_AUTH_FIELDS = ['username', 'password']
    PAIR_FIELDS = ['word', 'lang', 'hints', 'lines',
                   'line_color', 'type', 'background',
                   'difficulty', 'random']

    # lines = [
    #     [point1, point2, point3, ...], # trait 1
    #     [point1, point2, point3, ...], # trait 2
    #     [point1, point2, point3, ...], # trait 3
    #     [point1, point2, point3, ...]  # trait 4
    # ]

    @staticmethod
    def validate_obj(obj: dict, fields: list):
        for field in fields:
            if field not in obj.keys():
                raise MissingParameterError(
                    f"Operation failed, missing field {field}.")

    def validate_absent(db: Collection, filter: dict):
        result = db.find_one(filter)
        if result is not None:
            raise EntryAlreadyExistsError(
                f"Operation failed, entry already exists.")

    def validate_present(db: Collection, filter: dict):
        result = db.find_one(filter)
        if result is None:
            raise AbsentEntryError(
                f"Operation failed, entry does not exist.")

    @staticmethod
    def validate_user(obj: dict):
        MongoManagerValidator.validate_obj(
            obj, MongoManagerValidator.USER_FIELDS
        )

    @staticmethod
    def validate_user_auth(obj: dict):
        MongoManagerValidator.validate_obj(
            obj, MongoManagerValidator.USER_AUTH_FIELDS
        )

    def validate_pair(obj: dict):
        MongoManagerValidator.validate_obj(
            obj, MongoManagerValidator.PAIR_FIELDS
        )
