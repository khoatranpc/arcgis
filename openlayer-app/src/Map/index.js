import React, { useEffect, useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Table } from 'antd';
import Map from '@arcgis/core/Map';
import wellknown from 'wellknown';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Color from '@arcgis/core/Color';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";

const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const mapRef = useRef();
    const handleSubmit = (e) => {
        e.preventDefault();
    }
    const columnsInfo = [
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
            title: 'CĐ hoàn thành'
        },
        {
            key: 'SUCCESS_RATE',
            title: 'TL hoàn thành'
        },
        {
            key: 'HUMAN_RATE',
            title: 'TL người dùng'
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
            const listPolygon = [];
            const graphics = rs.map(item => {
                const geometry = wellknown.parse(item.geometry); // Parse WKT to geometry
                const polygonCoordinates = geometry.coordinates.flat();
                // console.log(polygonCoordinates);
                const polygon = {
                    ...item,
                    type: 'polygon',
                    rings: polygonCoordinates,
                };
                listPolygon.push(polygon);
                // Create a graphic with the converted Polygon geometry
                const graphic = new Graphic({
                    geometry: polygon,
                    symbol: {
                        type: 'simple-fill',
                        color: [255, 0, 0, 0.1],
                        outline: {
                            color: [0, 0, 0, 1], // Black with 100% opacity
                            width: 1
                        },
                    },
                    attributes: {
                        label: item.varname_1
                    }
                });

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
                    view.on("click", (event) => {
                        const clickedPoint = view.toMap({ x: event.x, y: event.y });
                        console.log(clickedPoint);

                        const newText = new TextSymbol({
                            text: 'Click',
                            color: new Color([0, 0, 0]),
                            font: {
                                size: 12,
                                weight: 'bold'
                            },

                        })
                        const graphic = new Graphic({
                            geometry: clickedPoint,
                            symbol: newText
                        });
                        graphicsLayer.graphics.forEach(graphic => {
                            if (graphic.geometry.type === 'polygon') {
                                const polygon = graphic.geometry;
                                const isInside = polygon.contains(clickedPoint);
                                if (isInside) {
                                    const SRID = clickedPoint.spatialReference.wkid;
                                    const GET_POINT = {
                                        latitude: clickedPoint.latitude,
                                        longitude: clickedPoint.longitude
                                    };
                                    const getCurrentPolygon = JSON.stringify(polygon.rings);
                                    const crrLocation = listPolygon.find((item) => {
                                        return JSON.stringify(item.rings) === getCurrentPolygon
                                    });
                                    console.log(crrLocation);
                                }
                            }
                        });
                        // Add the graphic to the graphics layer
                        graphicsLayer.add(graphic);
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
                        <Form.Control type="text" placeholder="Tìm kiếm tỉnh/thành phố" />
                    </Form.Group>
                </Form>
                <div className="legend">
                    <Table
                        title={(data)=>{
                            return <span>Thông tin</span>
                        }}
                        columns={columnsInfo}
                        size="small"
                    />
                     {/* <Table
                        title={(data)=>{
                            return <span>Top 5</span>
                        }}
                        columns={columnsTop}
                        size="small"
                    /> */}
                </div>
            </div>
            {view && <MapWid view={view} />}
        </div >
    )
}

export default MyMap;