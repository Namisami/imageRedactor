import React, { useRef, useState } from 'react';
import { Tabs, Modal, Button, Slider } from 'antd';
import type { TabsProps, SliderSingleProps } from 'antd';
import FileUpload from './pages/FileUpload/FileUpload';
import URLUpload from './pages/URLUpload/URLUpload';
import './App.css'
import ChangeSizeModal from './components/ChangeSizeModal/ChangeSizeModal';

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
  const [modal, setModal] = useState<{
    show: boolean,
    title: string,
    content: React.ReactNode
  }>({
    show: false,
    title: '',
    content: null,
  });
  const [scale, setImageScale] = useState(100);

  const getCanvasNCtx = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      return [canvas, ctx]
    }
  }

  const changeImageScale = (scale: number) => {
    const [canvas, ctx] = getCanvasNCtx();

    const imgURL = window.localStorage.getItem('image');
    
    if (imgURL !== null) {
      const savedImg = new Image();
      savedImg.src = imgURL;
      
      const imageScaleMultiplier = scale / 100;
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
    canvas.width = img.naturalWidth | img.width;
    canvas.height = img.naturalHeight | img.height;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    window.localStorage.setItem('image', canvas.toDataURL("image/png"))
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const baseScale = Math.min(
      canvas.parentElement.clientWidth / (img.naturalWidth | img.width),
      canvas.parentElement.clientHeight / (img.naturalHeight | img.height)
      )

    canvas.width = canvas.width * baseScale;
    canvas.height = canvas.height * baseScale;

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

  const onSliderChange = (scale: number) => {
    setImageScale(scale);
    changeImageScale(scale);
  }

  function resizeImage(newWidth: number, newHeight: number) {
    const [canvas, ctx] = getCanvasNCtx();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // const newCanvas = document.createElement('canvas');
    // newCanvas.width = newWidth;
    // newCanvas.height = newHeight;
    // const newCtx = newCanvas.getContext('2d');

    const srcData = imageData.data;
    const srcWidth = imageData.width;
    const srcHeight = imageData.height;

    const destData = new Uint8ClampedArray(newWidth * newHeight * 4);

    const scaleX = srcWidth / newWidth;
    const scaleY = srcHeight / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);

        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;

        destData[destIndex] = srcData[srcIndex]; // Red channel
        destData[destIndex + 1] = srcData[srcIndex + 1]; // Green channel
        destData[destIndex + 2] = srcData[srcIndex + 2]; // Blue channel
        destData[destIndex + 3] = srcData[srcIndex + 3]; // Alpha channel
      }
    }
    const newImageData = new ImageData(destData, newWidth, newHeight);

    const baseScale = Math.min(
      canvas.parentElement.clientWidth / newWidth,
      canvas.parentElement.clientHeight / newHeight
      )

    canvas.width = newWidth;
    canvas.height = newHeight;

    setImageScale(Math.floor(baseScale * 100));
    ctx.putImageData(newImageData, 0, 0);


    // canvas.width = newWidth;
    // canvas.height = newHeight;
    
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.putImageData(newImageData, 0, 0) 
    // let newCanvas = document.createElement('canvas');
    // var newCtx = newCanvas.getContext('2d')!;
    // newCanvas.width = newImageData.width;
    // newCanvas.height = newImageData.height;
    // newCtx.putImageData(newImageData, 0, 0);
    // const image = new Image(newWidth, newHeight);
    // image.src = newCanvas.toDataURL("image/png");
    
    // const baseScale = Math.min(
    //   canvas.parentElement.clientWidth / newWidth,
    //   canvas.parentElement.clientHeight / newHeight
    //   )

    // canvas.width = newWidth * baseScale;
    // canvas.height = newHeight * baseScale;

    // setImageScale(Math.floor(baseScale * 100));
    // renderImage(image);
    // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // ctx.putImageData(newImageData, 0, 0);
    window.localStorage.setItem('image', canvas.toDataURL("image/png"))
    setTimeout(() => {
      changeImageScale(Math.floor(baseScale * 100))
    }, 0)
    
    // setState({...state, imageHeight: newHeight, imageWidth: newWidth})
    // console.log(Math.floor(baseScale * 100))
    // setImageScale(Math.floor(baseScale * 100));
    // changeImageScale();

    // renderImage(newImageData);
    // ctx.drawImage(newImageData, 0, 0, newWidth, newHeight);
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
          <Button className="change-size" type="primary" onClick={ () => setModal({
            ...modal,
            show: true,
            title: 'Изменение размера',
            content: (
              <ChangeSizeModal 
                width={ state.imageWidth } 
                height={ state.imageHeight } 
                onChangeSizeSubmit={ (width, height) => resizeImage(width, height) }
              />
            )
          }) }>
            Изменить размер
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
              value={ scale }
              onChange={ onSliderChange } 
            />
          </div>
        </div>
      </div>
      <Modal 
        title="Загрузка изображения" 
        open={ isModalOpen } 
        onCancel={ () => setIsModalOpen(false) }
        footer={[]}
      >
        <Tabs defaultActiveKey="1" items={ items } />
      </Modal>
      <Modal 
        title="Загрузка изображения" 
        open={ modal.show } 
        onCancel={ () => setModal({...modal, show: false}) }
        footer={[]}
      >
        { modal.content }
      </Modal>
    </div>
  )
}

export default App
