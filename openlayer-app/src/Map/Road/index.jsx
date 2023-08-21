import { Checkbox, Table } from 'antd';
import React, { useEffect } from 'react';

const Road = (props) => {
    useEffect(() => {
        // console.log(props.data);
    }, [])
    const columns = [
        {
            key: 'CODE',
            title: 'Mã đường',
            dataIndex: 'ma'
        },
        {
            key: 'TYPE',
            title: 'Loại đường',
            dataIndex: 'loai_duong'
        },
        {
            key: 'NAME',
            title: 'Tên đường',
            dataIndex: 'ten'
        },
        {
            key: 'LEVEL_ROAD',
            title: 'Cấp đường',
            dataIndex: 'cap_duong'
        },
        {
            key: 'LONG',
            title: 'Chiều dài',
            dataIndex: 'chieu_dai',
            render(value) {
                return Number(Number(value).toFixed(2)).toLocaleString();
            }
        },
        {
            key: 'OF',
            title: 'Địa phận',
            dataIndex: 'name_1'
        }
    ];
    const dataSource = props.data.map((item) => {
        return {
            key: item.__gid,
            ...item
        }
    })
    return (
        <Table
            size="small"
            scroll={{
                y: 155
            }}
            dataSource={dataSource}
            title={(data) => {
                return <div className="title">
                    <span>Tuyến đường</span>
                    <Checkbox
                        defaultChecked={props.showDataRoad}
                        className="toggle"
                        onChange={() => {
                            props.setShowDataRoad(!props.showDataRoad);
                        }}
                    >
                        <span>Hiện/Ẩn lớp</span>
                    </Checkbox>
                </div>
            }}
            bordered
            columns={columns}
        />
    )
}

export default Road;