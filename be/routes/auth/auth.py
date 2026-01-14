from flask import Blueprint, request, jsonify
from extensions import db                          
from argon2 import PasswordHasher                  
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, jwt_required, get_jwt_identity, unset_jwt_cookies

from models.auth.user import User                  

# Creiamo il blueprint per tutte le route di autenticazione
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Oggetto per hashare le password (lo creiamo una volta sola)
ph = PasswordHasher()


#ROUTE DI REGISTAZIONE
@auth_bp.route('/register', methods=['POST'])
def register():
    # Prendiamo i dati JSON mandati da Postman / Angular
    data = request.get_json()
    
    # Se non arriva nessun JSON → errore
    if not data:
        return jsonify({"msg": "Nessun dato JSON ricevuto"}), 400
    
    # Prendiamo email e password (usiamo .get() per evitare crash se mancano)
    email = data.get('email')
    password = data.get('password')
    
    # Controllo obbligatorio: email e password devono esserci
    if not email or not password:
        return jsonify({"msg": "Email e password sono obbligatorie"}), 400
    
    # Controlliamo se l'email esiste già nel database
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email già registrata"}), 400
    
    # Hashiamo la password con Argon2 (sicura!)
    hashed_password = ph.hash(password)
    
    # Creiamo l'utente nuovo
    nuovo_utente = User(
        name=data.get('name', ''),          # se non arriva name, metti vuoto
        lastname=data.get('lastname', ''),  # idem
        email=email,
        password_hash=hashed_password,      # salviamo SOLO l'hash, mai la password in chiaro
        role='USER'                         # default per tutti i nuovi utenti
    )
    
    # Salviamo nel database
    db.session.add(nuovo_utente)
    db.session.commit()
    
    # Risposta positiva
    return jsonify({"msg": "Utente creato con successo!"}), 201


#ROUTE DI LOGIN
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({"msg": "nessun Dato ricevuto"}), 400
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"msg": "Email e password sono obbligatorie"}), 400
    
    utente = User.query.filter_by(email=email).first()
    print("LOGIN -> email ricevuta:", repr(email))
    print("LOGIN -> utente trovato:", utente is not None)
    
    if not utente:
        return jsonify({"msg": "email o password errate"}), 401
    
    try:
        ph.verify(utente.password_hash, password)
        print("LOGIN -> password OK")
    except Exception as e:
        print("LOGIN -> password KO:", type(e), e)
        return jsonify({"msg": "Email o password errate"}), 401
    
    #genera token
    access_token = create_access_token(identity=str(utente.id))
    refresh_token = create_refresh_token(identity=str(utente.id))
    
    #test inserimento token nei cookie
    response = jsonify({
        "msg": "Login effettuato con successo!",
        "name": utente.name,
        "lastname": utente.lastname,
        "email": utente.email,
        "role": utente.role,
    })
    
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    
    return response, 200



#route per roconoscimento automatico token
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    utente = User.query.get(int(user_id))
    print("ME -> Cookie header:", request.headers.get("Cookie"))
    
    if not utente:
        return jsonify({"msg": "Utente non trovato"}), 404
    
    return jsonify({
        "id": utente.id,
        "name": utente.name,
        "lastname": utente.lastname,
        "email": utente.email,
        "role": utente.role
    }), 200
    
    
    
#per il logout
@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "Logout effettuato!"})
    
    #cancello cookies
    unset_jwt_cookies(response)
    
    return response, 200