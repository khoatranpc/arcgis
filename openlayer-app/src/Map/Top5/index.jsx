import { Checkbox, Table } from 'antd';
import React from 'react';

const Top5 = (props) => {
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

    return (
        <Table
            bordered
            pagination={false}
            title={(data) => {
                return <div className="title">
                    <span>Top 5 thành phố có chỉ số cao nhất</span>
                    <Checkbox
                        defaultChecked={props.highlight5City}
                        className="toggle"
                        onChange={() => {
                            props.setHighlight5City(!props.highlight5City);
                        }}
                    >
                        <span>Hiện/Ẩn lớp</span>
                    </Checkbox>
                </div>
            }}
            dataSource={props.data5CityHigh ? props.data5CityHigh.map((item) => {
                return {
                    key: item.id,
                    ...item
                }
            }) : []}
            columns={columnsTop}
            size="small"
        />
    )
}

export default Top5