import React from "react";
import logo from "./logo.svg";

function App() {
  return (
    <div style={{ height: '100vh', overflow: 'auto' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img src={logo} alt="Logo" style={{ height: '50px', marginRight: '20px' }} />
        <h1>粘性布局示例</h1>
      </header>
      <main style={{ padding: '20px' }}>
        <h2>主要内容</h2>
        <p>这是一个使用粘性布局的示例。向下滚动页面，你会发现顶部的标题栏会保持在视图中。</p>
        {[...Array(22)].map((_, index) => (
          <p key={index}>这是第 {index + 1} 段占位文本，用于演示滚动效果。</p>
        ))}
      </main>
    </div>
  );
}

export default App;
