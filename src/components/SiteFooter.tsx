import * as React from 'react';

export interface ISiteFooterProps {
}

const SiteFooter = (props: ISiteFooterProps) => {
  return (
    <div className={'text-right'}>
      <div className={'text-gray-500 text-sm'}>
        Note: All plagiarism levels and comments are stored locally on your browser.
      </div>
      <div className={'text-gray-500 text-sm'}>
        Contact: <a href={'mailto:juntongchen@nyu.edu'}>juntongchen@nyu.edu</a>
      </div>
    </div>
  );
};

export default SiteFooter;
