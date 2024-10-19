import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import demo from './demo.png';

const Sun = ({ isDay }) => (
  <div style={{
    position: 'absolute',
    top: isDay ? '10%' : '100%',
    left: '80%',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#FFD700',
    boxShadow: '0 0 50px #FFD700',
    transition: 'top 10s ease-in-out',
  }} />
);

const Moon = ({ isDay }) => (
  <div style={{
    position: 'absolute',
    top: isDay ? '100%' : '10%',
    left: '20%',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#F0F0F0',
    boxShadow: '0 0 20px #F0F0F0',
    transition: 'top 10s ease-in-out',
  }} />
);

const Cloud = ({ top, left, scale = 1 }) => (
  <div style={{
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: `${100 * scale}px`,
    height: `${50 * scale}px`,
    borderRadius: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
    animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
  }} />
);

const Mountain = ({ left, height, color }) => (
  <div style={{
    position: 'absolute',
    bottom: '20%',
    left: `${left}%`,
    width: '0',
    height: '0',
    borderLeft: `${height / 2}px solid transparent`,
    borderRight: `${height / 2}px solid transparent`,
    borderBottom: `${height}px solid ${color}`,
  }} />
);

const DetailedMonkey = () => (
  <div style={{
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: '120px',
    height: '200px',
  }}>
    {/* Body */}
    <div style={{
      position: 'absolute',
      bottom: '0',
      width: '100%',
      height: '60%',
      backgroundColor: 'brown',
      borderRadius: '50% 50% 0 0',
    }} />
    {/* Head */}
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '70px',
      height: '70px',
      backgroundColor: 'brown',
      borderRadius: '50%',
    }} />
    {/* Face */}
    <div style={{
      position: 'absolute',
      top: '40px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50px',
      height: '40px',
      backgroundColor: 'beige',
      borderRadius: '40%',
    }} />
    {/* Eyes */}
    <div style={{
      position: 'absolute',
      top: '50px',
      left: '40px',
      width: '10px',
      height: '10px',
      backgroundColor: 'black',
      borderRadius: '50%',
    }} />
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '40px',
      width: '10px',
      height: '10px',
      backgroundColor: 'black',
      borderRadius: '50%',
    }} />
    {/* Nose */}
    <div style={{
      position: 'absolute',
      top: '65px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '15px',
      height: '10px',
      backgroundColor: 'black',
      borderRadius: '50%',
    }} />
    {/* Mouth */}
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '30px',
      height: '5px',
      backgroundColor: 'black',
      borderRadius: '10px',
    }} />
    {/* Arms */}
    <div style={{
      position: 'absolute',
      top: '100px',
      left: '-20px',
      width: '30px',
      height: '80px',
      backgroundColor: 'brown',
      borderRadius: '20px',
      transform: 'rotate(20deg)',
    }} />
    <div style={{
      position: 'absolute',
      top: '100px',
      right: '-20px',
      width: '30px',
      height: '80px',
      backgroundColor: 'brown',
      borderRadius: '20px',
      transform: 'rotate(-20deg)',
    }} />
    {/* Legs */}
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '10px',
      width: '30px',
      height: '60px',
      backgroundColor: 'brown',
      borderRadius: '20px',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '0',
      right: '10px',
      width: '30px',
      height: '60px',
      backgroundColor: 'brown',
      borderRadius: '20px',
    }} />
    {/* Tail */}
    <div style={{
      position: 'absolute',
      bottom: '50px',
      left: '-30px',
      width: '60px',
      height: '15px',
      backgroundColor: 'brown',
      borderRadius: '10px',
      transform: 'rotate(-30deg)',
    }} />
    {/* Stick */}
    <div style={{
      position: 'absolute',
      top: '-80px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '10px',
      height: '120px',
      backgroundColor: 'saddlebrown',
      borderRadius: '5px',
    }} />
  </div>
);

const DetailedHuman = ({ top, left }) => (
  <div style={{
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: '120px',
    height: '240px',
    animation: 'float 3s ease-in-out infinite',
  }}>
    {/* Body (Torso) */}
    <div style={{
      position: 'absolute',
      top: '60px',
      left: '30px',
      width: '60px',
      height: '100px',
      backgroundColor: '#808080', // Gray for armor
      borderRadius: '10px',
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
    }} />
    
    {/* Head */}
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '35px',
      width: '50px',
      height: '50px',
      backgroundColor: 'peachpuff',
      borderRadius: '50%',
    }} />
    
    {/* Helmet */}
    <div style={{
      position: 'absolute',
      top: '5px',
      left: '30px',
      width: '60px',
      height: '30px',
      backgroundColor: '#A9A9A9', // Dark gray for helmet
      borderRadius: '50% 50% 0 0',
    }} />
    
    {/* Arms */}
    <div style={{
      position: 'absolute',
      top: '70px',
      left: '10px',
      width: '20px',
      height: '80px',
      backgroundColor: '#808080', // Gray for armor
      borderRadius: '10px',
      transform: 'rotate(10deg)',
    }} />
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '10px',
      width: '20px',
      height: '80px',
      backgroundColor: '#808080', // Gray for armor
      borderRadius: '10px',
      transform: 'rotate(-10deg)',
    }} />
    
    {/* Legs */}
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '30px',
      width: '25px',
      height: '80px',
      backgroundColor: '#808080', // Gray for armor
      borderRadius: '10px',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '0',
      right: '30px',
      width: '25px',
      height: '80px',
      backgroundColor: '#808080', // Gray for armor
      borderRadius: '10px',
    }} />
    
    {/* Sword */}
    <div style={{
      position: 'absolute',
      top: '100px',
      right: '-40px',
      width: '80px',
      height: '10px',
      backgroundColor: 'silver',
      transform: 'rotate(-45deg)',
    }} />
    <div style={{
      position: 'absolute',
      top: '85px',
      right: '-25px',
      width: '20px',
      height: '20px',
      backgroundColor: 'gold',
      borderRadius: '50%',
      transform: 'rotate(-45deg)',
    }} />
  </div>
);

const Dog = ({ top }) => (
  <div style={{
    position: 'absolute',
    top: `${top}%`,
    left: '80%',
    width: '100px',
    height: '60px',
    animation: 'float 3s ease-in-out infinite 0.5s',
  }}>
    <div style={{
      position: 'absolute',
      bottom: '0',
      width: '100%',
      height: '40px',
      backgroundColor: 'black',
      borderRadius: '20px 20px 0 0',
    }} />
    <div style={{
      position: 'absolute',
      top: '0',
      left: '10px',
      width: '40px',
      height: '40px',
      backgroundColor: 'black',
      borderRadius: '50%',
    }} />
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '0',
      width: '20px',
      height: '10px',
      backgroundColor: 'black',
      borderRadius: '10px 0 0 10px',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '10px',
      width: '15px',
      height: '30px',
      backgroundColor: 'black',
      borderRadius: '10px',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '35px',
      width: '15px',
      height: '30px',
      backgroundColor: 'black',
      borderRadius: '10px',
    }} />
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '-20px',
      width: '40px',
      height: '10px',
      backgroundColor: 'black',
      borderRadius: '5px',
      transform: 'rotate(-10deg)',
    }} />
  </div>
);

const DetailedSoldier = ({ top, left }) => (
  <div style={{
    position: 'absolute',
    top: `${top}%`,
    left: `${left}%`,
    width: '60px',
    height: '120px',
    animation: 'float 3s ease-in-out infinite',
  }}>
    {/* Body (Torso) */}
    <div style={{
      position: 'absolute',
      top: '30px',
      left: '15px',
      width: '30px',
      height: '50px',
      backgroundColor: '#556B2F', // Dark olive green for armor
      borderRadius: '5px',
      boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
    }} />
    
    {/* Head */}
    <div style={{
      position: 'absolute',
      top: '5px',
      left: '17.5px',
      width: '25px',
      height: '25px',
      backgroundColor: 'peachpuff',
      borderRadius: '50%',
    }} />
    
    {/* Helmet */}
    <div style={{
      position: 'absolute',
      top: '2px',
      left: '15px',
      width: '30px',
      height: '15px',
      backgroundColor: '#3A5F0B', // Darker green for helmet
      borderRadius: '50% 50% 0 0',
    }} />
    
    {/* Arms */}
    <div style={{
      position: 'absolute',
      top: '35px',
      left: '5px',
      width: '10px',
      height: '40px',
      backgroundColor: '#556B2F', // Dark olive green for armor
      borderRadius: '5px',
      transform: 'rotate(10deg)',
    }} />
    <div style={{
      position: 'absolute',
      top: '35px',
      right: '5px',
      width: '10px',
      height: '40px',
      backgroundColor: '#556B2F', // Dark olive green for armor
      borderRadius: '5px',
      transform: 'rotate(-10deg)',
    }} />
    
    {/* Legs */}
    <div style={{
      position: 'absolute',
      bottom: '0',
      left: '15px',
      width: '12px',
      height: '40px',
      backgroundColor: '#556B2F', // Dark olive green for armor
      borderRadius: '5px',
    }} />
    <div style={{
      position: 'absolute',
      bottom: '0',
      right: '15px',
      width: '12px',
      height: '40px',
      backgroundColor: '#556B2F', // Dark olive green for armor
      borderRadius: '5px',
    }} />
    
    {/* Spear */}
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '-20px',
      width: '50px',
      height: '5px',
      backgroundColor: 'saddlebrown',
      transform: 'rotate(-45deg)',
    }} />
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '-30px',
      width: '0',
      height: '0',
      borderLeft: '10px solid transparent',
      borderRight: '10px solid transparent',
      borderBottom: '20px solid silver',
      transform: 'rotate(-45deg)',
    }} />
  </div>
);

const Ground = () => (
  <div style={{
    position: 'absolute',
    bottom: '0',
    width: '100%',
    height: '20%',
    backgroundColor: '#8B4513',
    borderTopLeftRadius: '50% 20%',
    borderTopRightRadius: '50% 20%',
  }} />
);

export default function EnhancedSkyArmyScene() {
  const [isDay, setIsDay] = useState(true);
  const skyColor = isDay ? '#87CEEB' : '#191970';

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDay(prevIsDay => !prevIsDay);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: skyColor,
        overflow: 'hidden',
        position: 'relative',
        transition: 'background-color 10s ease-in-out',
      }}
    >
      {/* 添加 logo 和 demo 图片 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
      }}>
        <img src={logo} alt="Logo" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
        {/* <img src={demo} alt="Demo" style={{ width: '50px', height: '50px' }} /> */}
      </div>

      <Sun isDay={isDay} />
      <Moon isDay={isDay} />
      <Cloud top={10} left={10} scale={1.5} />
      <Cloud top={15} left={30} scale={1.2} />
      <Cloud top={5} left={50} scale={1} />
      <Cloud top={20} left={70} scale={1.3} />
      <Mountain left={10} height={200} color="#4B0082" />
      <Mountain left={30} height={150} color="#8A2BE2" />
      <Mountain left={50} height={180} color="#9400D3" />
      <Mountain left={70} height={220} color="#4B0082" />
      <DetailedMonkey />
      <DetailedHuman top={20} left={60} />
      <Dog top={40} />
      {[...Array(10)].map((_, index) => (
        <DetailedSoldier 
          key={index} 
          top={20 + Math.random() * 20} 
          left={40 + Math.random() * 20} 
        />
      ))}
      <Ground />
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}