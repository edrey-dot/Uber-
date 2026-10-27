/**
 * Modelos TypeScript para el módulo de Cliente y Tarifas
 * Basados en la documentación técnica de la API
 */

export interface FareBreakdown {
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  minimum_fare: number;
  surge_multiplier: number;
}

export interface Fare {
  id: number;
  name: string;
  base_fare: number;
  price_per_km: number;
  price_per_minute: number;
  minimum_fare: number;
  surge_multiplier: number;
  active: boolean;
}

export interface ActiveFareResponse {
  success: boolean;
  fare: Fare;
}

export interface EstimateRequest {
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

export interface EstimateResponse {
  success: boolean;
  estimate: {
    distance_km: number;
    duration_min: number;
    estimated_fare: number;
    currency: string;
    fare_breakdown: FareBreakdown;
  };
}

export interface CreateRideRequest {
  origin_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_name: string;
  destination_latitude: number;
  destination_longitude: number;
}

export interface RideRequest {
  id: number;
  client_id: number;
  origin_name: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_name: string;
  destination_latitude: number;
  destination_longitude: number;
  estimated_distance_km: number;
  estimated_duration_min: number;
  estimated_fare: number;
  status: 'requested' | 'assigned' | 'cancelled' | 'completed';
  created_at: string;
}

export interface CreateRideResponse {
  success: boolean;
  message: string;
  ride_request?: RideRequest;
  active_request_id?: number;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
}

export interface DriverInfo {
  id: number;
  rating_average?: number;
  user: {
    name: string;
    phone?: string;
  };
  latest_location?: DriverLocation;
}

export interface VehicleInfo {
  plate: string;
  brand: string;
  model: string;
  color: string;
  year?: number;
}

export type TripStatus =
  | 'requested'
  | 'assigned'
  | 'driver_arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface ActiveTripData {
  id: number;
  status: TripStatus;
  estimated_fare?: number;
  final_fare?: number;
  origin_name?: string;
  destination_name?: string;
  driver?: DriverInfo;
  vehicle?: VehicleInfo;
  created_at?: string;
}

export interface ActiveTripResponse {
  success: boolean;
  has_active: boolean;
  type?: 'request' | 'trip';
  data?: ActiveTripData | null;
}

export interface TripHistoryItem {
  id: number;
  final_fare: number;
  status: TripStatus;
  completed_at?: string;
  created_at?: string;
  driver?: {
    user?: { name: string };
  };
  vehicle?: {
    plate: string;
  };
}

export interface TripHistoryResponse {
  success: boolean;
  trips: {
    data: TripHistoryItem[];
    current_page?: number;
    last_page?: number;
    total?: number;
  };
}

export interface RatingRequest {
  score: number; // 1 a 5
  comment?: string;
  has_incident?: boolean;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  rating?: {
    id: number;
    trip_id: number;
    score: number;
    comment?: string;
  };
}
