from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User 
from twilio.rest import Client
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import smtplib

class UserManager:
    @staticmethod
    def register_user(username, email, password, phone_number=None, security_answers=None):
        username = username.strip().lower()
        email = email.strip().lower()
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing_user:
            print(f"Usuario existente encontrado: {existing_user.username}, {existing_user.email}")
            raise ValueError("El nombre de usuario o el correo ya están en uso.")

        new_user = User(username=username, email=email)
        new_user.set_password(password)

        if security_answers and len(security_answers) == 5:
            new_user.security_answer1 = security_answers[0]
            new_user.security_answer2 = security_answers[1]
            new_user.security_answer3 = security_answers[2]
            new_user.security_answer4 = security_answers[3]
            new_user.security_answer5 = security_answers[4]
        else:
            raise ValueError("Se requieren respuestas a todas las preguntas de seguridad.")

        if phone_number:
            new_user.phone_number = phone_number

        db.session.add(new_user)
        db.session.commit()
        return new_user
    
    @staticmethod
    def login_user(username, password):
        user = User.query.filter(
        (User.username.ilike(username)) | (User.email.ilike(username))
        ).first()
        
        if not user:
            raise ValueError("Usuario no encontrado.")
        
        if not check_password_hash(user.password_hash, password):
            raise ValueError("Contraseña incorrecta.")
        
        return user
    
    @staticmethod
    def get_user(username):
        return User.query.filter_by(username=username).first()
    
    @staticmethod
    def get_user_by_email(email):
        email = email.strip().lower()
        return User.query.filter_by(email=email).first()
    
    @staticmethod
    def verify_security_answers(identifier, answers):
        # Verificar que 'answers' sea una lista y no esté vacía
        if answers is None or not isinstance(answers, list) or len(answers) != 5:
            raise ValueError("Se requieren respuestas para todas las preguntas de seguridad.")
        
        # Buscar el usuario por email o nombre de usuario
        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
        
        if not user:
            raise ValueError("Usuario no encontrado.")
        
        # Comparar las respuestas de seguridad
        for idx, answer in enumerate(answers):
            # Verificar que las respuestas coincidan
            if getattr(user, f"security_answer{idx + 1}") != answer:
                raise ValueError("Las respuestas no coinciden.")
        
        return user
    
    @staticmethod
    def update_password(identifier, new_password):
        """Actualiza la contraseña del usuario si existe (con username o email)."""
        if not identifier or not new_password:
            return False

        user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
        if user:
            hashed_password = generate_password_hash(new_password)  # Genera el hash de la nueva contraseña
            user.password_hash = hashed_password
            db.session.commit()
            return True
        return False

    @staticmethod
    def send_password_reset_email(identifier, token):
        
        from_email = 'Format' 
        password = 'Format' 
        
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        if not user:
            print("Usuario no encontrado.")
            return False
        
        email = user.email

        content = f'Somos el grupo C, Este es tu token: {token}. Por favor! No te vuelvas a olvidar la clave Doris!' 
        msg = MIMEMultipart()
        msg['From'] = from_email
        msg['To'] = email
        msg['Subject'] = 'Código de verificación chat grupo C'
        msg.attach(MIMEText(content, 'plain'))

        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(from_email, password)
            server.send_message(msg)
        except Exception as e:
            print(f"Error al enviar el correo: {e}")
        finally:
            server.quit()
    
    @staticmethod
    def send_sms(identifier, token):
        """Envía un SMS utilizando Twilio."""
        account_sid = 'Format' 
        auth_token = 'Format' 
        from_number = 'Format' 
        
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()

        if not user:
            print("Usuario no encontrado.")
            return False 
        phone_number = f'+54{user.phone_number}'        
        print("user.phone_number ", phone_number)
        
        client = Client(account_sid, auth_token)

        message_body = f'Somos el grupo C, Este es tu token: {token}. Por favor! No te vuelvas a olvidar la clave Doris!'
        
        try:
            client.messages.create(
                body=message_body,
                from_=from_number,
                to=phone_number
            )
            print("SMS enviado con éxito.")
            return True
        except Exception as e:
            print(f"Error al enviar SMS: {e}")
            return False
        
        
            
    @staticmethod
    def logout_user():
        pass
