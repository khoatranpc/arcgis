import React from 'react';

const ListLayer = (props) => {
    return (
        <div className="list-layer">
            <div className="container-layer">
                <div className="left">
                    <p><b>Danh sách lớp</b></p>
                    {props.storeListLayer.map((item) => {
                        return <div className="item-label" key={item.name}><button className="btn-layer" style={{ backgroundColor: item.color }}></button> {item.name}</div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default ListLayer;