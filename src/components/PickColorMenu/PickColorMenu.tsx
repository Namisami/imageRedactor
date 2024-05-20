import { Divider } from 'antd';
import { PixelInfoI } from '../../App';
import { rgbToXyz, rgbToLab } from '../../utils/conversionColors';
import './PickColorMenu.css';

interface PickColorMenuProps {
  color1: PixelInfoI
  color2: PixelInfoI
}

const PickColorMenu = ({
  color1,
  color2,
}: PickColorMenuProps) => {
  return (
    <div className='pick-color-menu'>
      <div className="pick-color-info">
        <div style={{ background: `rgb(${[...color1.rgb]})` }} className='pick-color' />
        <div className="pick-colors">
          <p>{ `RGB(${color1.rgb})` }</p>
          <p>{ `XYZ(${rgbToXyz(color1.rgb)})` }</p>
          <p>{ `LAB(${rgbToLab(color1.rgb)})` }</p>
        </div>
      </div>
      <p>{ `X${color1.x}; Y${color1.y}` }</p>
      <Divider />
      <div className="pick-color-info">
        <div style={{ background: `rgb(${[...color2.rgb]})` }} className='pick-color' />
        <div className="pick-colors">
          <p>{ `RGB(${color2.rgb})` }</p>
          <p>{ `XYZ(${color2.rgb})` }</p>
          <p>{ `LAB(${color2.rgb})` }</p>
        </div>
      </div>
      <p>{ `X${color2.x}; Y${color2.y}` }</p>
    </div>
  )
};

export default PickColorMenu;
