import * as React from 'react';
import {hot} from 'react-hot-loader/root';
import SiteHeader from './components/SiteHeader';
import {Button} from 'semantic-ui-react';
import FileSelection from './components/FileSelection';
import SimCheck from './components/SimCheck';
import {SimManager} from './lib/SimManager';
import {ISimResultItem} from './types/types';
import SiteFooter from './components/SiteFooter';


export interface IAppProps {
}

const App = (props: IAppProps) => {
  const manager = React.useRef<SimManager>(new SimManager());
  const [loaded, setLoaded] = React.useState<boolean>(false);

  // React.useEffect(() => {
  //   setLoaded(manager.current.loaded);
  // }, [manager.current.loaded]);

  return (
    <div className={'p-3 flex flex-col space-y-2 mx-auto'}>
      <SiteHeader onReselectFile={() => {
        manager.current.reselect();
        setLoaded(false);
      }}/>
      {!loaded &&
        <FileSelection manager={manager.current}
          onLoaded={(results: ISimResultItem[]) => {
            setLoaded(manager.current.loaded);
          }}/>
      }
      {loaded &&
        <SimCheck manager={manager.current}/>
      }
      <SiteFooter />

    </div>
  );
};

export default hot(App);
