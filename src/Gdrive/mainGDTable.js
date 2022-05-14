import React from 'react';
import { useEffect, useState } from 'react';
import { Button, Table, Popconfirm, Input } from 'antd';
import './mainGD.css';
import axios from 'axios';
import { Consts } from '../Consts';
import { useParams, useNavigate } from "react-router-dom";
import {
    DoubleRightOutlined,
} from '@ant-design/icons'
import { useDispatch } from 'react-redux'
import { setfolderSize } from '../folderSize'
import Bottleneck from 'bottleneck';

export default function MainGDTable() {
    let params = useParams();
    let navigate = useNavigate();
    const dispatch = useDispatch()
    const limiter = new Bottleneck({
        maxConcurrent: 1
    });

    const [gdresult, setGDResult] = useState([]);
    const [TransStatus, setTransStatus] = useState([]);
    const [selectedRows, setselectedRows] = useState([]);
    const [FolderName, setFolderName] = useState('');
    const [TableLoad, setTableLoad] = useState(false);

    useEffect(() => {
        setTableLoad(true)
        setselectedRows([])
        setGDResult([])
        setTransStatus([])
        dispatch(setfolderSize(0))
        if ('id' in params) {
            axios.post(Consts.baseUrl + 'gdchildrensearch', {
                'name': params.id
            }).then(res => {
                setTransStatus(res.data.files.map(x => {
                    return {
                        id: x.id,
                        status: 'Transfer'
                    }
                }))
                setGDResult([...res.data.files, ...res.data.folders]);
                dispatch(setfolderSize(bytesToSize(res.data.folder_size)))
                setTableLoad(false)
            })
        }
        else {
            if (params.type === 'file') {
                axios.post(Consts.baseUrl + 'gdfilesearch', {
                    'name': params.name
                }).then(res => {
                    setTransStatus(res.data.map(x => {
                        return {
                            id: x.id,
                            status: 'Transfer'
                        }
                    }))
                    setGDResult(res.data);

                    setTableLoad(false)
                })
            }
            else {
                axios.post(Consts.baseUrl + 'gdfoldersearch', {
                    'name': params.name
                }).then(res => {

                    setGDResult(res.data);
                    setTableLoad(false)
                })

            }
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
                record.mimeType.includes('folder') ? <span className='text-wrap'>{text}</span> : <span className='text-wrap'>{text}</span>
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
                        < Button type="primary" style={{ backgroundColor: colours[status] }} loading={status == 'Transferring' ? true : false} onClick={() => TransferGDFile(record)}> {status}</Button >
                    )

                }
                return <DoubleRightOutlined onClick={() => nextPage(record)} style={{ fontSize: '25px' }} />


            },
        },
    ]
    const nextPage = (record) => {
        navigate(`/gdrive/${record.id}`)
    }
    const Multicopy = () => {
        axios.post(Consts.baseUrl + 'gdfoldercreate', {
            'name': FolderName
        }).then(res => {

            MultiTransferGDFile(res.data.id)

        })
    }
    const TransferGDFile = async (data) => {
        let index = TransStatus.findIndex(x => x.id == data.id);
        let temp = TransStatus
        if (temp[index]['status'] != 'Transferring') {
            temp[index]['status'] = 'Transferring'
            setTransStatus(temp)
            let res = await axios.post(Consts.baseUrl + 'gdfiletransfer', {
                name: data.name,
                id: data.id,
                parent: ''
            }
            )
            temp[index]['status'] = res.data == 1 ? 'Copied' : 'Failed'
            setTransStatus(temp)

        }
    }

    const MultiTransferGDFile = (FolderID) => {
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
                axios.post(Consts.baseUrl + 'gdfiletransfer', {
                    name: x.name,
                    id: x.id,
                    parent: FolderID
                }
                ).then(res => {
                    temp[index]['status'] = res.data == 1 ? 'Copied' : 'Failed'
                }).catch(e => console.log(e))
            )

            /* limit(() => new Promise((resolve, reject) => {
                axios.post(Consts.baseUrl + 'gdfiletransfer', {
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


        <Table size='middle' rowKey='id' rowSelection={{ type: 'checkbox', ...rowSelection }} rowClassName={(record) => record.mimeType.includes('folder') ? 'folder-row' : 'file-row'}

            loading={TableLoad}
            columns={columns}
            dataSource={gdresult} />

    )

}