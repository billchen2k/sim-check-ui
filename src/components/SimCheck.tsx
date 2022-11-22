import * as React from 'react';
import {ISimResultItem, SimilarityLevel} from '../types/types';
import {SimManager} from '../lib/SimManager';
import {
  Radio,
  Form,
  Input,
  Button,
  Accordion,
  Icon,
  Divider,
  Progress,
  SemanticCOLORS,
  Label,
  ButtonGroup, TextArea,
} from 'semantic-ui-react';
import * as _ from 'lodash';
import {ChangeEvent} from 'react';

export interface ISimCheckProps {
  manager: SimManager;
}

export type SortingCriteria = 'similarity' | 'total_nodes' | 'plagiarism_nodes' | 'name' | 'conclusion';
export type SortingOrder = 'asc' | 'desc';


const sortingCriteriaOptions = [
  {key: 'similarity', text: 'Similarity', value: 'similarity'},
  {key: 'total_nodes', text: 'Total Nodes', value: 'total_nodes'},
  {key: 'plagiarism_nodes', text: 'Plagiarism Nodes', value: 'plagiarism_nodes'},
  {key: 'name', text: 'Name', value: 'name'},
  {key: 'conclusion.level', text: 'Conclusion', value: 'conclusion'},
];

const SimCheck = (props: ISimCheckProps) => {
  const [sortBy, setSortBy] = React.useState<SortingCriteria>('similarity');
  const [sortOrder, setSortOrder] = React.useState<string>('desc');
  const [searchText, setSearchText] = React.useState<string>('');
  const [displaySearchText, setDisplaySearchText] = React.useState<string>('');
  const [activeHash, setActiveHash] = React.useState<number>(-1);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const [simResults, setSimResults] = React.useState<ISimResultItem[]>(props.manager.simResults);
  const [itemsPerPage, setItemsPerPage] = React.useState<number>(50);
  const [currentPage, setCurrentPage] = React.useState<number>(0);

  const simLevelConfig: { [key in SimilarityLevel]: { color: SemanticCOLORS, text: string } } = {
    'plagiarism': {color: 'red', text: 'Plagiarism'},
    'suspicious': {color: 'orange', text: 'Suspicious'},
    'original': {color: 'green', text: 'Original'},
    'unknown': {color: 'grey', text: 'Unknown'},
  };

  const debouncedUpdateSearchText = _.debounce((value) => {
    setSearchText(value);
  }, 500);

  const handleUpdateSearchText = (event: any) => {
    setDisplaySearchText(event.target.value);
    debouncedUpdateSearchText(event.target.value);
  };

  const renderCode = (code: string) => {
    const elements = code.replace(/\ /g, '<span class="text-gray-300">·</span>')
        .replace(/\n/g, '<span class="text-gray-300">↲</span>\n')
        .split('\n')
        .map((line, idx) => {
          return <div className={'flex flex-row items-center'}>
            <div className={'text-gray-400 text-sm mr-6'} >{idx}</div>
            <div key={idx} style={{fontFamily: 'monospace'}} className={'flex flex-wrapflex-1'} dangerouslySetInnerHTML={{__html: line}}></div>
          </div>;
        });
    return elements;
  };

  const getBarColor = (similarity: number): SemanticCOLORS => {
    const colorMap: {
      color: SemanticCOLORS;
      range: number[];
    }[] = [
      {color: 'green', range: [0, 0.7]},
      {color: 'olive', range: [0.7, 0.8]},
      {color: 'yellow', range: [0.8, 0.9]},
      {color: 'orange', range: [0.9, 0.99]},
      {color: 'red', range: [0.99, 1]},
    ];
    for (const item of colorMap) {
      if (similarity > item.range[0] && similarity <= item.range[1]) {
        return item.color;
      }
    }
    return 'green';
  };

  const makeConclusionForItem = (hash: number, level?: SimilarityLevel, comments?: string) => {
    props.manager.setConclusion(String(hash), level, comments);
    setSimResults([...props.manager.simResults]);
  };

  const handleResetAll = () =>{
    if (confirm('Are you sure to reset all conclusions? If conformed, all the levels you marked and comments you made will be lost. \n\nThis will only affect code pairs in current report.')) {
      props.manager.resetAll();
      setSimResults([...props.manager.simResults]);
    }
  };

  const activeAdjacent = (offset: number) => {
    setActiveIndex(activeIndex + offset);
    const targetHashIndex = currentPage * itemsPerPage + activeIndex + offset;
    if (targetHashIndex >= 0 && targetHashIndex < simResults.length) {
      setActiveHash(renderingSimResults[targetHashIndex].hash);
    }
  };

  const handleExport = () => {
    props.manager.exportResults();
  };

  const renderingSimResults = simResults
      .filter((item) => {
        const filterStr = item.source + item.target + item.conclusion?.level + item.conclusion?.comments + item.total_nodes + ' ' + item.plagiarism_nodes;
        return filterStr.toLowerCase().includes(searchText.toLowerCase());
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy == 'conclusion') {
          const levelToNum: {[key in SimilarityLevel]: number} = {
            'plagiarism': 3,
            'suspicious': 2,
            'original': 1,
            'unknown': 0,
          };
          cmp = levelToNum[a.conclusion?.level || 'unknown'] - levelToNum[b.conclusion?.level || 'unknown'];
        } else if (sortBy == 'name') {
          cmp = a.source > b.source ? 1 : -1;
        } else {
          const levelToNum: {[key in SimilarityLevel]: number} = {
            'plagiarism': 3,
            'suspicious': 2,
            'original': 1,
            'unknown': 0,
          };
          cmp = levelToNum[a.conclusion?.level || 'unknown'] - levelToNum[b.conclusion?.level || 'unknown'];
          const key = sortingCriteriaOptions.find((one) => one.value == sortBy)?.key;
          // @ts-ignore
          cmp = a[key] - b[key];
        }
        return sortOrder == 'desc' ? -cmp : cmp;
      });

  const totalPages = Math.ceil(renderingSimResults.length / itemsPerPage);

  const Pager = () =>
    <Input labelPosition={'right'} type={'text'} placeholder={'Page...'} action>
      <Button.Group className={'pr-2'}>
        <Button icon={'angle left'} onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 0}></Button>
        <Button icon={'angle right'} onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}></Button>
      </Button.Group>
      <input className={'w-16'} value={currentPage + 1} onChange={(e) => {
        setCurrentPage((parseInt(e.target.value) || 0) - 1);
      }}/>
      <Label>/ {totalPages} Pages</Label>
    </Input>;


  return (
    <div>
      <div className={'flex flex-row space-x-3 items-center'}>
        <div className={'font-light text-xl'}>Total number of reports: {renderingSimResults.length}</div>
        <div className={'font-light text-xl'}>Plagiarism pairs: {simResults.filter((one) => one.conclusion?.level == 'plagiarism').length}</div>
        <div className={'flex-1'}/>
        <Form>
          <Form.Group inline className={'m-0'}>
            <label>Sort by:</label>
            {sortingCriteriaOptions.map((option) => {
              return (
                <Form.Field key={option.key}>
                  <Radio
                    label={option.text}
                    name='radioGroup'
                    value={option.value}
                    checked={sortBy === option.value}
                    onChange={(e, {value}) => {
                      setSortBy(value as SortingCriteria);
                    }}/>
                </Form.Field>);
            })}
            <Button size={'small'} basic circular={true} icon={sortOrder === 'desc' ? 'sort amount down': 'sort amount up'} onClick={() => {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            }}/>
          </Form.Group>
        </Form>
      </div>
      <div className={'flex flex-row gap-2'}>
        <Button labelPosition={'left'} icon color={'orange'} onClick={() => handleResetAll()}><Icon name={'redo'}/>Reset All</Button>
        <Button labelPosition={'left'} icon color={'blue'} onClick={() => handleExport()}><Icon name={'download'}/>Export</Button>
        <div className={'flex-1'} />
        <Pager />
        <Input icon={'search'} placeholder={'Search...'} value={displaySearchText}
          onChange={handleUpdateSearchText}/>
      </div>
      <div className={'mt-3'}>
        <Accordion fluid styled>
          {
            renderingSimResults.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage + 1))
                .map((item, idx) => {
                  // @ts-ignore
                  return <React.Fragment key={idx}>
                    <Accordion.Title
                      index={idx}
                      active={activeHash == item.hash}
                      onClick={(e, {index}) => {
                        if (activeHash == item.hash) {
                          setActiveHash(-1);
                          setActiveIndex(-1);
                        } else {
                          setActiveHash(item.hash);
                          setActiveIndex(idx);
                        }
                      }}
                    >
                      <div className={'flex flex-row gap-1 items-center'}>
                        <Icon name={'dropdown'}/>
                        {item.source}
                        <Icon name={'arrows alternate horizontal'} disabled/>
                        {item.target}
                        <div className={'flex-1'} />
                        <div>Plagiarism / Total Nodes: {item.plagiarism_nodes} / {item.total_nodes}</div>
                        <div className={'w-48 ml-4'}>
                          <Progress percent={(item.plagiarism_nodes / item.total_nodes * 100).toFixed(4)}
                            precision={2}
                            color={getBarColor(item.similarity)}
                            progress/>
                        </div>
                        <div className={'w-30 ml-4'}>
                          <Button size={'mini'} color={simLevelConfig[item.conclusion?.level || 'unknown'].color} fluid>
                            {simLevelConfig[item.conclusion?.level || 'unknown'].text}
                          </Button>
                        </div>
                      </div>

                    </Accordion.Title>
                    <Accordion.Content active={activeHash == item.hash}>
                      <div className={'flex flex-row space-x-12 fluid'}>
                        <div className={'w-5/12'}>
                          <div className={'text font-bold mb-2'}>{item.source_submitter}: </div>
                          <Divider/>
                          {renderCode(item.source_content)}
                        </div>
                        <div className={'w-5/12'}>
                          <div className={'text font-bold mb-2'}>{item.target_submitter}: </div>
                          <Divider/>
                          {renderCode(item.target_content)}
                        </div>
                        <div className={'w-2/12'}>

                          <Form>
                            <Button.Group vertical fluid>
                              {
                                Object.keys(simLevelConfig).map((key) => {
                                  const level = key as SimilarityLevel;
                                  return (<Button key={key} basic={(item.conclusion?.level || 'unknown') !== level}
                                    onClick={() => {
                                      makeConclusionForItem(item.hash, level);
                                      activeAdjacent(1);
                                    }}
                                    color={simLevelConfig[level].color}>
                                    {simLevelConfig[level].text}
                                  </Button>);
                                })
                              }
                            </Button.Group>
                            <Form.TextArea className={'pt-4'} label={'Comments'} placeholder={'Comments (Auto save)...'}
                              value={item.conclusion?.comments || ''}
                              onChange={(e) => makeConclusionForItem(item.hash, item.conclusion?.level || 'unknown', e.target.value)}
                            />

                          </Form>
                        </div>
                      </div>
                    </Accordion.Content>
                  </React.Fragment>;
                })
          }
        </Accordion>
        <div className={'float-right mt-4'}>
          <Pager />
        </div>
      </div>
    </div>
  );
};

export default SimCheck;
