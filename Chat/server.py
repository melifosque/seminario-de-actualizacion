from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit, join_room
import os
import secrets  

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'
socketio = SocketIO(app)

room_keys = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/getSharedKey/<room>')
def get_shared_key(room):
    if room not in room_keys:
        room_keys[room] = secrets.token_hex(16)
    return jsonify({'key': room_keys[room]})

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    
    # Emitir un mensaje a todos los usuarios de la sala
    emit('message', {'msg': f'¡{username} se ha unido al chat!', 'username': username}, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    username = data['username']
    if 'msg' in data:
        # Emitir el mensaje encriptado a la sala correspondiente
        emit('message', {'msg': data['msg'], 'username': username}, room=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
