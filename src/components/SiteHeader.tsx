import * as React from 'react';
import {Button, Popup} from 'semantic-ui-react';

export interface IHeaderProps {
  onReselectFile: () => void;
}

const SiteHeader = (props: IHeaderProps) => {
  return (
    <div className={'flex flex-row items-center space-x-2'}>
      <div className={'m-0 text-3xl font-bold'}>Similarity Checker</div>
      <div className={'flex-1'}></div>
      <Popup inverted content={'Reselect file'} trigger={
        <Button circular icon={'redo'} onClick={() => props.onReselectFile()}></Button>
      } />

      <div>NYU Shanghai</div>
    </div>

  );
};

export default SiteHeader;
