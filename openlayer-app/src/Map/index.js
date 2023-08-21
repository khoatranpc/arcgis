import { useEffect, useRef, useState } from "react";
import Form from 'react-bootstrap/Form';
import { Table, Select, Checkbox, Tabs, Dropdown, Input } from 'antd';
import Map from '@arcgis/core/Map';
import Config from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapWid from "../MapWidget";
import { createGraphic, createNewLayer, getCurrentLocation, getStrategy } from "../utils";
import Top5 from "./Top5";
import ListLayer from "./ListLayer";
import Road from "./Road";

const Color = {
    BASE_MAP: '#abb4f5',
    LABEL_BOUNDARY: '#000000',
    ROAD: '#c300ff'
}
const NameLayer = {
    BASE_MAP: 'Bản đồ nền',
    BOUNDARY: 'Tỉnh/TP',
    LABEL_BOUNDARY: 'Nhãn Tỉnh/TP',
    TOP_5: 'Top 5 Tỉnh/TP',
    CHOSEN: 'Lựa chọn Tỉnh/TP',
    ROAD: 'Đường'
}
const API_KEY = "AAPK519b0f73274445b099c5ce04e3d7f43f4PbJsDET9wQKENiRoQnSqCFfxzzpRTpbR-L0FRqX1CSIwOf5AF8_qavPJl3Aj6pf"
const MyMap = () => {
    const [view, setView] = useState(null);

    const [dataRoad, setDataRoad] = useState(null);
    const [showDataRoad, setShowDataRoad] = useState(false);

    const [data5CityHigh, setData5CityHigh] = useState(null);
    const listGraphicLayerData5Cityhigh = useRef([]);
    const crrGraphicsLayer5CityHighRef = useRef(null);
    const [highlight5City, setHighlight5City] = useState(false);

    const [crrMap, setCrrMap] = useState(null);

    const [storeListLayer, setStoreListLayer] = useState([]);

    const [isShowBaseMap, setIsShowBaseMap] = useState(true);

    const handleStoreListLayer = {
        add(newLayer, name, color) {
            if (view) {
                const findExistedLayer = storeListLayer.find(item => item.name === name);
                if (!findExistedLayer) {
                    const createLayer = createNewLayer(storeListLayer, newLayer, name, color);
                    storeListLayer.push(createLayer);
                    view.map.add(createLayer.layer);
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

    const [optionSearchByName, setOptionSearchByName] = useState([]);
    const handleSearch = (value) => {
        if (value) {
            fetch(`http://localhost:8888/connect/getCurrentLocationByName.php?name=${value}`).then(rs => rs.json()).then((data) => {
                setOptionSearchByName(data.map((item) => {
                    return {
                        key: item.gid,
                        label: item.name_1,
                        ...item
                    }
                }));
            });
        }
    }
    const mapRef = useRef();
    const handleSubmit = (e) => {
        e.preventDefault();
    }
    const columnsInfo = [
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
            key: 'NUMBEROFTRIPS',
            title: 'Tổng số chuyến đi',
            dataIndex: 'numberoftrips',
            render(value) {
                return Number(value).toLocaleString();
            }
        },
        {
            key: 'SUCCESS_RATE',
            title: 'Hoàn thành(%)',
            render(_, record) {
                return record ? (Number(record.numberofcompleted) / Number(record.numberoftrips) * 100).toFixed(2) : 0;
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
            if (defaultGraphicsLayer) {
                handleStoreListLayer.add(defaultGraphicsLayer, NameLayer.BOUNDARY, Color['BASE_MAP']);
            }
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
          <p>Chuyến hoàn thành: ${Number(crrLocation.data.numberofcompleted).toLocaleString()}/${Number(crrLocation.data.numberoftrips).toLocaleString()} chuyến!</p>
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
                    view.hitTest(event).then((res) => {
                        if (res.results.length) {
                            const clickedGraphics = res.results.map((item) => {
                                return {
                                    grahic: item.graphic,
                                    layer: item.layer
                                }
                            });
                        }
                    });
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
            // crrMap.add(graphicsLayer);
        }
    }, [data, crrMap]);
    useEffect(() => {
        if (crrMap && view) {
            if (isShowLabel) {
                const listlabel = new GraphicsLayer({
                    graphics: graphicLabel
                });
                handleStoreListLayer.add(listlabel, NameLayer.LABEL_BOUNDARY, Color['LABEL_BOUNDARY']);
            } else {
                handleStoreListLayer.remove(NameLayer.LABEL_BOUNDARY);
            }
        }
    }, [isShowLabel, crrMap, view]);

    const items = [
        {
            key: 'TOP5',
            label: 'Top 5 Tỉnh/TP',
            children: <Top5 data5CityHigh={data5CityHigh} setHighlight5City={setHighlight5City} highlight5City={highlight5City} />
        },
        {
            key: 'ROAD',
            label: 'Tuyến đường',
            children: <Road data={dataRoad} showDataRoad={showDataRoad} setShowDataRoad={setShowDataRoad} />
        },
        {
            key: 'LIST_LAYER',
            label: 'Danh sách lớp',
            children: <ListLayer storeListLayer={storeListLayer} />
        },
    ]
    const showLayerHighlight5Cities = () => {
        crrGraphicsLayer5CityHighRef.current = null;
        data5CityHigh.forEach((item) => {
            const graphicCity = createGraphic(item, false, false, '#00ffd5');
            listGraphicLayerData5Cityhigh.current.push(graphicCity);
        });
        const graphicsLayerTop5 = new GraphicsLayer({
            graphics: listGraphicLayerData5Cityhigh.current,
            title: NameLayer.TOP_5
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
                    data.sort((a, b) => {
                        return -(Number(a.numberofcompleted) / Number(a.numberoftrips)) + (Number(b.numberofcompleted) / Number(b.numberoftrips))
                    });
                    setData5CityHigh(data);
                })
        }
    }, [data5CityHigh, view]);

    // data road
    useEffect(() => {
        if (!dataRoad) {
            fetch('http://localhost:8888/connect/getRoad.php')
                .then((rs) => rs.json())
                .then(data => {
                    setDataRoad(data);
                })
        }
    }, [dataRoad]);

    useEffect(() => {
        if (view) {
            if (isShowBaseMap) {
                view.map.basemap = 'topo'
            } else {
                view.map.basemap = 'none'
            }
        }
    }, [isShowBaseMap, view]);
    useEffect(() => {
        if (view) {
            if (showDataRoad) {
                if (dataRoad) {
                    const listGraphicRoad = dataRoad.map((item) => {
                        return createGraphic(item, null, null, Color.ROAD, true, 1);
                    });
                    const createGraphicLayer = new GraphicsLayer({
                        graphics: listGraphicRoad,
                    });
                    const newLayer = createNewLayer(storeListLayer, createGraphicLayer, NameLayer.ROAD, Color.ROAD);
                    handleStoreListLayer.add(newLayer.layer, NameLayer.ROAD, Color.ROAD);
                }
            } else {
                handleStoreListLayer.remove(NameLayer.ROAD);
            }
        }
    }, [view, showDataRoad, dataRoad]);
    return (
        <div style={{ height: '100vh' }} className="visualize-map">
            <div className="main-content">
                <div className="area-function">
                    <div className="form-infor">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-8" controlId="exampleForm.ControlInput1">
                                <Dropdown
                                    menu={{
                                        items: optionSearchByName,
                                        onClick(info) {
                                            const findLocation = optionSearchByName.find((item) => {
                                                return Number(item.key) === Number(info.key);
                                            });
                                            if (findLocation) {
                                                setDataCrrLocation(findLocation);
                                                if (view) {
                                                    view.map.remove(crrChosenLocation.current);
                                                    const getGraphic = createGraphic(findLocation, true, null, '#ff9100');
                                                    const newGraphicLayer = new GraphicsLayer({
                                                        graphics: getGraphic
                                                    });
                                                    view.map.add(newGraphicLayer);
                                                    crrChosenLocation.current = newGraphicLayer;
                                                }
                                            }
                                        }
                                    }}
                                    trigger={['click']}
                                >
                                    <Input
                                        style={{
                                            width: '300px',
                                            float: 'right'
                                        }}
                                        size="small"
                                        onChange={(e) => {
                                            handleSearch(e.target.value);
                                        }}
                                        placeholder="Nhập tên Tỉnh/TP"
                                    />
                                </Dropdown>
                                {/* <Select
                                    onSearch={(value) => {
                                        handleSearch(value);
                                    }}
                                    options={optionSearchByName}
                                    showSearch
                                    placeholder="Nhập Tỉnh/TP"
                                /> */}
                            </Form.Group>
                        </Form>
                        <div className="legend">
                            <Table
                                bordered
                                title={(data) => {
                                    return <div className="title">
                                        <span>Thông tin: <b>{dataCrrLoation ? dataCrrLoation.type_1 : ''} {dataCrrLoation ? dataCrrLoation.name_1 : ''}</b></span>
                                        {/* <Checkbox className="toggle">
                                            <span>Hiện/Ẩn lớp</span>
                                        </Checkbox> */}
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
                        </div>
                    </div>
                    <Tabs items={items} className="list-tab" />
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
                <div className="view-label view-basemap">
                    <Checkbox
                        defaultChecked={isShowBaseMap}
                        onChange={() => {
                            setIsShowBaseMap(!isShowBaseMap);
                        }}>
                        <span>Hiển thị bản đồ nền</span>
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