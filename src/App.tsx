import React, { useRef, useState } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import FileUpload from './pages/FileUpload/FileUpload';
import URLUpload from './pages/URLUpload/URLUpload';
import './App.css'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState({
    rgb: [0, 0, 0],
    x: 0,
    y: 0,
    imageWidth: 0,
    imageHeight: 0,
  })

  
  const uploadImageToCanvas = (file: File) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();
      reader.onload = function(file) {
        const img = new Image();
        img.onload = function() {
          let proportion = 1;
          if (canvas.parentElement) {
            proportion = canvas.parentElement.clientWidth / img.naturalWidth;
          }
          console.log(proportion)
          if (proportion < 1) {
            canvas.width = img.naturalWidth * proportion;
            canvas.height = img.naturalHeight * proportion;
          } else {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
          }
          ctx!!.drawImage(img, 0, 0, canvas.width, canvas.height);
          setState({...state, imageWidth: img.naturalWidth, imageHeight: img.naturalHeight})
        }
        if (file.target?.result) {
          img.src = file.target.result.toString();
        }
      }
      reader.readAsDataURL(file);  
    }
  }

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Загрузка по файлу',
      children: <FileUpload onSuccessUpload={ (file) => { uploadImageToCanvas(file) }}/>,
    },
    {
      key: '2',
      label: 'Загрузка по URL',
      children: <URLUpload onSuccessUpload={ (file) => { uploadImageToCanvas(file) }}/>,
    },
  ];

  const getPixelInfo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const canvasX = canvas.offsetLeft;
      const canvasY = canvas.offsetTop;
      // const canvasX = canvas.getBoundingClientRect().left;
      // const canvasY = canvas.getBoundingClientRect().top;
      const mouseX = (e.pageX - canvasX);
      const mouseY = (e.pageY - canvasY);
      const p = ctx!!.getImageData(mouseX, mouseY, 1, 1).data;
      setState({...state, rgb: [p[0], p[1], p[2]], x: mouseX, y: mouseY}) 
    }
  }

  return (
    <div className="container">
      <Tabs defaultActiveKey="1" items={ items } />
      <div className="img-view">
        <canvas onMouseMove={ getPixelInfo } className='canvas' ref={ canvasRef } />
      </div>
      <div className="img-info">
        <p>{ `RGB(${state.rgb})` }</p>
        <p>{ `X${state.x}` }</p>
        <p>{ `Y${state.y}` }</p>
        <p>{ `Width: ${state.imageWidth}` }</p>
        <p>{ `Height: ${state.imageHeight}` }</p>
        <div style={{ background: `rgb(${[...state.rgb]})` }} className='color' />
      </div>
    </div>
  )
}

export default App
