import { useEffect } from 'react';

import MyMap from './Map';
import './App.scss';


function App() {
  useEffect(() => {
  }, []);
  return (
    <div className="App">
      <div className="map-view">
        <MyMap />
      </div>
    </div>
  );
}

export default App;
