import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Modal, Button, Slider } from 'antd';
import type { TabsProps, SliderSingleProps } from 'antd';
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
  const [imageScale, setImageScale] = useState(100);
  
  useEffect(() => {
    changeImageScale();

    () => {
      window.localStorage.removeItem('image');
    }
  }, [imageScale])

  const getCanvasNCtx = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      return [canvas, ctx]
    }
  }

  const changeImageScale = () => {
    const [canvas, ctx] = getCanvasNCtx();

    const imgURL = window.localStorage.getItem('image');
    
    if (imgURL !== null) {
      const savedImg = new Image();
      savedImg.src = imgURL;

      const imageScaleMultiplier = imageScale / 100;
      const newImageWidth = savedImg.width * imageScaleMultiplier;
      const newImageHeight = savedImg.height * imageScaleMultiplier;
      
      canvas.width = newImageWidth;
      canvas.height = newImageHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(savedImg, 0, 0, newImageWidth, newImageHeight);
    }
  }

  const renderImage = (
    img: HTMLImageElement,
  ) => {
    const [canvas, ctx] = getCanvasNCtx();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сохранение исходного изображения
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    window.localStorage.setItem('image', canvas.toDataURL("image/png"))
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const baseScale = Math.min(
      canvas.parentElement.clientWidth / img.naturalWidth,
      canvas.parentElement.clientHeight / img.naturalHeight
    )

    setImageScale(Math.floor(baseScale * 100));
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  
  const uploadImageToCanvas = (file: File) => {
    const reader = new FileReader();
    reader.onload = function(file) {
      const img = new Image();
      img.onload = function() {
        renderImage(img);
        setIsModalOpen(false);
        setState({...state, imageWidth: img.naturalWidth, imageHeight: img.naturalHeight});
      }
      if (file.target?.result) {
        img.src = file.target.result.toString();
      }
    }
    reader.readAsDataURL(file);  
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
    const [canvas, ctx] = getCanvasNCtx();
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const p = ctx.getImageData(mouseX, mouseY, 1, 1).data;
    setState({...state, rgb: [p[0], p[1], p[2]], x: mouseX, y: mouseY}) 
  }

  const scaleMarks: SliderSingleProps['marks'] = {
    12: '12%',
    300: '300%',
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
            <p>{ `Width: ${state.imageWidth}` }</p>
            <p>{ `Height: ${state.imageHeight}` }</p>
            <div className="color-info">
              <div style={{ background: `rgb(${[...state.rgb]})` }} className='color' />
              <p>{ `RGB(${state.rgb})` }</p>
            </div>
            <p>{ `X${state.x}` }</p>
            <p>{ `Y${state.y}` }</p>
            <Slider 
              min={ 12 } 
              max={ 300 } 
              marks={ scaleMarks } 
              value={ imageScale }
              onChange={ (scale) => setImageScale(scale) } 
            />
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
