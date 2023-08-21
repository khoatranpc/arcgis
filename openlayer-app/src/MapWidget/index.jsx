import { useEffect } from 'react';
import Home from '@arcgis/core/widgets/Home';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle';
import Locate from '@arcgis/core/widgets/Locate';

const MapWid = (props) => {
    useEffect(() => {
        props.view.ui.add(new Home({
            view: props.view
        }), 'top-left')
        props.view.ui.add(new Locate({
            view: props.view
        }), 'top-left')
        // props.view.ui.add(new BasemapToggle({
        //     view: props.view,
        //     nextBasemap: "satellite", // The basemap to switch to when toggling
        // }))
    }, []);
    return null;
}

export default MapWid;