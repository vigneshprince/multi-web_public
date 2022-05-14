import React, { useEffect, useState } from 'react';
import TinderCard from 'react-tinder-card'
import axios from 'axios';
import { Consts } from './Consts';
import { Card } from 'antd';
export default function Reddit() {

  const [reddit, setReddit] = useState([])
  useEffect(() => {
    axios.get(Consts.baseUrl + 'reddit').then(res => {
      setReddit(res.data);
    })
  }, [])

  return (
    <div className="App">
      {reddit.map((reddit) =>
        <Card
          style={{ width: 300 }}
          cover={
            <img
              alt="example"
              src={reddit.url}
            />
          }
        />
      )
      }
    </div>
  );
}