import { useEffect, useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Table, Select, Checkbox } from 'antd';
import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";
import { createGraphic, getCurrentLocation } from "../utils";

const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const [crrMap, setCrrMap] = useState(null);
    const listGraphicsLayer = useRef([]);

    const [graphicsLayer, setGraphicsLayer] = useState(null);
    const [isShowLabel, setIsShowLabel] = useState(true);
    const [graphicLabel, setGraphicLabel] = useState(null);
    const crrCenter = useRef(null);
    const crrZoom = useRef(null);
    const [data, setData] = useState(null);

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
            basemap: 'streets'
        });

        fetch('http://localhost:8888/connect/main.php').then((rs) => {
            return rs.json()
        }).then((rs) => {
            setData(rs);
            setCrrMap(map);
        }).catch((err) => {
            console.log(err);
        });
    }, []);
    useEffect(() => {
        if (view && graphicsLayer) {
            // event click 
            if (view) {
                view.on("click", async (event) => {
                    const clickedPoint = view.toMap({ x: event.x, y: event.y });
                    const crrLocation = await getCurrentLocation({
                        latitude: clickedPoint.latitude,
                        longitude: clickedPoint.longitude
                    });
                    if (crrLocation.data.length !== 0) {

                        const crrGraphic = createGraphic(crrLocation.data, true)
                        // Add the graphic to the graphics layer
                        graphicsLayer.add(crrGraphic);
                    }
                });
                view.on("drag", (event) => {
                    crrCenter.current = view.center
                });
                view.watch("zoom", (zoom) => {
                    crrZoom.current = zoom;
                });
            }
        }
    }, [view, graphicsLayer, graphicLabel]);
    useEffect(() => {
        if (data && crrMap) {
            const graphics = data.map(item => {
                const graphic = createGraphic(item);
                return graphic;
            });
            const graphicsLayer = new GraphicsLayer({
                graphics: graphics
            });
            const listGraphicLabel = data.map(item => {
                const graphicLabel = createGraphic(item, false, true);
                return graphicLabel;
            });
            setGraphicLabel(listGraphicLabel);
            setGraphicsLayer(graphicsLayer);
            // // Add the graphics layer to the map
            const mapView = new MapView({
                container: mapRef.current,
                map: crrMap,
                center: !crrCenter.current ? [106.13811855720901, 16.148615511826023] : crrCenter.current,
                zoom: !crrZoom.current ? 6 : crrZoom.current
            }).when((view) => {
                setView(view);
            });
            crrMap.add(graphicsLayer);
        }
    }, [data, crrMap]);
    return (
        <div style={{ height: '100vh' }} className="visualize-map">
            <div className="main-content">
                <div className="area-function">
                    <div className="list-layer">
                        <p><b>Danh sách lớp</b></p>
                    </div>
                    <div className="form-infor">
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
                </div>
                <div className="view-label">
                    <Checkbox onChange={() => {
                        setIsShowLabel(!isShowLabel);
                        if (crrMap && view) {
                            if (isShowLabel) {
                                const listlabel = new GraphicsLayer({
                                    graphics: graphicLabel
                                });
                                listGraphicsLayer.current.push(listlabel);
                                view.map.add(listlabel);
                            } else {
                                view.map.remove(listGraphicsLayer.current[0]);
                                listGraphicsLayer.current.splice(0, 1);
                            }
                        }
                    }}>
                        <span>Hiển thị nhãn</span>
                    </Checkbox>
                </div>
                <div
                    ref={mapRef}
                    style={{ height: '100vh', flex: 1, border: '1px solid black' }}></div>
                {view && <MapWid view={view} />}
            </div>
        </div >
    )
}

export default MyMap;