import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRouter from './PrivateRoute';
import './App.css';
import LoginButton from './LoginButton';
import MainGD from './Gdrive/mainGD';
import MainSpotify from './Spotify/mainSpotify';
import MainPage from './MainPage'
import MainGDTable from './Gdrive/mainGDTable';
import MainSpotifyTable from './Spotify/mainSpotifyTable';
import Reddit from './reddit';
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRouter>
                <MainPage />
              </PrivateRouter>
            }
          >
            <Route path="/gdrive" element={<MainGD />} >
              <Route path=":type/:name" element={<MainGDTable />} />
              <Route path=":id" element={<MainGDTable />} />
            </Route>


            <Route path="/spotify" element={<MainSpotify />} >
              <Route path=":type/:name" element={<MainSpotifyTable />} />
            </Route>
            <Route path="/reddit" element={<Reddit />} ></Route>

          </Route>
          <Route
            path="*"
            element={
              <main style={{ padding: "1rem" }}>
                <p>Wrong Sub URL !!</p>
              </main>
            }
          />
          <Route path="/login" element={<LoginButton />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;