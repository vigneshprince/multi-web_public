import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
export default function PrivateRoute({ children }) {
    let location = useLocation();
    const session = sessionStorage.getItem('loggedin');
    if (!session)
        return <Navigate to="/login" state={{ from: location }} />;
    return children
}
