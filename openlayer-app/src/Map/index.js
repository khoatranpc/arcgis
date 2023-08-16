import React, { useEffect, useRef, useState } from "react";
import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";

const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const mapRef = useRef();
    useEffect(() => {
        Config.apiKey = API_KEY
        const featureLayer = new FeatureLayer({
            apiKey: API_KEY,
            url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
        })
        const map = new Map({
            basemap: 'arcgis-topographic',
        })
        map.add(featureLayer);
        const mapView = new MapView({
            container: mapRef.current,
            map: map,
            zoom: 13,
            center: [-118.80543, 34.02700],
        }).when((view) => {
            setView(view);
        })
    }, []);
    // useEffect(() => {
    //     if (view) {
    //         view.ui.components = (["attribution", "compass", "zoom"]);
    //     }
    // }, [view]);
    return (
        <div ref={mapRef} style={{ height: '100vh' }}>
            {view && <MapWid view={view} />}
        </div>
    )
}

export default MyMap;