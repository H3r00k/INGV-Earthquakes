from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import requests

from extensions import db
from models.auth.user import User
from models.data.earthquake import Earthquake
from services.ingv_client import fetch_last_24h_earthquakes, INGV_URL



earthquakes_bp = Blueprint("earthquakes", __name__, url_prefix="/api/earthquakes")

@earthquakes_bp.route("/preview", methods=["GET"])
def preview():
    events = fetch_last_24h_earthquakes()
    
    
    #max 5 righe al momento
    return jsonify({
        "count": len(events),
        "sample": events[:5]
    }), 200
    
@earthquakes_bp.route("/raw", methods=["GET"])
def raw():
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=24)
    
    params = {
        "starttime": start_time.isoformat(timespec="seconds"),
        "endtime": end_time.isoformat(timespec="seconds"),
        "orderby": "time",
        "format": "text",
    }

    r = requests.get(INGV_URL, params=params, timeout=10)
    r.raise_for_status()

    # ritorno le prime 30 righe così vediamo header e formato reale
    lines = r.text.splitlines()[:30]
    return jsonify({"lines": lines}), 200



#Route definitiva solo per jwt e role admin
@earthquakes_bp.route("/sync", methods=["POST"])
@jwt_required()
def sync_earthquakes():
    # 1) Security: user logged + must be ADMIN
    user_id = get_jwt_identity()
    utente = User.query.get(int(user_id))

    if not utente:
        return jsonify({"msg": "Utente non trovato"}), 404

    if utente.role != "ADMIN":
        return jsonify({"msg": "Non autorizzato"}), 403

    # 2) Fetch from INGV (last 24h already)
    events = fetch_last_24h_earthquakes()

    inserted = 0
    skipped = 0

    # 3) Insert/skip based on ingv_id
    for e in events:
        ingv_id = str(e["ingv_id"])

        exists = Earthquake.query.filter_by(ingv_id=ingv_id).first()
        if exists:
            skipped += 1
            continue

        # convert time string -> datetime
        # e["time"] is like "2026-01-13T15:38:11.670000"
        event_time = datetime.fromisoformat(e["time"])

        quake = Earthquake(
            ingv_id=ingv_id,
            time=event_time,
            lat=e["lat"],
            lon=e["lon"],
            depth_km=e.get("depth_km"),
            mag=e.get("mag"),
            place=e.get("place"),
        )

        db.session.add(quake)
        inserted += 1

    db.session.commit()

    # 4) Retention: delete older than 360 days
    cutoff = datetime.utcnow() - timedelta(days=360)
    deleted_old = Earthquake.query.filter(Earthquake.time < cutoff).delete()
    db.session.commit()

    return jsonify({
        "inserted": inserted,
        "skipped": skipped,
        "deleted_old": deleted_old
    }), 200
    

    
        
    #rotta per user
@earthquakes_bp.route("", methods=["GET"])
def list_earthquakes():
    # query params semplici (tutti opzionali)
    limit = min(int(request.args.get("limit", 200)), 1000)  # massimo 1000 per sicurezza
    min_mag = request.args.get("minMag", None)
    hours = request.args.get("hours", None)

    q = Earthquake.query

    # filtro magnitudo
    if min_mag is not None:
        try:
            q = q.filter(Earthquake.mag >= float(min_mag))
        except ValueError:
            return jsonify({"msg": "minMag non valido"}), 400

    # filtro ultime N ore
    if hours is not None:
        from datetime import datetime, timedelta
        try:
            cutoff = datetime.utcnow() - timedelta(hours=int(hours))
            q = q.filter(Earthquake.time >= cutoff)
        except ValueError:
            return jsonify({"msg": "hours non valido"}), 400

    # ordine: più recenti prima
    quakes = q.order_by(Earthquake.time.desc()).limit(limit).all()

    # serializzazione (dict)
    out = [{
        "id": e.id,
        "ingv_id": e.ingv_id,
        "time": e.time.isoformat(),
        "lat": e.lat,
        "lon": e.lon,
        "depth_km": e.depth_km,
        "mag": e.mag,
        "place": e.place,
    } for e in quakes]

    return jsonify(out), 200