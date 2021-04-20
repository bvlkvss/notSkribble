import random
import traceback
from datetime import datetime

from engineio.payload import Payload
from flask.app import Flask
from flask.globals import request
from flask_socketio import SocketIO, emit
from pymongo.errors import DuplicateKeyError

from chatroom.chatroom import Chatroom, ChatroomList
from chatroom.public_chatroom import PublicChatroom
from gameroom.classic_gameroom import ClassicGameroom
from gameroom.coop_gameroom import CoopGameroom
from gameroom.free_gameroom import FreeGameroom
from gameroom.gameroom import Gameroom, GameroomList
from gameroom.solo_gameroom import SoloGameroom
from gameroom.tuto_gameroom import TutoGameroom
from message import UserMessage
from mongo_manager import AbsentEntryError, MissingParameterError, MongoManager
from user import User, UserList

Payload.max_decode_packets = 1000

app = Flask(__name__)
app.config['SECRET_KEY'] = random.randbytes(16)
socketio = SocketIO(app, cors_allowed_origins="*", ping_timeout=12000)

connectedUsers = {}
connected_users_list = UserList()
db = MongoManager()
chatrooms = ChatroomList()
gamerooms = GameroomList()


#########
# UTILS #
#########
def verify_session(event):
    def verify_session_decor(fn):
        def wrapper(*args, **kwargs):
            user = connected_users_list.get_instance_by_sid(request.sid)
            if user is None:
                print(f'Unauthorized user event: {event}')
                resp = get_resp(0, 'Unauthorized: user not connected', {})
                emit(event, resp)
            else:
                kwargs['user'] = user
                return fn(*args, **kwargs)
        return wrapper
    return verify_session_decor


def get_resp(code: int = 1, message: str = "Success", data: dict = None):
    data = data or {}
    resp = {
        'code': code,
        'message': message,
        'data': data
    }
    return resp

##################
# EVENT HANDLERS #
##################


@socketio.on('connect')
def on_connect():
    print('A new user has connected')


@socketio.on('disconnect')
def on_disconnect():
    user: User = connected_users_list.get_instance_by_sid(request.sid)
    if user is not None:
        gamerooms.remove_user_from_gameroom(user)
        connected_users_list.remove(user)
        user.log_disconnection()


@socketio.on('disconnect_user')
@verify_session('disconnect_user')
def on_disconnect_user(data: dict, **kwargs):
    """ Disconnect a connected user """
    resp = get_resp()
    user:User = kwargs['user']
    if user is not None:
        gamerooms.remove_user_from_gameroom(user)
        connected_users_list.remove(user)
        user.log_disconnection()
    
    print(resp)
    emit('disconnect_user', resp)


@socketio.on('create_user')
def on_create_user(data: dict, **kwargs):
    """ Create a user and add it to the database """
    resp = get_resp()
    try:
        db.add_user(data)
        user = User(data['username'], request.sid)
        connected_users_list.add(user)
        user.log_connection()
        resp['data']['timestamp'] = user.connexion_time_stamp
    except DuplicateKeyError:
        resp['code'] = 4
        resp['message'] = 'User already exists.'
    except MissingParameterError as e:
        resp['code'] = 3
        resp['message'] = str(e)
    except Exception as e:
        resp['code'] = 2
        resp['message'] = f'An error occured:\n {e}.'
        traceback.print_exc()
    finally:
        print(resp)
        emit('create_user', resp)


@socketio.on('authenticate_user')
def on_authenticate_user(data: dict, **kwargs):
    """ Authenticate a user """
    resp = get_resp()
    try:
        if not db.authenticate_user(data):
            resp['code'] = 4
            resp['message'] = "User authentication failed."
        else:
            is_user_connected = (
                connected_users_list.get_instance_by_sid(request.sid) is not None or
                connected_users_list.get_instance(data['username']) is not None)
            if is_user_connected:
                resp['code'] = 6
                resp['message'] = "User is already connected."
            else:
                user = User(data['username'], request.sid)
                connected_users_list.add(user)
                user.log_connection()
                user_rooms = db.get_user_chatrooms(user.name)
                for room in user_rooms:
                    room_instance = chatrooms.get_instance(room)
                    if room_instance is None:
                        room_instance = PublicChatroom(room)
                        chatrooms.add(room_instance)
                    user.join_room(room_instance)
                resp['data']['timestamp'] = user.connexion_time_stamp

    except MissingParameterError as e:
        resp['code'] = 3
        resp['message'] = str(e)
    except AbsentEntryError as e:
        resp['code'] = 5
        resp['message'] = str(e)
    except Exception as e:
        resp['code'] = 2
        resp['message'] = f'An error occured:\n {e}.'
        traceback.print_exc()

    print(resp)
    emit('authenticate_user', resp)


### Handling of gameroom ###
@socketio.on('game_info')
@verify_session('game _info')
def on_game_info(data: dict, **kwargs):
    user = kwargs['user']
    name = data['name']
    diff = data['difficulty']
    type = data['type']
    lang = data['lang']

    if gamerooms.get_instance(name) is not None:
        emit('game_info', get_resp(2, "A gameroom with that name already exists"))
    else:
        if type == 'classic':
            gameroom = ClassicGameroom(name, lang, diff)
        elif type == 'blind':
            gameroom = ClassicGameroom(name, lang, diff, True)
        elif type == 'solo':
            gameroom = SoloGameroom(name, lang, diff)
        elif type == 'coop':
            gameroom = CoopGameroom(name, lang, diff)
        elif type == 'free':
            gameroom = FreeGameroom(name, lang, diff)
        elif type == 'tuto':
            gameroom = TutoGameroom(name, lang, diff)
        gameroom.join(user)
        gameroom.creator = user
        gamerooms.add(gameroom)


@socketio.on('join_gameroom')
@verify_session('join_gameroom')
def on_join_gameroom(data: dict, **kwargs):
    user = kwargs['user']
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.join(user)
    else:
        emit('join_gameroom', {
             'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('get_word')
def on_get_word(data: dict):
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.get_word()
    else:
        emit('join_gameroom', {
             'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('start_gameroom')
def on_start_gameroom(data: dict):
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        timestamp = datetime.now()
        gameroom.on_start(timestamp)
    else:
        emit('start_gameroom', {
             'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('reply_right')
def on_reply_right(data: dict):
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        timestamp = datetime.now()
        gameroom.reply_right(timestamp)
    else:
        emit('reply_right', {
             'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('next_round')
def on_next_round(data: dict):
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        timestamp = datetime.now()
        gameroom.next_round(timestamp)
    else:
        emit('next_round', {'code': 2,
                            'message': 'An error occured, gameroom not found'})


@socketio.on('game_done')
def on_game_done(data: dict):
    name = data['name']
    gameroom:Gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.game_done()
        gamerooms.remove(gameroom)
        gameroom.clear_users()
    else:
        emit('game_done', {'code': 2,
                           'message': 'An error occured, gameroom not found'})


@socketio.on('drawing_info')
def on_drawing_info(data: dict):
    socketio.sleep(0)
    try:
        name = data['name']
        drawing_info = data['info']
        gameroom = gamerooms.get_instance(name)
        if gameroom is not None:
            gameroom.send_drawing_info(drawing_info)
        else:
            emit('drawing_info', {
                 'code': 2, 'message': 'An error occured, gameroom not found'})
    except:
        pass


@socketio.on('end_line')
def on_end_line(data: dict):
    socketio.sleep(0)
    try:
        name = data['name']
        gameroom = gamerooms.get_instance(name)
        if gameroom is not None:
            gameroom.emit_end_line(data['type'])
        else:
            emit('end_line', {
                 'code': 2, 'message': 'An error occured, gameroom not found'})
    except:
        pass

@socketio.on('get_hint')
@verify_session('get_hint')
def on_get_hint(data:dict, **kwargs):
    user = kwargs['user']
    name = data['name']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.get_hint(user.name)
    else:
        emit('get_hint', {
                 'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('get_gamerooms')
def on_get_gameroom(data: dict):
    type = data['type']
    diff = data['difficulty']
    lang = data['lang']
    gamerooms_list = gamerooms.get_gamerooms_by_type_and_difficulty(
        type, diff, lang)
    gameroom_obj_list = []
    for gameroom in gamerooms_list:
        gameroom_obj = {'name': gameroom.name,
                        'users': gameroom.get_usernames()}
        gameroom_obj_list.append(gameroom_obj)
    print(f"available gamerooms: {gameroom_obj_list}")
    emit('get_gamerooms', {'code': 1, 'data': gameroom_obj_list})

@socketio.on('add_virtual_player')
def on_add_virtual_player(data: dict):
    name = data['name']
    team = data['team']
    type = data['type']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.add_virt_player(type, team)
    else:
        emit('add_virtual_player', {
                 'code': 2, 'message': 'An error occured, gameroom not found'})

@socketio.on('remove_virtual_player')
def on_remove_virtual_player(data: dict):
    name = data['name']
    team = data['team']
    gameroom = gamerooms.get_instance(name)
    if gameroom is not None:
        gameroom.remove_virt_player(team)
    else:
        emit('remove_virtual_player', {
                 'code': 2, 'message': 'An error occured, gameroom not found'})


@socketio.on('quit_game')
@verify_session('quit_game')
def end_gameroom(data:dict, **kwargs):
    user = kwargs['user']
    gamerooms.remove_user_from_gameroom(user)
    

### Handling of chatrooms and messages ###


@socketio.on('join_chatroom')
@verify_session('join_chatroom')
def on_join_chatroom(data: dict, **kwargs):
    """ Adds a user to a chatroom """
    user = kwargs['user']
    room_name = data['room']
    room = chatrooms.get_instance(room_name)
    if room is None:
        room = PublicChatroom(room_name)
        chatrooms.add(room)

    user.join_room(room)

    resp = {'code': 1, 'message': f'{user.name} has entered the room {room.name}.'}
    print(resp)
    emit('join_chatroom', resp, room=room.name)


@socketio.on('leave_chatroom')
@verify_session('leave_chatroom')
def on_leave_chatroom(data: dict, **kwargs):
    """ Removes a user from a chatroom """
    resp = get_resp()
    user: User = kwargs['user']
    room = chatrooms.get_instance(data['room'])

    if room is not None and user.rooms.get_instance(room.name) is not None:
        print(resp)
        emit('leave_chatroom', resp, room=room.name)
        user.leave_room(room)
    else:
        # TODO not in room or room doesn't exist
        pass


@socketio.on('chatroom_message')
@verify_session('chatroom_message')
def on_chatroom_message(data: dict, **kwargs):
    # TODO prevent user not in a room to send a message
    user: User = kwargs['user']
    room = chatrooms.get_instance(data['room'])
    if room is None:
        gameroom = gamerooms.get_instance((data['room'])[6:])
        if gameroom is not None:
            gameroom.handle_gameroom_message(user, data['message'])

    if room is not None and user.rooms.get_instance(room.name) is not None:
        message = UserMessage(user.name, data['message'])
        room.message(message)
    else:

        # TODO not in room or room doesn't exist
        pass


@socketio.on('connected_chatrooms')
@verify_session('connected_chatrooms')
def on_connected_chatrooms(data: dict, **kwargs):
    user: User = kwargs['user']
    user_rooms = [room.name for room in user.rooms.instances]
    resp = get_resp(data={"rooms": user_rooms})
    print(resp)
    emit('connected_chatrooms', resp)


@socketio.on('all_chatrooms')
@verify_session('all_chatrooms')
def on_all_chatrooms(data: dict, **kwargs):
    chatroom_names = [i.name for i in chatrooms.instances]
    resp = get_resp(data={"rooms": chatroom_names})
    print(resp)
    emit('all_chatrooms', resp)


@socketio.on('chatroom_logs')
@verify_session('chatroom_logs')
def on_chatroom_logs(data: dict, **kwargs):
    chatroom_names = [i.name for i in chatrooms.instances]
    room_name = data['room']
    if room_name in chatroom_names:
        chatroom: Chatroom = chatrooms.get_instance(room_name)
        raw_logs = chatroom.get_logs()
        logs = [log.to_dict() for log in raw_logs]
        resp = get_resp(data={"logs": logs})
        emit('chatroom_logs', resp)
    elif room_name[6:] in [i.name for i in gamerooms.instances]:
        chatroom: Chatroom = gamerooms.get_instance(room_name[6:]).chatroom
        raw_logs = chatroom.get_logs()
        logs = [log.to_dict() for log in raw_logs]
        resp = get_resp(data={"logs": logs})
        emit('chatroom_logs', resp)


@socketio.on('add_pair')
def on_verify_pair(data: dict, **kwargs):
    resp = get_resp()
    try:
        db.add_pair(data)
    except DuplicateKeyError:
        resp['code'] = 4
        resp['message'] = 'Pair already exists.'
    except MissingParameterError as e:
        resp['code'] = 3
        resp['message'] = str(e)
    except Exception as e:
        resp['code'] = 2
        resp['message'] = f'An error occured:\n {e}.'
        traceback.print_exc()
    finally:
        print(resp)
        emit('add_pair', resp)


@socketio.on('user_stats')
@verify_session('user_stats')
def on_user_stats(data: dict, **kwargs):
    user: User = kwargs['user']
    resp = get_resp()
    resp['data'] = user.get_stats()
    emit('user_stats', resp)


@socketio.on('test')
@verify_session('test')
def on_user_stats(data: dict, **kwargs):
    user: User = kwargs['user']
    resp = get_resp()
    resp['data'] = user.get_stats()
    print(resp)
    emit('test', resp)


if __name__ == '__main__':
    print('started')
    socketio.run(app, host="0.0.0.0")
