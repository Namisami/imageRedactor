import { useEffect, useRef, useState } from 'react';
import { InputNumber, Button } from 'antd';
import getCanvasNCtx from '../../utils/getCanvasNCtx';
import './CurvesModal.css';

export interface CurvesModalProps {
  imageRef: React.RefObject<HTMLCanvasElement>
}

interface ColorRowsI {
  r: Map<number, number>;
  g: Map<number, number>;
  b: Map<number, number>;
}

const CurvesModal = ({
  imageRef: imageRef,
}: CurvesModalProps) => {
  const histRef = useRef<HTMLCanvasElement>(null);
  const [colorRows, setColorRows] = useState<ColorRowsI>();
  const [curvePoints, setCurvePoints] = useState({
    "enter": {
      "in": 0,
      "out": 0,
    },
    "exit": {
      "in": 255,
      "out": 255,
    },
  })

  useEffect(() => {
    const colorsHistData = getColorsHistData();
    buildColorRows(colorsHistData);
  }, []);

  useEffect(() => {
    const [canvas, ctx] = getCanvasNCtx(histRef);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colorsHistData = getColorsHistData();
    buildColorRows(colorsHistData);
    
    ctx.beginPath();
    ctx.moveTo(0, 255 - curvePoints.enter.out);
    ctx.lineTo(curvePoints.enter.in, 255 - curvePoints.enter.out);
    ctx.arc(curvePoints.enter.in, 255 - curvePoints.enter.out, 5, 0, 2 * Math.PI);
    ctx.lineTo(curvePoints.exit.in, 255 - curvePoints.exit.out);
    ctx.arc(curvePoints.exit.in, 255 - curvePoints.exit.out, 5, 0, 2 * Math.PI);
    ctx.lineTo(255, 255 - curvePoints.exit.out);

    ctx.lineWidth = 1;
    ctx.stroke();
  }, [curvePoints])

  const getColorsHistData = () => {
    const [canvas, ctx] = getCanvasNCtx(imageRef);
    const canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const srcData = canvasImageData.data
        
    const colorsHistData: ColorRowsI = {
      "r": new Map(),
      "g": new Map(),
      "b": new Map(),
    };
    for (let i = 0; i < srcData.length; i += 4) {
      if (colorsHistData["r"].has(srcData[i])) {
        colorsHistData["r"].set(srcData[i], colorsHistData["r"].get(srcData[i])! + 1);
      } else {
        colorsHistData["r"].set(srcData[i], 0); 
      }
      if (colorsHistData["g"].has(srcData[i + 1])) {
        colorsHistData["g"].set(srcData[i + 1], colorsHistData["g"].get(srcData[i + 1])! + 1);
      } else {
        colorsHistData["g"].set(srcData[i + 1], 0); 
      }
      if (colorsHistData["b"].has(srcData[i + 2])) {
        colorsHistData["b"].set(srcData[i + 2], colorsHistData["b"].get(srcData[i + 2])! + 1);
      } else {
        colorsHistData["b"].set(srcData[i + 2], 0); 
      }
    }
    return colorsHistData;
  }

  const buildRGBColorRows = (data: ColorRowsI, color: "r" | "g" | "b") => {
    const [canvas, ctx] = getCanvasNCtx(histRef);
    const maxVal = Math.max(...data["r"].values(), ...data["g"].values(), ...data["b"].values());
    if (color === "r") {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.65)';
    } else if (color === "g") {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.65)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 255, 0.65)';
    }
    for (let i of [...data[color].keys()].sort()) {

      const h = Math.floor(data[color].get(i)! * 256 / maxVal);
      ctx.fillRect(i, canvas.height, 1, -h);
    }
  };

  const buildColorRows = (data: ColorRowsI) => {
    const [canvas, ctx] = getCanvasNCtx(histRef);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    buildRGBColorRows(data, "r");
    buildRGBColorRows(data, "g");
    buildRGBColorRows(data, "b");
  };

  const changeCurvePoints = (
    e: React.KeyboardEvent<HTMLInputElement>, 
    point: "enter" | "exit", 
    pointParam: "in" | "out"
  ) => {
    setCurvePoints({
      ...curvePoints, 
      [point]: {
        ...curvePoints[point], 
        [pointParam]: parseInt((e.target as HTMLInputElement).value)
      }
    })
  }

  return (
    <div className='curves-modal'>
      <canvas
        ref={ histRef }
        className='hist-canvas' 
        width={ 256 } 
        height={ 256 }
      />
      <div className="curves-inputs">
        <div className="curves-input">
          <p className='curves-input-label'>In</p>
          <InputNumber
              min={ 0 }
              max={ 255 }
              value={ curvePoints.enter.in }
              onPressEnter={ (e) => changeCurvePoints(e, "enter", "in") }
              placeholder='In'
          />
          <p className='curves-input-label'>Out</p>
          <InputNumber
              min={ 0 }
              max={ 255 }
              value={ curvePoints.enter.out }
              onPressEnter={ (e) => changeCurvePoints(e, "enter", "out") }
              placeholder='Out'
          />
        </div>
        <div className="curves-input">
          <p className='curves-input-label'>In</p>
          <InputNumber
              min={ 0 }
              max={ 255 }
              value={ curvePoints.exit.in }
              onPressEnter={ (e) => changeCurvePoints(e, "exit", "in") }
              placeholder='In'
          />
          <p className='curves-input-label'>Out</p>
          <InputNumber
              min={ 0 }
              max={ 255 }
              value={ curvePoints.exit.out }
              onPressEnter={ (e) => changeCurvePoints(e, "exit", "out") }
              placeholder='Out'
          />
        </div>
      </div>
    </div>
  )
};

export default CurvesModal;
