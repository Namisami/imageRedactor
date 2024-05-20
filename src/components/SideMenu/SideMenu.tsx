import { Slider } from 'antd';
import type { SliderSingleProps } from 'antd';
import { LoadedImageI, PixelInfoI } from '../../App';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as HandSvg } from '../../assets/hand.svg';
import { ReactComponent as PipetteSvg } from '../../assets/pipette.svg';
import './SideMenu.css';

export interface SideMenuProps {
  loadedImage: LoadedImageI
  pixelInfo: PixelInfoI
  scale: number
  currentTool: number
  onCurrentToolChange: (id: number) => void
  onSliderChange: (scale: number) => void
}

const scaleMarks: SliderSingleProps['marks'] = {
  12: '12%',
  300: '300%',
}

const SideMenu = ({
  loadedImage,
  pixelInfo,
  scale,
  currentTool,
  onCurrentToolChange,
  onSliderChange
}: SideMenuProps) => {
  return (
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
      <div className="tools">
        <IconButton
          active={ currentTool === 0 }
          component={ HandSvg }
          hint="Инструмент для передвижения картинки"
          onIconButtonClick={ () => onCurrentToolChange(0) }
        />
        <IconButton
          active={ currentTool === 1 }
          component={ PipetteSvg }
          hint="Пипетка для извлечения цвета из изображения"
          onIconButtonClick={ () => onCurrentToolChange(1) }
        />
      </div>
    </div>
  )
};

export default SideMenu;
