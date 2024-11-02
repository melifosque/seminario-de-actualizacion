from flask import Flask, render_template, jsonify, request, send_file, session
from flask_socketio import SocketIO, emit, join_room
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from random import randint
from auth import UserManager
from flask_mail import Mail
from captcha.image import ImageCaptcha
from time import sleep
import random
import string
import io
import secrets
app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'mysecret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'

db = SQLAlchemy(app)
mail = Mail(app)

socketio = SocketIO(app)

from models import init_db
from auth import UserManager

init_db(app)

room_keys = {}
rooms = set()

@app.route('/')
def index():
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404 

@app.route('/getSharedKey/<room>')
def get_shared_key(room):
    if room not in room_keys:
        room_keys[room] = secrets.token_hex(16)
    return jsonify({'key': room_keys[room]})

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        captcha_response = data.get('captchaResponse')
        phone_number = data.get('phoneNumber', None)
        security_answers = data.get('securityAnswers', [])
        
        if not username or not email or not password:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios'}), 400
        if '@' not in email:
            return jsonify({'success': False, 'message': 'Correo electrónico no válido'}), 400
        if len(security_answers) != 5:
            return jsonify({'success': False, 'message': 'Debe proporcionar todas las respuestas de seguridad'}), 400
        
        if 'captcha_text' not in session or captcha_response != session['captcha_text']:
            return jsonify({'success': False, 'message': 'Captcha incorrecto'}), 400

        UserManager.register_user(username, email, password, phone_number, security_answers)
        return jsonify({'success': True, 'message': 'Usuario registrado correctamente'}), 201

    except ValueError as e:
        return jsonify({'success': False, 'message':f'No fue posuble el registro besos : {str(e)}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
    
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Por favor, complete ambos campos'}), 400

    if session.get('login_attempts', 0) >= 5:
        sleep(5) 
    
    user = UserManager.login_user(username, password)

    if user:
        session.pop('login_attempts', None)
        return jsonify({'success': True}), 200
    else:
        session['login_attempts'] = session.get('login_attempts', 0) + 1
        return jsonify({'success': False, 'message': 'Usuario o contraseña incorrectos'}), 401
    
    
@app.route('/recover-password', methods=['POST'])
def recover_password():
    try:
        data = request.get_json()
        email = data.get('email')
        answers = data.get('security_answers')

        if not email or not isinstance(answers, list) or len(answers) != 5:
            return jsonify({'success': False, 'message': 'Todos los campos son obligatorios'}), 400
        
        user = UserManager.verify_security_answers(email, answers)

        if user:
            return jsonify({'success': True, 'message': 'Respuestas correctas, puedes cambiar la contraseña'})
        else:
            return jsonify({'success': False, 'message': 'Respuestas incorrectas'}), 400

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
    
@app.route('/validate-user', methods=['POST'])
def validate_user():
    data = request.json
    identifier = data.get('identifier')
    
    captcha_response = data.get('captcha')
    
    if 'captcha_text' not in session or captcha_response != session['captcha_text']:
        return jsonify({'success': False, 'message': 'Captcha incorrecto'}), 400

    user = UserManager.get_user_by_email(identifier) or UserManager.get_user(identifier)
    
    if user:
        return jsonify({"success": True, "message": "Usuario encontrado"})
    
    return jsonify({"success": False, "message": "Usuario o correo no registrado"}), 404


@app.route('/send-sms-code', methods=['POST'])
def send_sms_code():
    try:
        data = request.json
        identifier = data.get('identifier')

        sms_code = randint(1000, 9999)
        session['sms_code'] = sms_code

        success = UserManager.send_sms(identifier, sms_code)
        
        if success:
            return jsonify({"success": True, "message": "Código SMS enviado"}), 200
        else:
            return jsonify({"success": False, "message": "Usuario no encontrado o no tiene número de teléfono registrado."}), 404

    except Exception as e:  
        print(f"Error al enviar SMS: {e}")
        return jsonify({"success": False, "message": "Error al enviar el código SMS."}), 500

    
# Ruta para enviar el código por correo electrónico
@app.route('/send-email-code', methods=['POST'])
def send_email_code():
    data = request.json
    identifier = data.get('identifier')
            
    user = UserManager.get_user_by_email(identifier) or UserManager.get_user(identifier)
    
    if user:
        email_code = randint(1000, 9999)
        session['email_code'] = email_code 
        
        UserManager.send_password_reset_email(identifier, email_code)
        return jsonify({"success": True, "message": "Código enviado por correo"})
            
    return jsonify({"success": False, "message": "Correo electrónico no encontrado"}), 404


@app.route('/verify-sms-code', methods=['POST'])
def verify_sms_code():
    data = request.json
    sms_code = data.get('smsCode')
    
    print("Codigo de verificacion del sms: ", sms_code)
    
    if str(sms_code) == str(session.get('sms_code')):
        return jsonify({"success": True})

            
    return jsonify({"success": False, "message": "Código SMS incorrecto"})


# Verificar el código de correo electrónico
@app.route('/verify-email-code', methods=['POST'])
def verify_email_code():
    data = request.json
    email_code = data.get('emailCode')
    
    print("Codigo de verificacion del mail: ", email_code)
    
    if str(email_code) == str(session.get('email_code')):
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Código de correo incorrecto"})


@app.route('/verify-security-questions', methods=['POST'])
def verify_security_questions():
    data = request.json
    print("Data received:", data)  # Imprime el contenido recibido
    
    identifier = data.get('identifier')
    security_answers = data.get('answers')
    
    print("Preguntas de seguridad: ", security_answers)

    if security_answers is None:
        return jsonify({"success": False, "message": "Las respuestas de seguridad son necesarias."}), 400

    user = UserManager.get_user_by_email(identifier) or UserManager.get_user(identifier)
    
    if user:
        try:
            UserManager.verify_security_answers(identifier, security_answers)
            return jsonify({"success": True})
        except ValueError as e:
            return jsonify({"success": False, "message": str(e)})
    
    return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

# Ruta para actualizar la contraseña
@app.route('/update-password', methods=['POST'])
def update_password_route():
    data = request.json
    new_password = data.get('newPassword')
    identifier = data.get('identifier')
    
    if not new_password or not identifier:
        return jsonify({"success": False, "message": "Datos incompletos"}), 400

    success = UserManager.update_password(identifier, new_password)
    
    if success:
        return jsonify({"success": True, "message": "Contraseña actualizada"})
    else:
        return jsonify({"success": False, "message": "Usuario no encontrado o error al actualizar la contraseña"}), 500

@app.route('/captcha')
def generate_captcha():
    image = ImageCaptcha(width=280, height=90)
    captcha_text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    captcha_image = image.generate_image(captcha_text)
    
    session['captcha_text'] = captcha_text
    
    print("Captcha Origen: ", captcha_text)

    buffer = io.BytesIO()
    captcha_image.save(buffer, format='PNG')
    buffer.seek(0)

    return send_file(buffer, mimetype='image/png')

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Sesión cerrada correctamente'})

@app.route('/rooms')
def get_rooms():
    return jsonify(list(rooms))

@socketio.on('createRoom')
def handle_create_room(data):
    room = data['room']
    if room and room not in rooms:
        rooms.add(room)
        socketio.emit('updateRooms', list(rooms))
    else:
        socketio.emit('error', {'msg': 'No se pudo crear la sala.'})
        
@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    emit('message', {'msg': f'¡{username} se ha unido al chat!', 'username': username}, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    username = data['username']
    if 'msg' in data:
        emit('message', {'msg': data['msg'], 'username': username}, room=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)