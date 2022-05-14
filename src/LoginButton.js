import React, { useEffect, useState } from 'react';
import { useGoogleAuth } from './googleAuth';
import { Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GoogleCircleFilled
} from '@ant-design/icons'
import { Consts } from './Consts';
import Loader from './Loader';
import axios from 'axios';
const LoginButton = () => {

  const { signIn, isSignedIn, googleUser } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  let location = useLocation();
  let navigate = useNavigate();

  let from = location.state?.from?.pathname || "/";
  useEffect(() => {
    setIsLoading(true)
    if (isSignedIn) {
      axios.post(Consts.baseUrl+'checkuser', { 'email': googleUser.profileObj.email }).then(res => {
        if (res.data == 1) {
          sessionStorage.setItem('loggedin', JSON.stringify(googleUser.profileObj));
          navigate(from, { replace: true });
        }
        else
          setIsLoading(false)

      }).catch(err => {
        setIsLoading(false)
      })
    }
    else
      setIsLoading(false)


  }, [isSignedIn])

  return (
    <div>
      {isLoading && <Loader />}
      {!isLoading && <div className='center'>
        <Button onClick={signIn} className='logout' type="primary" shape="default" icon={<GoogleCircleFilled />} size='large'> Google Signin</Button>
      </div>
      }
    </div>
  );
};

export default LoginButton;