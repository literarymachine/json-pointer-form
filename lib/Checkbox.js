import React from 'react';
import FormElement from './FormElement';
import pointer from 'json-pointer';
import _ from 'lodash';

class Checkbox extends FormElement {

  constructor(props) {
    super(props);
    this.prefetch = !!props.schema.properties.inScheme;
    this.state.dropdown = false;
    this.handleChange = this.handleChange.bind(this);
    this.suggestionList = this.suggestionList.bind(this);
    this.show = this.show.bind(this);
  }

  componentDidMount() {
    if (this.prefetch) {
      this.props.getOptions("", this.props.schema, (result) => {
        this.setState({suggestions: result.member.map(member => member.about)})
      })
    }
  }

  handleChange(event) {
    var that = this;
    this.setState({search: event.target.value});
    if (!_.isEmpty(event.target.value) && !this.prefetch) {
      this.props.getOptions(event.target.value, that.props.schema, function(result) {
        that.setState( { suggestions: result.member.map(member => member.about) } );
      });
    } else if (!this.prefetch) {
      this.setState( { suggestions: [] } );
    }
  }

  select(suggestion) {
    this.props.handleChange({
      target: {
        name: pointer.compile(this.props.parents),
        value: suggestion,
        type: "custom"
      }
    });
    if (this.prefetch) {
      this.setState( { search: '', dropdown: false } );
    } else {
      this.setState( { search: '', suggestions: [] } );
    }
  }

  show(suggestion) {
    return (suggestion['@type'] !== 'Concept') || (!this.state.search) || suggestion.name.some(name =>
      name['@value'].toLowerCase().search(this.state.search.trim().toLowerCase()) !== -1
    )
  }

  suggestionList(suggestions, applyFilter = false) {
    return (
      <ul>
        {suggestions.map(function(suggestion) {
          return (
            <li key={suggestion['@id']}>
              <input
                name={this.props.name}
                type="checkbox"
                value={suggestion['@id']}
                id={suggestion['@id']}
                onChange={() => this.select(suggestion)}
              />
              <label htmlFor={suggestion['@id']} tabIndex="0" className={
                applyFilter ? (this.show(suggestion) ? null: 'hidden') : null
              }>
                {this.props.getLabel(suggestion)}
              </label>
              {suggestion.narrower && this.suggestionList(suggestion.narrower, applyFilter)}
            </li>
          )
        }, this)}
      </ul>
    )
  }

  render() {
    if (_.isEmpty(this.state.value)) {
      if (this.prefetch) {
        return (
          <div className="dropdownContainer dropdown">
            <button className="toggleDropdown" onClick={e => {
              e.preventDefault()
              this.setState({dropdown: !this.state.dropdown, search:''})
            }}>
              <label htmlFor={this.props.name}>
                {this.props.getLabel(this.props.title || this.props.property)}
              </label>
            </button>
            <div className={this.state.dropdown ? 'dropdownList' : 'hidden'} >
              <div className="filterContainer">
                <input
                  type="text"
                  className="filter"
                  placeholder="..."
                  onChange={this.handleChange}
                  value={this.state.filter}
                />
              </div>
              {this.state.suggestions && this.state.suggestions.length > 0 &&
                this.suggestionList(this.state.suggestions, true)
              }
            </div>
          </div>
        )
      } else {
        return (
          <div key={this.props.name} className={`input dropdown ${this.props.property}`}>
            <input
              name={this.props.name}
              type="text"
              value={this.state.search || ''}
              onChange={this.handleChange}
            />
            {this.state.suggestions && this.state.suggestions.length > 0 &&
              this.suggestionList(this.state.suggestions)
            }
          </div>
        )
      }
    } else {
      return (
        <div className={`checkbox ${this.props.property}`}>
          <input
            name={this.props.name}
            id={this.props.name}
            type="checkbox"
            value={this.state.value}
            onChange={this.props.handleChange}
            checked
          />
          <label htmlFor={this.props.name}>
            {this.props.getLabel(this.props.parent)}
          </label>
        </div>
      )
    }
  }

}

export default Checkbox;
