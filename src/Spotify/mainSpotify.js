import React from 'react';
import { useEffect, useState } from 'react';
import { Select, Row, Col, Button, AutoComplete, List, Avatar, Input } from 'antd';
import './mainSpotify.css';
import axios from 'axios';
import { Consts } from '../Consts';
import tempimg from '../noimg.png';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import SpotifyWebApi from "spotify-web-api-node"

export default function MainSpotify() {

    const folderSize = useSelector((state) => state.fSize.value)
    const dispatch = useDispatch()
    const { Option } = Select;
    const [dropdown1, setDropdown1] = useState('Track');
    const [result, setResult] = useState([]);
    const [SearchText, setSearchText] = useState('');
    let navigate = useNavigate();
    let location = useLocation();

    const scopes = ['user-read-private', 'user-read-email']
    useEffect(() => {
        axios.get('https://www.jiosaavn.com/api.php?p=1&q=hobbit&_format=json&_marker=0&api_version=4&ctx=wap6dot0&n=20&__call=search.getAlbumResults' , {headers: {
            'Access-Control-Allow-Origin': '*',
          }} ).then(res => {
            console.log(res)
        }
        )
    }, [])




    const HandleSearch = (val) => {
        navigate('/spotify/' + dropdown1 + '/' + val, { replace: true });
    }





    return (

        <div style={{ margin: "10px" }} >
            <Row gutter={[16, 30]} >
                <Col flex={1}>
                    <Select style={{ display: "flex", textAlign: "center" }} onChange={(value) => setDropdown1(value)} defaultValue={dropdown1}>
                        <Option value="Track">Track</Option>
                        <Option value="Artist">Artist</Option>
                        <Option value="Album">Album</Option>
                    </Select>
                </Col>
                <Col flex={4}>
                    <Input.Group style={{ display: "flex" }} compact>
                        <Input onChange={(e) => HandleSearch(e.target.value)} placeholder={`Enter ${dropdown1} name`} allowClear />
                        <Button type="primary">Search</Button>
                    </Input.Group>

                </Col>
                <Col flex={4}>
                    <Button type="primary">Spotify Sigin</Button>
                </Col>


                <Col flex="100%">
                    <Outlet />

                </Col>
            </Row>

        </div>
    )

}