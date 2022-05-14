import React from 'react';
import { useEffect, useState } from 'react';
import _ from 'lodash'
import { Layout, Menu, Button } from 'antd';
import {
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate,useLocation, Link, Outlet, Navigate } from "react-router-dom";
import { useGoogleAuth } from "./googleAuth";

function MainPage() {

  const { Header } = Layout;
  let location = useLocation();
  const [currentMenu, setCurrentMenu] = useState(location.pathname=='/'?'/gdrive':location.pathname);
  const { signOut } = useGoogleAuth();
  let navigate = useNavigate();

  const handleClick = (e) => {
    setCurrentMenu(e.key)
  }

  const signOutClick = () => {
    sessionStorage.removeItem('loggedin');
    signOut();
    navigate('/login', { replace: true });

  }

  return (
    <div>
      <Header>
        <div className="uname">
          {JSON.parse(sessionStorage.getItem('loggedin')).name}
          <Button onClick={signOutClick} className='logout' type="primary" shape="circle" icon={<LogoutOutlined />} />
        </div>
        <Menu onClick={handleClick} theme="dark" mode="horizontal" defaultSelectedKeys={[currentMenu]}>
          <Menu.Item key="/gdrive"> <Link to="/gdrive">Google Drive</Link> </Menu.Item>
{/*           <Menu.Item key="/reddit"> <Link to="/reddit">Reddit</Link> </Menu.Item>
          <Menu.Item key="/spotify"> <Link to="/spotify">Spotify</Link> </Menu.Item> */}
        </Menu>

      </Header>
      <Outlet />
      {
        location.pathname == '/' && <Navigate to='/gdrive' />
      }
    </div>
  );
}

export default MainPage;
