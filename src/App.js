import React, { Component } from 'react';
import './App.css';
import { sortBy } from 'lodash';
const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey:'',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false
      };
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }
  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updatedHits, page },
        isLoading: false,
}
  });
  }
  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(e => this.setState({ error: e }));
  }
  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const updatedHits = hits.filter(item=> item.objectID !== id);
    this.setState({ 
      results:  { 
        ...results,
        [searchKey]: { hits: updatedHits, page }
     }});
  }
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }
  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
}
    event.preventDefault();
  }
  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }
  render() {
    const { searchTerm, results,  searchKey, error,isLoading} = this.state;
    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];


    return (
      <div className="App page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
          
          { error
          ? <div className="interactions">
            <p>Something went wrong.</p>
          </div>
          : <Table
            list={list}
            onDismiss={this.onDismiss}
          /> }
          
           <div className="interactions">
           <ButtonWithLoading
              isLoading={isLoading}
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
              More
           </ButtonWithLoading>
          </div>
        </div>
      </div>
    );
    }
 }
 const Button = ({ onClick, className = '', children }) =>
 <button
   onClick={onClick}
   className={className}
   type="button"
 >
   {children}
 </button>
 
const Loading = () => <div>Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...rest }) =>
 isLoading
 ? <Loading />
 : <Component { ...rest } />
 
const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children,activeSortKey }) => {
  const sortClass = ['button-inline'];
  if (sortKey === activeSortKey) {
    sortClass.push('button-active');
  }
  return (
    <Button
      onClick={() => onSort(sortKey)}
      className={sortClass.join(' ')}
    >
    {children}
  </Button>
  ); 
}



  class Table extends Component {
    constructor(props) {
      super(props);
      this.state = {
        sortKey: 'NONE',
        isSortReverse: false,
      };
      this.onSort = this.onSort.bind(this);

    }
    onSort(sortKey) {
      const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
      this.setState({ sortKey,isSortReverse });
    }
    render() {
      const { list,onDismiss} = this.props;
      const {
        sortKey,
        isSortReverse,
      } = this.state;
      const sortedList = SORTS[sortKey](list);
      const reverseSortedList = isSortReverse
        ? sortedList.reverse()
        : sortedList;
        return (
          <div className="table">
            <div className="table-header">
              <span style={{ width: '40%' }}>
                <Sort
                  sortKey={'TITLE'}
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                > Title
                </Sort>
              </span>
              <span style={{ width: '30%' }}>
                <Sort
                  sortKey={'AUTHOR'}
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                >Author
                </Sort>
              </span>
              <span style={{ width: '10%' }}>
                <Sort
                  sortKey={'COMMENTS'}
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                > Comments
                </Sort>
              </span>
              <span style={{ width: '10%' }}>
                <Sort
                  sortKey={'POINTS'}
                  onSort={this.onSort}
                  activeSortKey={sortKey}
                >
                  Points
                </Sort>
              </span>
              <span style={{ width: '10%' }}>Archives</span>
            </div>

            {reverseSortedList.map(item =>
            <div key={item.objectID} className="table-row">
              <span>
                <a href={item.url}>{item.title}</a>
              </span>
              <span>{item.author}</span>
              <span>{item.num_comments}</span>
              <span>{item.points}</span>
              <span>
              <Button 
                onClick={() => onDismiss(item.objectID)} 
                className="button-inline">
                Dismiss
              </Button>
              </span>
            </div>)}
          </div>
      );
    }
  }
const Search=({ value, onChange,onSubmit, children })=>
  <form onSubmit={onSubmit}>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">
      {children}
    </button>
  </form>

  
export default App;
export {
  Button,
  Search,
  Table,
};
