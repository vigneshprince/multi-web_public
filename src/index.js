import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GoogleAuthProvider } from './googleAuth';
import store from './store'
import { Provider } from 'react-redux'
import './index.less';
ReactDOM.render(
  <Provider store={store}>
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
  </Provider>,
  document.getElementById('root')
);

