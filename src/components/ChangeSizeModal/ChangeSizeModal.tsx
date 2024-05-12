import { Select, InputNumber, Space, Checkbox, Flex, Button } from 'antd';
import './ChangeSizeModal.css';
import { useEffect, useState } from 'react';

export interface ChangeSizeModalProps {
  width: number,
  height: number,
  onChangeSizeSubmit: (width: number, height: number) => void;
}

const ChangeSizeModal = ({ 
  width, 
  height,
  onChangeSizeSubmit,
}: ChangeSizeModalProps) => {
  const [measure, setMeasure] = useState({
    type: 'pixels',
    proportionFix: false,
    width: width,
    height: height
  });
  const [algorithm, setAlgorithm] = useState('closestNeighbour');

  useEffect(() => {
    setMeasure({...measure, width: width, height: height});
  }, [width, height])

  const onHeightChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      const proportion = value / measure.height;
      return setMeasure({...measure, height: value, width: Math.round(measure.width * proportion) || 1 });
    }
    return setMeasure({...measure, height: value})
  }

  const onWidthChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      let proportion = value / measure.width;
      return setMeasure({...measure, width: value, height: Math.round(measure.height * proportion) || 1 });
    }
    return setMeasure({...measure, width: value})
  }

  return (
    <Flex vertical gap="large">
      <Flex gap='middle' align='end'>
        <Space direction='vertical'>
          <Space>
            Высота
            <InputNumber 
              placeholder='height' 
              min={ 1 }
              maxLength={ 4 }
              value={ measure.height }
              onChange={ onHeightChange } 
            />
          </Space>
          <Space>
            <Checkbox 
              onClick={ () => setMeasure({...measure, proportionFix: !measure.proportionFix}) }
            >
              Сохранять пропорции
            </Checkbox>
          </Space>
          <Space>
            Ширина
            <InputNumber 
              placeholder='width' 
              min={ 1 }
              maxLength={ 4 }
              value={ measure.width } 
              onChange={ onWidthChange }
            />
          </Space>
        </Space>
        <Select
          defaultValue="pixels"
          onChange={ (value) => setMeasure({...measure, type: value}) }
          options={[
            { value: 'pixels', label: 'px' },
            { value: 'percentage', label: '%' },
          ]}
        />
      </Flex>
      <Space>
        Алгоритм интерполяции
        <Select 
          defaultValue="closestNeighbour"
          onChange={ (value) => setAlgorithm(value) }
          options={[
            { value: 'closestNeighbour', label: 'Ближайший сосед'},
            { value: 'bilinear', label: 'Билинейный'},
            { value: 'bicubic', label: 'Бикубический'},
          ]}
        />
      </Space>
      <Space>
        <Button type='primary' onClick={ () => onChangeSizeSubmit(measure.width, measure.height) }>
          Изменить
        </Button>
      </Space>
    </Flex>
  )
}

export default ChangeSizeModal;
