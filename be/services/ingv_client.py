import requests
from datetime import datetime, timedelta

INGV_URL = "https://webservices.ingv.it/fdsnws/event/1/query"
TIMEOUT = 10

def fetch_last_24h_earthquakes():
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(hours=24)

    params = {
        "starttime": start_time.isoformat(timespec="seconds"),
        "endtime": end_time.isoformat(timespec="seconds"),
        "orderby": "time",
        "format": "text",   # <-- invece di geojson
    }

    r = requests.get(INGV_URL, params=params, timeout=TIMEOUT)
    r.raise_for_status()

    return _parse_fdsn_text(r.text)

def _parse_fdsn_text(text: str):
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    # header: prima riga che inizia con #
    header_line = next(ln for ln in lines if ln.startswith("#"))
    header_line = header_line.lstrip("#")

    cols = [c.strip() for c in header_line.split("|")]

    data_lines = [ln for ln in lines if not ln.startswith("#")]

    earthquakes = []

    for row in data_lines:
        parts = [p.strip() for p in row.split("|")]
        if len(parts) != len(cols):
            continue

        rec = dict(zip(cols, parts))

        earthquakes.append({
            "ingv_id": rec["EventID"],
            "time": rec["Time"],
            "lat": float(rec["Latitude"]),
            "lon": float(rec["Longitude"]),
            "depth_km": float(rec["Depth/Km"]),
            "mag": float(rec["Magnitude"]),
            "place": rec["EventLocationName"],
        })

    return earthquakes

def _normalize_record(rec: dict):
    """
    Qui fai il mapping dalle colonne del servizio ai tuoi campi.
    Per ora lasciamo una normalizzazione minimale: la completiamo dopo aver visto l'header reale.
    """
    ingv_id = rec.get("EventID") or rec.get("EventId") or rec.get("EventID ")
    if not ingv_id:
        return None

    # Time
    time = rec.get("Time") or rec.get("OriginTime") or rec.get("DateTime")

    # Coordinate
    lat = rec.get("Latitude") or rec.get("Lat")
    lon = rec.get("Longitude") or rec.get("Lon")
    depth = rec.get("Depth/km") or rec.get("Depth") or rec.get("Depth(km)")

    # Magnitude + Place
    mag = rec.get("Magnitude") or rec.get("Mag") or rec.get("MagnitudeValue")
    place = rec.get("EventLocationName") or rec.get("Region") or rec.get("Location") or rec.get("Place")

    # Convertiamo i numeri (se presenti)
    try:
        lat = float(lat) if lat is not None else None
        lon = float(lon) if lon is not None else None
        depth_km = float(depth) if depth is not None else None
        mag = float(mag) if mag is not None else None
    except ValueError:
        depth_km = None

    return {
        "ingv_id": str(ingv_id),
        "time": time,
        "lat": lat,
        "lon": lon,
        "depth_km": depth_km,
        "mag": mag,
        "place": place,
    }
