import React from 'react'
import Highlight from 'react-highlight'

import 'highlight.js/styles/github.css'
import { Composer } from '../lib'
import schema from './json/course.json'
import 'normalize.css'
import '../lib/default.css'
import './css/style.css'

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: {'@type': 'Course'},
      schema: schema
    }
  }

  getOptions = (term, schema, callback) => {
    console.log(term, schema)
    if (schema.properties.inScheme) {
      this.vocab(schema.properties.inScheme.properties['@id'].enum[0]).then(response => {
        callback(response.data)
      })
    } else {
      callback({member: []})
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    fetch(`https://cors.io/?${e.target.url.value}`)
      .then(res => {
        return res.json()
      })
      .then(json => {
        this.setState({schema: json})
      })
  }

  vocab = (url) => {
    console.log(url)
    switch(url) {
    case 'https://w3id.org/class/esc/scheme':
      return Promise.resolve({
        data: {
          member: require('./json/esc.json').hasTopConcept.map(entry => {return {about: entry}})
        }
      })
    case 'https://oerworldmap.org/assets/json/licenses.json':
      return Promise.resolve({
        data: {
          member: require('./json/licenses.json').hasTopConcept.map(entry => {return {about: entry}})
        }
      })
    case 'http://purl.org/dcx/lrmi-vocabs/interactivityType/':
      return Promise.resolve({
        data: {
          member: require('./json/interactivityTypes.json').hasTopConcept.map(entry => {return {about: entry}})
        }
      })
    case 'http://purl.org/dcx/lrmi-vocabs/educationalAudienceRole/':
      return Promise.resolve({
        data: {
          member: require('./json/educationalAudienceRole.json').hasTopConcept.map(entry => {return {about: entry}})
        }
      })
    default:
      return Promise.resolve({
        data: {
          member: []
        }
      })
    }
  }

  render() {
    return (
      <div id="wrapper">
        <div id="header">
          <form onSubmit={this.handleSubmit}>
            <input name="url" type="text" placeholder="Enter a schema URL" />
            <input type="submit" />
          </form>
        </div>
        <div id="columns">
          <div id="form">
            {this.state.schema ? (
              <Composer
                value={this.state.value}
                schema={this.state.schema}
                submit={value => {
                  value.about && value.about.forEach(esc => {
                    fetch(`http://localhost:3000/inbox?target=${esc['@id']}`, {
                      method: 'post',
                      mode: 'cors',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(value)
                    }).then(res=>res.json())
                      .then(res => console.log(res))
                  })
                  this.setState({value})
                  window.scroll(0,0)
                }}
                change={value => { this.setState({value}) }}
                getOptions={this.getOptions}
                getLabel={value => value && value["name"] ? value["name"][0]["@value"] : value["@id"]}
              />
            ) : (
              <h1>Waiting for schema...</h1>
            )}
          </div>
          <div id="json" ref={(input) => { this.jsonCode = input }}>
            <Highlight className="json">
              {JSON.stringify(this.state.value, null, 2)}
            </Highlight>
          </div>
        </div>
      </div>
    )
  }

}



export default App
