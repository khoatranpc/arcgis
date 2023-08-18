import Graphic from '@arcgis/core/Graphic';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import wellknown from 'wellknown';

const getStrategy = (ratingSuccess) => {
    if (ratingSuccess > 0.75) {
        return 'Tăng số lượng xe!'
    } else if (0.5 <= ratingSuccess && ratingSuccess <= 0.75) {
        return 'Duy trì số lượng xe!'
    }
    return 'Giảm số lượng xe!'
}
const getCurrentLocation = (coordinates) => {
    const data = fetch(`http://localhost:8888/connect/getCurrentLocation.php?longitude=${coordinates.longitude}&&latitude=${coordinates.latitude}`)
        .then((rs) => {
            return rs.json();
        })
        .then((finallyRs) => {
            return {
                data: finallyRs[0] || [],
                success: true,
                message: 'Thành công!'
            }
        })
        .catch((err) => {
            return {
                data: null,
                success: false,
                err
            }
        });
    return data;
}
const getGeometry = (geometry) => {
    return wellknown.parse(geometry);
}
const createGraphic = (record, anyColor, enabledLable) => {
    const geometry = getGeometry(record.geometry)// Parse WKT to geometry
    const polygonCoordinates = geometry.coordinates.flat();
    // console.log(polygonCoordinates);
    const polygon = {
        type: 'polygon',
        rings: polygonCoordinates,
    };
    // Create a graphic with the converted Polygon geometry
    const rgb = [];
    if (anyColor) {
        for (var i = 0; i < 3; i++)
            rgb.push(Math.floor(Math.random() * 255));
    }
    if (enabledLable) {
        const textSymbol = new TextSymbol({
            text: record.name_1,
            color: 'black'
        });
        const graphicLabel = new Graphic({
            geometry: polygon,
            symbol: textSymbol,
        });
        return graphicLabel;
    }
    const graphic = new Graphic({
        geometry: polygon,
        symbol: {
            type: 'simple-fill',
            color: anyColor ? [255, 0, 0, 0.8] : '#abb4f5',
            outline: {
                color: anyColor ? [255, 0, 0, 0.8] : [0, 0, 0, 1], // Black with 100% opacity
                width: 1
            },
        },
        attributes: {
            label: record.varname_1
        }
    });
    return graphic;
}
export {
    getStrategy,
    getCurrentLocation,
    createGraphic,
    getGeometry
}
