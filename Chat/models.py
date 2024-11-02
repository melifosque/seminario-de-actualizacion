from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

class User(db.Model):
    __tablename__ = 'User'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    email_confirmed = db.Column(db.Boolean, default=False) 
    sms_code = db.Column(db.String(6), nullable=True) 
    last_sms_sent = db.Column(db.DateTime, nullable=True) 
    
    # Preguntas y respuestas de seguridad
    security_question1 = db.Column(db.String(200), default='¿Cuál es el nombre de su primera mascota?', nullable=False)
    security_answer1 = db.Column(db.String(200), nullable=False)  # Respuesta a pregunta 1
    security_question2 = db.Column(db.String(200), default='¿Dónde nació?', nullable=False)
    security_answer2 = db.Column(db.String(200), nullable=False)  # Respuesta a pregunta 2
    security_question3 = db.Column(db.String(200), default='¿Cuál es su color favorito?', nullable=False)
    security_answer3 = db.Column(db.String(200), nullable=False)  # Respuesta a pregunta 3
    security_question4 = db.Column(db.String(200), default='¿Cuál es el nombre de su primer profesor?', nullable=False)
    security_answer4 = db.Column(db.String(200), nullable=False)  # Respuesta a pregunta 4
    security_question5 = db.Column(db.String(200), default='¿Cuál es su película favorita?', nullable=False)
    security_answer5 = db.Column(db.String(200), nullable=False)  # Respuesta a pregunta 5
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'
    
class EmailConfirmationToken(db.Model):
    __tablename__ = 'EmailConfirmationToken'  # Nombre de la tabla definido correctamente

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)  # Referencia a la tabla User
    token = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='email_token')

    def __repr__(self):
        return f'<EmailConfirmationToken {self.token}>'

class PasswordResetToken(db.Model):
    __tablename__ = 'PasswordResetToken'  # Nombre de la tabla definido correctamente

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('User.id'), nullable=False)  # Referencia a la tabla User
    token = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='reset_token')

    def __repr__(self):
        return f'<PasswordResetToken {self.token}>'