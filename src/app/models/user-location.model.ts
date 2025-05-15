export interface UserLocation {
  username: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface LocationHistory {
  username: string;
  locations: {
    latitude: number;
    longitude: number;
    timestamp: Date;
    accuracy?: number;
  }[];
}