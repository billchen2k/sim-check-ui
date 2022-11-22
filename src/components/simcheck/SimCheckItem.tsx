import * as React from 'react';
import {ISimResultItem} from '../../types/types';
import {SimManager} from '../../lib/SimManager';

export interface ISimCheckItemProps {
  result: ISimResultItem;
  manager: SimManager;
}

const SimCheckItem = (props: ISimCheckItemProps) => {
  return (
    <div>

    </div>
  );
};

export default SimCheckItem;
