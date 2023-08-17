import React, { useEffect, useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Table, Select } from 'antd';
import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";
import { createGraphic, getCurrentLocation, getGeometry } from "../utils";

const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const mapRef = useRef();
    const handleSubmit = (e) => {
        e.preventDefault();
    }
    const columnsInfo = [
        {
            key: 'HUMAN',
            title: 'Dân số'
        },
        {
            key: 'NUMBER_CAR',
            title: 'SL xe'
        },
        {
            key: 'SUCCESS',
            title: 'Chuyến HT'
        },
        {
            key: 'SUCCESS_RATE',
            title: 'Hoàn thành(%)'
        },
        {
            key: 'HUMAN_RATE',
            title: 'Người dùng(%)'
        },
        {
            key: 'STARTEGY',
            title: 'Chiến lược'
        }
    ];
    const columnsTop = [
        {
            key: 'RANK',
            title: 'Hạng'
        },
        {
            key: 'AREA',
            title: 'Tỉnh/TP'
        },
        {
            key: 'HUMAN',
            title: 'DS'
        },
        {
            key: 'NUMBER_CAR',
            title: 'SL xe'
        },
        {
            key: 'SUCCESS',
            title: 'Chuyến HT'
        },
        {
            key: 'SUCCESS_RATE',
            title: 'Hoàn thành(%)'
        },
        {
            key: 'HUMAN_RATE',
            title: 'Người dùng(%)'
        },
    ];
    useEffect(() => {
        Config.apiKey = API_KEY
        // const featureLayer = new FeatureLayer({
        //     apiKey: API_KEY,
        //     url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
        // })

        const map = new Map({
            basemap: 'streets-vector',
            // basemap: '',
        })
        const testView = new MapView({
            map: map,
            container: mapRef.current,
        })
        // map.add(featureLayer);

        fetch('http://localhost:8888/connect/main.php').then((rs) => {
            return rs.json()
        }).then((rs) => {
            const graphics = rs.map(item => {
                const graphic = createGraphic(item);
                return graphic;
            });
            const graphicsLayer = new GraphicsLayer({
                graphics: graphics
            });
            // // Add the graphics layer to the map
            const mapView = new MapView({
                container: mapRef.current,
                map: map,
                zoom: 13,
                center: [105.854444, 21.028511],
            }).when((view) => {
                setView(view);
                if (view) {
                    view.on("click", async (event) => {
                        const clickedPoint = view.toMap({ x: event.x, y: event.y });
                        const crrLocation = await getCurrentLocation({
                            latitude: clickedPoint.latitude,
                            longitude: clickedPoint.longitude
                        });
                        const crrGraphic = createGraphic(crrLocation.data, true)
                        // Add the graphic to the graphics layer
                        graphicsLayer.add(crrGraphic);
                        console.log(crrGraphic);
                        // Add the graphic to the graphics layer
                    })
                }
            });
            map.add(graphicsLayer);
        }).catch((err) => {
            console.log(err);
        });
    }, []);
    useEffect(() => {
        if (view) {
            // event click 
        }
    }, [view]);
    return (
        <div style={{ height: '100vh' }}>
            <div ref={mapRef} style={{ height: '100vh' }}></div>
            <div className="search-form">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Select
                            showSearch
                            placeholder="Nhập Tỉnh/TP"
                        />
                    </Form.Group>
                </Form>
                <div className="legend">
                    <Table
                        title={(data) => {
                            return <span>Thông tin thành phố: {'varaiable'}</span>
                        }}
                        columns={columnsInfo}
                        size="small"
                    />
                    <Table
                        title={(data) => {
                            return <span>Top 5 thành phố có chỉ số cao nhất</span>
                        }}
                        columns={columnsTop}
                        size="small"
                    />
                </div>
            </div>
            {view && <MapWid view={view} />}
        </div >
    )
}

export default MyMap;