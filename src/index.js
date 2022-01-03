import React from 'react'
import ReactDOM from 'react-dom'
import fetchJsonp from 'fetch-jsonp'
import { Action, withStatechart } from 'react-automata'
import 'normalize.css'
import './main.css'

const statechart = {
  initial: 'start',
  states: {
    start: {
      on: {
        search: 'loading',
      },
    },
    loading: {
      on: {
        Success: 'Grid',
        failure: 'error',
        cancel: 'Grid',
      },
      onEntry: 'enterLoading',
      onExit: 'exitLoading',
    },
    error: {
      on: {
        search: 'loading',
      },
      onEntry: 'enterError',
    },
    Grid: {
      on: {
        search: 'loading',
        selectPhoto: 'photo',
      },
      onEntry: 'enterGrid',
    },
    photo: {
      on: {
        exit: 'Grid',
      },
      onEntry: 'enterPhoto',
    },
  },
}

class Grid extends React.Component {
  state = {
    disableForm: false,
    text: '',
    searchText: 'search',
  }

  enterLoading() {
    this.setState({
      disableForm: true,
      searchText: 'Searching!!',
    })

    const encodedtext = encodeURIComponent(this.state.text)
    setTimeout(() => {
      fetchJsonp(
        `https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&tags=${encodedtext}`,
        { jsonpCallback: 'jsoncallback' }
      )
        .then(res => res.json())
        .then(({ items }) => this.props.transition('Success', { items }))
        .catch(() => this.props.transition('failure'))
    }, 1000)
  }

  exitLoading() {
    this.setState({
      disableForm: false,
      searchText: 'search',
    })
  }

  enterError() {
    this.setState({
      searchText: 'Try Searching Again',
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.transition('search')
  }

  handleChangetext = e => {
    this.setState({ text: e.target.value })
  }

  render() {
    return (
      <div className="appUI" data-state={this.props.machineState}>
        <div class="heading">
              <h1>React Image Grid</h1>  
          </div>
        <form className="formUI" onSubmit={this.handleSubmit}>
          <input
            className="inputUI"
            disabled={this.state.disableForm}
            placeholder="Search for Photos"
            type="search"
            value={this.state.text}
            onChange={this.handleChangetext}
          />
          <div className="buttonsUI">
            <button className="buttonUI" disabled={this.state.disableForm}>
              {this.state.searchText}
            </button>
            <Action show="enterLoading">
              <button
                className="buttonUI"
                type="button"
                onClick={() => this.props.transition('cancel')}
              >
                Cancel
              </button>
            </Action>
          </div>
        </form>

        <section className="itemsUI">
          <Action show="enterError">
            <span className="errorUI">Sorry, Search Failed.</span>
          </Action>
          {this.props.items.map((item, i) => (
            <img
              className="itemUI"
              key={item.link}
              src={item.media.m}
              style={{ '--i': i }}
              onClick={() =>
                this.props.transition('selectPhoto', { photo: item })}
            />
          ))}
        </section>

        <Action show="enterPhoto">
          <section
            className="photodetUI"
            onClick={() => this.props.transition('exit')}
          >
            <img className="photoUI" src={this.props.photo.media.m} />
          </section>
        </Action>
      </div>
    )
  }
}

const initialData = {
  items: [],
  photo: {
    media: {},
  },
}

const App = withStatechart(statechart, { initialData })(Grid)

ReactDOM.render(<App />, document.getElementById('root'))