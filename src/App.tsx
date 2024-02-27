import React, { useRef, useState } from 'react';
import { Tabs, Modal, Button } from 'antd';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  
  const uploadImageToCanvas = (file: File) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();
      reader.onload = function(file) {
        const img = new Image();
        img.onload = function() {
          // let proportion = 1;
          // if (canvas.parentElement) {
          //   proportion = canvas.parentElement.clientWidth / img.naturalWidth;
          // }
          // if (proportion < 1) {
          //   canvas.width = img.naturalWidth * proportion;
          //   canvas.height = img.naturalHeight * proportion;
          // } else {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
          // }
          ctx!!.drawImage(img, 0, 0, canvas.width, canvas.height);
          setIsModalOpen(false);
          setState({...state, imageWidth: img.naturalWidth, imageHeight: img.naturalHeight});
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
    console.log(e)
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      // const canvasX = canvas.offsetLeft;
      // const canvasY = canvas.offsetTop;
      // const mouseX = (e.pageX - canvasX);
      // const mouseY = (e.pageY - canvasY);
      const mouseX = e.nativeEvent.offsetX;
      const mouseY = e.nativeEvent.offsetY;
      const p = ctx!!.getImageData(mouseX, mouseY, 1, 1).data;
      setState({...state, rgb: [p[0], p[1], p[2]], x: mouseX, y: mouseY}) 
    }
  }

  return (
    <div className="container">
      <div className="app">
        <div className="menu-panel">
          <Button className="upload" type="primary" onClick={ () => setIsModalOpen(true) }>
            Загрузить изображение
          </Button>
        </div>
        <div className="work-panel">
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
      </div>
      <Modal 
        title="Загрузка изображения" 
        open={isModalOpen} 
        onCancel={ () => setIsModalOpen(false) }
        footer={[]}
      >
        <Tabs defaultActiveKey="1" items={ items } />
      </Modal>
    </div>
  )
}

export default App
