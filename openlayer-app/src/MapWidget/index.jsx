import React, { useEffect } from 'react';
import Home from '@arcgis/core/widgets/Home';
import Locate from '@arcgis/core/widgets/Locate';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';

const MapWid = (props) => {
    useEffect(() => {
        props.view.ui.add(new Home({
            view: props.view
        }), 'top-left')
        props.view.ui.add(new Locate({
            view: props.view
        }), 'top-left')
    }, []);
    return null;
}

export default MapWid;