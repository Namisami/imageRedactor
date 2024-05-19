import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Modal, Button, Slider } from 'antd';
import type { TabsProps, SliderSingleProps } from 'antd';
import FileUpload from './pages/FileUpload/FileUpload';
import URLUpload from './pages/URLUpload/URLUpload';
import './App.css'
import ChangeSizeModal from './components/ChangeSizeModal/ChangeSizeModal';
import tabsItemsOnFunc from './utils/tabsItemsOnFunc';
import getNewDataNearestNeighbour from './utils/getNewDataNearestNeighbour';

interface LoadedImageI {
  imageUri: string,
  imageOriginalWidth: number,
  imageOriginalHeight: number,
}

interface ModalI {
  show: boolean,
  title: string,
  content: React.ReactNode
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImage, setLoadedImage] = useState<LoadedImageI>({
    imageUri: '',
    imageOriginalWidth: 0,
    imageOriginalHeight: 0
  })
  const [scale, setImageScale] = useState(100);
  const [pixelInfo, setPixelInfo] = useState({
    rgb: [0, 0, 0],
    x: 0,
    y: 0,
  })
  const [modal, setModal] = useState<ModalI>({
    show: false,
    title: '',
    content: null,
  });

  const getCanvasNCtx = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', {
      willReadFrequently: true
    })!;
    return [canvas, ctx]
  }

  useEffect(() => {
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      renderImageFull(img);
      setLoadedImage({
        ...loadedImage,
        imageOriginalWidth: img.naturalWidth, 
        imageOriginalHeight: img.naturalHeight}
      );
    })
  }, [loadedImage.imageUri])

  useEffect(() => {
    changeImageScale(scale);
  }, [scale])

  const imageUriToImgPromise = (uri: string): Promise<HTMLImageElement> => {
    return new Promise(function (resolve, _) {
      const img = new Image()
      img.src = uri;
      img.onload = () => {
        resolve(img);
      };
    });
  };

  const renderImage = () => {
    const [canvas, ctx] = getCanvasNCtx();
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });
  }

  const renderImageFull = (img: HTMLImageElement) => {
    const [canvas, _] = getCanvasNCtx();
    
    const maxWidth = canvas.parentElement!.clientWidth;
    const maxHeight = canvas.parentElement!.clientHeight;

    const scale = Math.min(
      maxWidth / img.width,
      maxHeight / img.height
    );

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    setImageScale(Math.floor(scale * 100));
    renderImage();
  }

  const changeImageScale = (scale: number) => {
    const [canvas, _] = getCanvasNCtx();
    
    const scaleMultiplyer = scale / 100; 

    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      canvas.width = img.width * scaleMultiplyer;
      canvas.height = img.height * scaleMultiplyer;
      renderImage();
    })
  }

  const uploadImageToCanvas = (file: File) => {
    setLoadedImage({
      ...loadedImage,
      imageUri: URL.createObjectURL(file),
    })
  }

  const getPixelInfo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [_, ctx] = getCanvasNCtx();
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const p = ctx.getImageData(mouseX, mouseY, 1, 1).data;
    setPixelInfo({
      ...pixelInfo, 
      rgb: [p[0], p[1], p[2]], 
      x: mouseX, 
      y: mouseY 
    }) 
  }

  const onSliderChange = (scale: number) => {
    setImageScale(scale);
  }

  const resizeImage =(newWidth: number, newHeight: number) => {
    const [canvas, ctx] = getCanvasNCtx();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newData = getNewDataNearestNeighbour(imageData, newWidth, newHeight);
    setLoadedImage({...loadedImage, imageUri: newData})
  };

  const downloadImage = () => {
    const [canvas, _] = getCanvasNCtx();
    changeImageScale(100);
    const image = canvas.toDataURL();
    const aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'canvas_image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
  };

  const openModal = (
    title: string,
    content: React.ReactNode
  ) => {
    return setModal({
      ...modal,
      show: true,
      title: title,
      content: content
    })
  }

  const scaleMarks: SliderSingleProps['marks'] = {
    12: '12%',
    300: '300%',
  }

  return (
    <div className="container">
      <div className="app">
        <div className="menu-panel">
          <Button className="upload" type="primary" onClick={ () => openModal(
            "Загрузить изображение",
            <Tabs defaultActiveKey="1" items={ tabsItemsOnFunc(uploadImageToCanvas) } />
          )}>
            Загрузить изображение
          </Button>
          <Button className="change-size" type="primary" onClick={ () => openModal(
            "Изменение размера",
            <ChangeSizeModal 
              width={ loadedImage.imageOriginalWidth } 
              height={ loadedImage.imageOriginalHeight } 
              onChangeSizeSubmit={ (width, height) => resizeImage(width, height) }
            />
          )}>
            Изменить размер
          </Button>
          <Button className="download" type="primary" onClick={ downloadImage }>
            Сохранить
          </Button>
        </div>
        <div className="work-panel">
          <div className="img-view">
            <canvas onMouseMove={ getPixelInfo } className='canvas' ref={ canvasRef } />
          </div>
          <div className="img-info">
            <p>{ `Width: ${loadedImage.imageOriginalWidth}` }</p>
            <p>{ `Height: ${loadedImage.imageOriginalHeight}` }</p>
            <div className="color-info">
              <div style={{ background: `rgb(${[...pixelInfo.rgb]})` }} className='color' />
              <p>{ `RGB(${pixelInfo.rgb})` }</p>
            </div>
            <p>{ `X${pixelInfo.x}` }</p>
            <p>{ `Y${pixelInfo.y}` }</p>
            <Slider 
              min={ 12 } 
              max={ 300 }
              marks={ scaleMarks }
              defaultValue={ 12 } 
              value={ scale }
              onChange={ onSliderChange } 
            />
          </div>
        </div>
      </div>
      <Modal 
        title={ modal.title } 
        open={ modal.show } 
        onCancel={ () => setModal({...modal, show: false}) }
        onOk={ () => setModal({...modal, show: false}) }
        footer={[]}
      >
        { modal.content }
      </Modal>
    </div>
  )
}

export default App
