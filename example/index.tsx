import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Grid } from '../.';
import { csv, json } from 'd3';
import exampleData from './data';

const App = () => {
  const [data, setData] = React.useState([]);
  const [dataUrl, setDataUrl] = React.useState('');

  const fetchData = async () => {
    if (dataUrl) {
      const fetchFunction = dataUrl.includes('.csv') ? csv : json;
      const res = await fetchFunction(dataUrl).catch(err => {
        console.log(`Issue loading data from ${dataUrl}`, err);
        setData([]);
      });

      console.log(res);
      // @ts-ignore
      setData(Array.isArray(res) ? res : []);
    } else {
      setData(exampleData);
    }
  };
  React.useEffect(() => {
    fetchData();
  }, [dataUrl]);
  console.log(data);

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-4 mb-2">
        <select
          className="p-4"
          value={dataUrl}
          onChange={e => setDataUrl(e.target.value)}
        >
          <option value="">Example dataset</option>
          {dataUrls.map(url => (
            <option value={url} key={url}>
              {url}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <Grid data={data} />
      </div>
    </div>
  );
};

const dataUrls = [
  'https://raw.githubusercontent.com/the-pudding/data/master/birth-control/everused.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/birth-control/sideEffects.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/boybands/bands.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/boybands/boys.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/campaign-colors/colors.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/cookies/choc_chip_cookie_ingredients.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/dog-shelters/allDogDescriptions.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/dearabby/raw_da_qs.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/hype/paths.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/births/allBirthData.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/names-in-songs/allNames.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/winning-the-internet/dump-2020-12-15.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/people-map/people-map.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/rain/annual_precipitation.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/pockets/measurements.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/filmordigital/top_movies_data.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/laugh/reddit-laughs.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/summer-reading/hipster.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/vogue/faces.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/one-hit-wonders/data.csv',
  'https://raw.githubusercontent.com/the-pudding/data/master/stand-up/ali-wong--topics.csv',
];

ReactDOM.render(<App />, document.getElementById('root'));
