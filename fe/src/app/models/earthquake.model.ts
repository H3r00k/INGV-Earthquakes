export interface Earthquake {
    id: number;
    ingv_id: string;
    time: string;
    lat: number;
    lon: number;
    depth_km: number | null;
    mag: number | null;
    place: string | null;
}