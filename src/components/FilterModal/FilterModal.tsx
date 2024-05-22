import { useEffect, useState } from 'react';
import { InputNumber, Button, Checkbox, Select } from 'antd';
import getCanvasNCtx from '../../utils/getCanvasNCtx';
import './FilterModal.css';

export interface FilterModalProps {
  imageRef: React.RefObject<HTMLCanvasElement>
  onFilterChange: (data: string) => void;
}

const FilterModal = ({
  imageRef,
  onFilterChange
}: FilterModalProps) => {
  const [filterValues, setFilterValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  
  useEffect(() => {
    const [canvas, ctx] = getCanvasNCtx(imageRef);
    onFilterOptionsChange('base');
  }, [])

  const filterOptions = [
    { value: 'base', label: 'Тождественное отображение' },
    { value: 'raise', label: 'Повышение резкости' },
    { value: 'gauss', label: 'Фильтр Гаусса' },
    { value: 'rect', label: 'Прямоугольное размытие' },
  ]

  const onFilterOptionsChange = (value: string) => {
    if (value === 'base') setFilterValues([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    if (value === 'raise') setFilterValues([0, -1, 0, -1, 5, -1, 0, -1, 0]);
    if (value === 'gauss') setFilterValues([1, 2, 1, 2, 4, 2, 1, 2, 1]);
    if (value === 'rect') setFilterValues([1, 1, 1, 1, 1, 1, 1, 1, 1]);
  }

  const onFilterInputChange = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setFilterValues([...filterValues.slice(0, index), value, ...filterValues.slice(index + 1)])
  }

  return (
    <div className='filter-modal'>
      <Select
        className='filter-options'
        defaultValue='base'
        onChange={ (value) => onFilterOptionsChange(value) }
        options={ filterOptions } 
      />
      <div className="filter-inputs">
        <InputNumber 
          value={ filterValues[0] }
          onPressEnter={ (e) => onFilterInputChange(e, 0) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[1] }
          onPressEnter={ (e) => onFilterInputChange(e, 1) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[2] }
          onPressEnter={ (e) => onFilterInputChange(e, 2) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[3] }
          onPressEnter={ (e) => onFilterInputChange(e, 3) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[4] }
          onPressEnter={ (e) => onFilterInputChange(e, 4) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[5] }
          onPressEnter={ (e) => onFilterInputChange(e, 5) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[6] }
          onPressEnter={ (e) => onFilterInputChange(e, 6) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[7] }
          onPressEnter={ (e) => onFilterInputChange(e, 7) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[8] }
          onPressEnter={ (e) => onFilterInputChange(e, 8) }
          className='filter-input'
        />
      </div>
      <div className="filter-btns">
        <Button type='primary'>Изменить</Button>
        <Checkbox>Предпросмотр</Checkbox>
        <Button>Сбросить</Button>
      </div>
    </div>
  )
};

export default FilterModal;
