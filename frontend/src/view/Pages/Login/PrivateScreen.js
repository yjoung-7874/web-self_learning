import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PrivateScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    !localStorage.getItem('authToken')?
    navigate('/login') : navigate('/Main')
  }, []);

};

export default PrivateScreen;
