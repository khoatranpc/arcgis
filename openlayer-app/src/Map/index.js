import { useEffect, useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Table, Select, Checkbox } from 'antd';
import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";
import { createGraphic, createNewLayer, getCurrentLocation, getStrategy } from "../utils";

const NameLayer = {
    BOUNDARY: 'ranh rới Tỉnh/TP',
    LABEL_BOUNDARY: 'nhãn Tỉnh/TP',
    TOP_5: 'top 5 Tỉnh/TP',
}
const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const [data5CityHigh, setData5CityHigh] = useState(null);
    const listGraphicLayerData5Cityhigh = useRef([]);
    const crrGraphicsLayer5CityHighRef = useRef(null);
    const [highlight5City, setHighlight5City] = useState(false);

    const [crrMap, setCrrMap] = useState(null);

    const [storeListLayer, setStoreListLayer] = useState([]);

    const handleStoreListLayer = {
        add(newLayer, name) {
            if (view) {
                const findExistedLayer = storeListLayer.find(item => item.name === name);
                if (!findExistedLayer) {
                    const createLayer = createNewLayer(storeListLayer, newLayer, name);
                    storeListLayer.push(createLayer);
                    // view.map.add(createLayer.layer);
                    setStoreListLayer([...storeListLayer]);
                }
            }
        },
        remove(name) {
            const findIndex = storeListLayer.findIndex((item) => item.name === name);
            if (view) {
                if (findIndex >= 0) {
                    view.map.remove(storeListLayer[findIndex].layer);
                    storeListLayer.splice(findIndex, 1);
                    setStoreListLayer([...storeListLayer]);
                }
            }
        }
    }

    const [defaultGraphicsLayer, setDefaultGraphicsLayer] = useState(null);
    const [isShowLabel, setIsShowLabel] = useState(false);
    const [graphicLabel, setGraphicLabel] = useState(null);

    const crrCenter = useRef(null);
    const crrZoom = useRef(null);
    const crrChosenLocation = useRef(null);
    const [data, setData] = useState(null);

    const [dataCrrLoation, setDataCrrLocation] = useState(null);

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
            title: 'SL xe',
            dataIndex: 'numberofcar'
        },
        {
            key: 'SUCCESS',
            title: 'Chuyến HT',
            dataIndex: 'numberofcompleted'
        },
        {
            key: 'SUCCESS_RATE',
            title: 'Hoàn thành(%)',
            render(_, record) {
                return record ? (Number(record.numberofcompleted) / Number(record.numberofcar) * 100).toFixed(2) : 0;
            }
        },
        {
            key: 'STARTEGY',
            title: 'Chiến lược',
            render(_, record) {
                return record ? getStrategy(Number(record.numberofcompleted) / Number(record.numberofcar)) : ''
            }
        }
    ];
    const columnsTop = [
        {
            key: 'RANK',
            title: 'Hạng',
            render(value, record, index) {
                return Number(index) + 1;
            }
        },
        {
            key: 'AREA',
            title: 'Tỉnh/TP',
            render(_, record) {
                return `${record.type_1} ${record.name_1}`
            }
        },
        {
            key: 'NUMBER_CAR',
            title: 'SL xe',
            dataIndex: 'numberofcar'
        },
        {
            key: 'SUCCESS',
            title: 'Chuyến HT',
            dataIndex: 'numberofcompleted'
        },
        {
            key: 'SUCCESS_RATE',
            title: 'Hoàn thành(%)',
            render(_, record) {
                return ((Number(record.numberofcompleted) / Number(record.numberofcar)) * 100).toFixed(2);
            }
        },
    ];

    // pending logic
    useEffect(() => {
        if (view) {
            storeListLayer.forEach((item) => {
                view.map.remove(item.layer);
            });
            storeListLayer.forEach((item) => {
                view.map.add(item.layer);
            });
        }
    }, [storeListLayer, view]);

    // init map, view, data for viet nam 63 locations
    useEffect(() => {
        Config.apiKey = API_KEY
        // const featureLayer = new FeatureLayer({
        //     apiKey: API_KEY,
        //     url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
        // })

        const map = new Map({
            basemap: 'topo',
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
        if (view && defaultGraphicsLayer) {
            // event click 
            if (view) {
                view.on("click", async (event) => {
                    const clickedPoint = view.toMap({ x: event.x, y: event.y });
                    const crrLocation = await getCurrentLocation({
                        latitude: clickedPoint.latitude,
                        longitude: clickedPoint.longitude
                    });
                    if (crrLocation.data) {
                        setDataCrrLocation(crrLocation.data);
                        const getGraphic = createGraphic(crrLocation.data, true);
                        if (crrChosenLocation.current) {
                            view.map.remove(crrChosenLocation.current);
                        }
                        const popupContent = `
        <div class="popup-location">
          <p>${crrLocation.data.type_1} ${crrLocation.data.name_1}</p>
          <p>Diện tích: ${String(crrLocation.data.area_km2).slice(0, 5)} km2</p>
        </div>
      `;
                        // Add the graphic to the graphics layer
                        const newGraphicLayer = new GraphicsLayer({
                            graphics: getGraphic
                        })
                        view.popup.open({
                            title: `${crrLocation.data.name_1}`,
                            content: popupContent,
                            location: event.mapPoint
                        });
                        view.map.add(newGraphicLayer);
                        crrChosenLocation.current = newGraphicLayer;
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
    }, [view, defaultGraphicsLayer, graphicLabel]);
    // for view map, layer 63 locations viet nam default
    useEffect(() => {
        if (data && crrMap) {
            const graphics = data.map(item => {
                const graphic = createGraphic(item, null, null, null);
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
            setDefaultGraphicsLayer(graphicsLayer);
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
    useEffect(() => {
        if (crrMap && view) {
            if (isShowLabel) {
                const listlabel = new GraphicsLayer({
                    graphics: graphicLabel
                });
                handleStoreListLayer.add(listlabel, NameLayer.LABEL_BOUNDARY);
            } else {
                handleStoreListLayer.remove(NameLayer.LABEL_BOUNDARY);
            }
        }
    }, [isShowLabel, crrMap, view]);

    const showLayerHighlight5Cities = () => {
        crrGraphicsLayer5CityHighRef.current = null;
        data5CityHigh.forEach((item) => {
            const graphicCity = createGraphic(item, false, false, '#f70515', true);
            listGraphicLayerData5Cityhigh.current.push(graphicCity);
        });
        const graphicsLayerTop5 = new GraphicsLayer({
            graphics: listGraphicLayerData5Cityhigh.current
        });
        handleStoreListLayer.add(graphicsLayerTop5, NameLayer.TOP_5);
    };
    // for high light 5 cities
    useEffect(() => {
        if (view && data5CityHigh.length) {
            if (highlight5City) {
                showLayerHighlight5Cities();
            } else {
                handleStoreListLayer.remove(NameLayer.TOP_5);
            }
        }
    }, [highlight5City, view, data5CityHigh]);
    useEffect(() => {
        if (!data5CityHigh) {
            fetch('http://localhost:8888/connect/getStatistic6month5high.php')
                .then((rs) => rs.json())
                .then((data) => {
                    setData5CityHigh(data);
                })
        }
    }, [data5CityHigh, view]);

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
                                bordered
                                title={(data) => {
                                    return <div className="title">
                                        <span>Thông tin: <b>{dataCrrLoation ? dataCrrLoation.type_1 : ''} {dataCrrLoation ? dataCrrLoation.name_1 : ''}</b></span>
                                        <Checkbox className="toggle">
                                            <span>Hiện/Ẩn lớp</span>
                                        </Checkbox>
                                    </div>
                                }}
                                pagination={false}
                                dataSource={dataCrrLoation ? [{
                                    key: 1,
                                    ...dataCrrLoation
                                }] : []}
                                columns={columnsInfo}
                                size="small"
                            />
                            <Table
                                bordered
                                pagination={false}
                                title={(data) => {
                                    return <div className="title">
                                        <span>Top 5 thành phố có chỉ số cao nhất</span>
                                        <Checkbox
                                            defaultChecked={highlight5City}
                                            className="toggle"
                                            onChange={() => {
                                                setHighlight5City(!highlight5City);
                                            }}
                                        >
                                            <span>Hiện/Ẩn lớp</span>
                                        </Checkbox>
                                    </div>
                                }}
                                dataSource={data5CityHigh ? data5CityHigh.map((item) => {
                                    return {
                                        key: item.id,
                                        ...item
                                    }
                                }) : []}
                                columns={columnsTop}
                                size="small"
                            />
                        </div>
                    </div>
                </div>
                <div className="view-label">
                    <Checkbox defaultChecked={isShowLabel} onChange={() => {
                        setIsShowLabel((prev) => {
                            return !prev;
                        });
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