import React, { useState } from 'react'
import store from "./store"
import { Provider } from "react-redux"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import PrivateScreen from './view/Pages/Login/PrivateScreen'
import LoginScreen from './view/Pages/Login/LoginScreen'
import RegisterScreen from './view/Pages/Login/RegisterScreen'
// import ResetPasswordScreen from './view/Pages/Login/ResetPasswordScreen'

import Main from './view/Pages/Main'
import Bookmark from './view/Pages/Review/Bookmark';
import History from './view/Pages/Review/History';
import Reference from './view/Pages/Reference'

import Layout from './view/Layout/Layout';
import Recommend from './view/Pages/Recommend'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route exact path="/" element={<PrivateScreen />} />
            <Route exact path="/login" element={<LoginScreen/>} />
            <Route exact path="/register" element={<RegisterScreen/>} />

            <Route exact path="/Main" element={<Main />} />
            <Route exact path="/Review" element={<Navigate replace to="/Review/Bookmark"/>} />
            <Route exact path="/Review/Bookmark" element={<Bookmark />} />
            <Route exact path="/Review/History" element={<History />} />
            <Route exact path="/Reference" element={<Reference/>} />
            <Route exact path="/Recommended" element={<Recommend />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}
  
export default App;