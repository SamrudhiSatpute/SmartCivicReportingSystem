package com.example.demo.util;

// Small geo helper used to detect duplicate complaints: two GPS points
// close enough together are treated as "the same spot on the ground",
// even if reported from slightly different angles/positions.
public class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6371000;

    // Great-circle distance between two lat/lng points, in meters.
    public static double distanceInMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }
}
