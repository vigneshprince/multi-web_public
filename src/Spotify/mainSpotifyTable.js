import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Table, Popconfirm, Input } from 'antd';
import './mainSpotify';
import axios from 'axios';
import { Consts } from '../Consts';
import { useParams, useNavigate } from "react-router-dom";
import {
    DoubleRightOutlined,
} from '@ant-design/icons'
import Bottleneck from 'bottleneck';
import SpotifyWebApi from "spotify-web-api-node"

export default function MainSpotifyTable() {
    let params = useParams();
    let navigate = useNavigate();
    const limiter = new Bottleneck({
        maxConcurrent: 1
    });
    const spotifyApi = new SpotifyWebApi({
        clientId: 'f776f42ddd3e472680016e9a939476c3',
        clientSecret: '69fa57836cfc4110a30e154e977513f2',
        redirectUri: 'http://localhost:3000'
    });

    const [spotifyresult, setSpotifyResult] = useState([]);
    const [TransStatus, setTransStatus] = useState([]);
    const [selectedRows, setselectedRows] = useState([]);
    const [FolderName, setFolderName] = useState('');
    const [TableLoad, setTableLoad] = useState(false);

    useEffect(() => {
        setTableLoad(true)
        setselectedRows([])
        setSpotifyResult([])
        setTransStatus([])
        if (params.type === 'Track' && params.name.length > 3) {
            spotifyApi.searchTracks(params.name).then((data) => {
                // setSpotifyResult(data.body.tracks.items)
                // setTableLoad(false)
                console.log(data.body)
            }
            )
        }
    }, [params]);
    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }



    const colours = {
        'Transferring': '#3e054d',
        'Transfer': '#095cb5',
        'Failed': 'Red',
        'Copied': 'Green'
    }
    const columns = [
        {
            title: selectedRows.length > 0 ? 'Name (Selected :' + selectedRows.length + ')' : 'Name',
            dataIndex: 'name',
            render: (text, record) => (
                record.mimeType.includes('folder') ? <span>{text}</span> : <span>{text}</span>
            )
        },
        {
            title: 'Size',
            dataIndex: 'size',
            render: (text, record) => (
                text !== undefined && <span>{bytesToSize(Number(text))}</span>)
        },
        {
            title: selectedRows.length > 0 ?
                <Popconfirm title={<Input onChange={(e) => setFolderName(e.target.value)} placeholder='Enter Folder Name' defaultValue="" />} okText='Copy' onConfirm={() => Multicopy()} >
                    <Button style={{ backgroundColor: 'green', fontWeight: 'bold' }}>{'Copy ' + selectedRows.length + ' items'}</Button>
                </Popconfirm> : '',
            key: 'action',
            render: (text, record) => {
                if (!record.mimeType.includes('folder')) {
                    let status = TransStatus.find(x => x.id == record.id).status
                    return (
                        < Button type="primary" style={{ backgroundColor: colours[status] }} loading={status == 'Transferring' ? true : false} onClick={() => TransferSpotifyFile(record)}> {status}</Button >
                    )

                }
                return <DoubleRightOutlined onClick={() => nextPage(record)} style={{ fontSize: '25px' }} />


            },
        },
    ]
    const nextPage = (record) => {
        navigate(`/spotifyrive/${record.id}`)
    }
    const Multicopy = () => {
        axios.post(Consts.baseUrl + 'spotifyfoldercreate', {
            'name': FolderName
        }).then(res => {

            MultiTransferSpotifyFile(res.data.id)

        })
    }
    const TransferSpotifyFile = async (data) => {
        let index = TransStatus.findIndex(x => x.id == data.id);
        let temp = TransStatus
        if (temp[index]['status'] != 'Transferring') {
            temp[index]['status'] = 'Transferring'
            setTransStatus(temp)
            let res = await axios.post(Consts.baseUrl + 'spotifyfiletransfer', {
                name: data.name,
                id: data.id,
                parent: ''
            }
            )
            temp[index]['status'] = res.data == 1 ? 'Copied' : 'Failed'
            setTransStatus(temp)

        }
    }

    const MultiTransferSpotifyFile = (FolderID) => {
        let temp = TransStatus
        selectedRows.forEach(x => {
            let index = TransStatus.findIndex(y => y.id == x.id);
            if (temp[index]['status'] != 'Transferring') {
                temp[index]['status'] = 'Transferring'

            }
        })
        setTransStatus(temp)
        selectedRows.forEach(x => {
            let index = TransStatus.findIndex(y => y.id == x.id);
            limiter.schedule(() =>
                axios.post(Consts.baseUrl + 'spotifyfiletransfer', {
                    name: x.name,
                    id: x.id,
                    parent: FolderID
                }
                ).then(res => {
                    temp[index]['status'] = res.data == 1 ? 'Copied' : 'Failed'
                }).catch(e => console.log(e))
            )

            /* limit(() => new Promise((resolve, reject) => {
                axios.post(Consts.baseUrl + 'spotifyfiletransfer', {
                    name: x.name,
                    id: x.id,
                    parent: FolderID
                }
                ).then(res => {
                    temp[index]['status'] = res.data == 1 ? 'Copied' : 'Failed'
                    resolve('done')
                }).catch(e => reject(e))
            })
            ) */
        })
    }

    const rowSelection = {
        onChange: (keys, rows) => setselectedRows(rows),
        getCheckboxProps: (record) => ({
            disabled: record.mimeType.includes('folder'),
            name: record.name,
        }),
    };



    return (


        <Table rowKey='id' rowSelection={{ type: 'checkbox', ...rowSelection }} rowClassName={(record) => record.mimeType.includes('folder') ? 'folder-row' : 'file-row'}

            loading={TableLoad}
            columns={columns}
            dataSource={spotifyresult} />

    )

}