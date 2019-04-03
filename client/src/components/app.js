import 'materialize-css/dist/css/materialize.min.css';
import 'materialize-css/dist/js/materialize.min';
import '../assets/css/app.scss';
import React from 'react';
import MapContainer from './map/mapContainer';
import WholeFoodsTable from './wholeFoodsTable/wholeFoodsTable';
import './app.scss';

const App = () => (
    <div>
        <h1 className='center white-text'>Whole Living</h1>
        <MapContainer/>
        <WholeFoodsTable/>
    </div>
);

export default App;