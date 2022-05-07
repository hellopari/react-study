import React, { Component } from 'react';
import './App.css';
const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

function isSearched(searchTerm) {
  return function(item) {
    return item.title.toLowerCase().includes(searchTerm.toLowerCase());
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
      };
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }
  setSearchTopStories(result) {
    this.setState({ result });
  }
  fetchSearchTopStories(searchTerm) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(e => e);
  }
  onDismiss(id) {
    const updatedHits = this.state.result.hits.filter(item=> item.objectID !== id);
    this.setState({ result: Object.assign({}, this.state.result, { hits: updatedHits }) });
  }
  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
    }
  componentDidMount() {
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm);
  }
  render() {
    const { searchTerm, result } = this.state;
    if (!result) { return null; }
    return (
      <div className="App page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
          />
          {result?
            <Table
                list={result.hits}
                pattern={searchTerm}
                onDismiss={this.onDismiss}
            />:null
          }
        </div>
      </div>
    );
    }

  }
  class Button extends Component {
    render() {
      const {
        onClick,
        className,
        children,
      } = this.props;
    return (
      <button
        onClick={onClick}
        className={className}
        type="button"
        >
        {children}
      </button>
    );
  }
    }
  class Table extends Component {
    render() {
      const { list, pattern, onDismiss } = this.props;
        return (
          <div className="table">
            {list.filter(isSearched(pattern)).map(item =>
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
const Search=({ value, onChange })=>
  <form>
    <input
      type="text"
      value={value}
      onChange={onChange}
    />
  </form>

  
export default App;
