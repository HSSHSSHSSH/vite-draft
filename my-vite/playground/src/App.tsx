import React, { useState } from 'react';
import EnhancedSkyArmyScene from './components/skyChaos';

const redBackgroundStyle = {
  backgroundColor: 'yellow'
};

function App() {
  const [count, setCount] = useState(0);
  function handleClick() {
    console.log('count', count);
    setCount(count + 3);
  }
  return (
    <div className="App" style={redBackgroundStyle}>
      {/* <EnhancedSkyArmyScene /> */}
      <button onClick={handleClick}>点击</button>
      <div>{count}</div>
    </div>
  );
}

export default App;
