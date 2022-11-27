import * as React from 'react';
import {Button, Icon} from 'semantic-ui-react';

export interface ISiteFooterProps {
}

const SiteFooter = (props: ISiteFooterProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);


  const dumpData = () => {
    const results = [];
    for (const [key, value] of Object.entries(localStorage)) {
      if (key.startsWith('CONCL_')) {
        results.push({key, value});
      }
    }
    const blob = new Blob([JSON.stringify(results)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sim-check-conclusions.json';
    a.click();
    a.remove();
  };

  const loadData = (data: string) => {
    const results = JSON.parse(data);
    if (confirm(`Are you sure you want to load ${results.length} conclusions? \n\nTo avoid conflicts, this will clear all existing conclusions.`)) {
      for (const [key, value] of Object.entries(localStorage)) {
        if (key.startsWith('CONCL_')) {
          localStorage.removeItem(key);
        }
      }
      for (const result of results) {
        localStorage.setItem(result.key, result.value);
      }
    }

    alert('Data loaded. Will refresh the page now.');
    window.location.reload();
  };

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
      reader.result && loadData(reader.result as string);
    };
    reader.onerror = (e) => {
      console.warn('Error reading file', e);
    };
  };
  return (
    <div className={'flex flex-row gap-2 items-center'}>
      <Button icon labelPosition={'left'} onClick={() => dumpData()} ><Icon name={'save'}/> Dump Data</Button>
      <Button icon labelPosition={'left'} onClick={() => inputRef.current?.click()}><Icon name={'upload'}/>Load Data</Button>
      <div className={'flex-1'} />
      <div className={'text-right'}>
        <div className={'text-gray-500 text-sm'}>
        Note: All plagiarism levels and comments are stored locally on your browser.
        </div>
        <div className={'text-gray-500 text-sm'}>
        Contact: <a href={'mailto:juntongchen@nyu.edu'}>juntongchen@nyu.edu</a>
        </div>
      </div>
      <input
        className={'hidden'}
        ref={inputRef}
        type={'file'}
        accept={'application/json'}
        multiple={false}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default SiteFooter;
