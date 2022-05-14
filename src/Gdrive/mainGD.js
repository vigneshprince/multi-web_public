import React from 'react';
import { useEffect, useState } from 'react';
import { Select, Row, Col, Button, AutoComplete, List, Avatar } from 'antd';
import './mainGD.css';
import axios from 'axios';
import { Consts } from '../Consts';
import tempimg from '../noimg.png';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { setfolderSize } from '../folderSize';

export default function MainGD() {
    const folderSize = useSelector((state) => state.fSize.value)
    const dispatch = useDispatch()
    const { Option } = Select;
    const [dropdown1, setDropdown1] = useState('file');
    const [result, setResult] = useState([]);
    const [SearchText, setSearchText] = useState('');
    let navigate = useNavigate();
    let location = useLocation();

    useEffect(() => {
        dispatch(setfolderSize(0))
    }, [])


    const handleSearch = (value) => {
        value.length > 3 ?
            axios.get(Consts.tmdb, {
                params: {
                    query: value
                }
            }).then(res => {
                let options = res.data.results.length > 0 ? res.data.results.filter(x => x.title !== undefined && x.release_date !== undefined) : []
                setResult(options.length > 0 ? options.sort((a, b) => (a.release_date < b.release_date ? 1 : -1)).map(x => renderItem(x)) : []);
            }) :
            setResult([]);
    }

    const renderItem = (data) => {
        let release_date = data.release_date.substring(0, 4)
        return {
            value: data.title + ' ' + release_date,
            label: (
                <List.Item>
                    <List.Item.Meta

                        avatar={<Avatar shape='square' size='large' src={data.poster_path !== null ? Consts.imgpath + data.poster_path : tempimg} />}
                        title={<div>
                            <span style={{ marginRight: '5px' }}>{data.title}</span>
                            <span>{release_date}</span>
                        </div>}
                    />
                </List.Item>
            ),
        };
    }
    const handleGDSearch = (txt) => {
        let srch=txt==''?SearchText:txt
        navigate('/gdrive/' + dropdown1 + '/' + srch, { state: { from: location } });
    }





    return (

        <div style={{ margin: "10px" }} >
            <Row gutter={[16, 30]} >
                <Col flex={1}>
                    <Select style={{display:"flex",textAlign:"center"}}  onChange={(value) => setDropdown1(value)} defaultValue={dropdown1}>
                        <Option value="file">File</Option>
                        <Option value="folder">Folder</Option>
                    </Select>
                </Col>
                <Col flex={15}>
                    <AutoComplete style={{display:"flex"}} onKeyDown={(e) => e.key === 'Enter' && handleGDSearch('')} onChange={(val) => setSearchText(val)} onSearch={handleSearch} onSelect={handleGDSearch} placeholder={dropdown1 == 'file' ? "Enter file name" : "Enter folder name"} allowClear options={result} >
                    </AutoComplete>
                </Col>
                <Col flex={1}>
                    < Button style={{display:"flex",width:"100%",justifyContent:"center"}} type="primary" onClick={() => handleGDSearch('')}>Search</Button >
                </Col>
                {folderSize !== 0 &&
                    <Col flex={1} >
                        <span className='fsize'>Current Folder Size : {folderSize}</span>
                    </Col>
                }
                <Col flex="100%">
                    <Outlet />

                </Col>
            </Row>

        </div>
    )

}