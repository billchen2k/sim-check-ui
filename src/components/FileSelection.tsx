import * as React from 'react';
import {ISimResultItem} from '../types/types';
import {Button, Header, Icon, Segment} from 'semantic-ui-react';
import {SimManager} from '../lib/SimManager';

export interface IFileSelectionProps {
  onLoaded?: (details: ISimResultItem[]) => any;
  manager: SimManager;
}

const FileSelection = (props: IFileSelectionProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [errMsg, setErrMsg] = React.useState<string>('');

  const handleFileChange = (event: any) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    console.log('fileObj is', fileObj);
    event.target.value = null;
    console.log(event.target.files);
    console.log(fileObj);

    const reader = new FileReader();
    reader.readAsText(fileObj);
    reader.onload = (e) => {
      try {
        props.manager.loadSimResultsFromJson(reader.result as string);
      } catch (e: any) {
        setErrMsg(e.message);
        console.error(e);
      }
      props.manager.loaded && props.onLoaded && props.onLoaded(props.manager.simResults);
    };
    reader.onerror = (e) => {
      console.warn('Error reading file', e);
    };
  };
  return (
    <div>
      <Segment placeholder>
        <Header icon>
          <Icon name={'file alternate outline'} className={'outline-0'}/>
          <div>Please select a similarity report json file to start checking.</div>
        </Header>
        <Button primary onClick={() => inputRef.current?.click()}>
          Select File
        </Button>
        {errMsg &&
            <div className={'mt-1 text-center text-red-500'}>{errMsg}</div>
        }
        <input
          className={'hidden'}
          ref={inputRef}
          type={'file'}
          accept={'application/json'}
          multiple={false}
          onChange={handleFileChange}
        />
      </Segment>
    </div>
  );
};

export default FileSelection;
