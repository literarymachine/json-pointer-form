import React from 'react';
import FormElement from './FormElement';
import pointer from 'json-pointer';
import _ from 'lodash';

class Checkbox extends FormElement {

  constructor(props) {
    super(props);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.suggestionList = this.suggestionList.bind(this);
  }

  handleFilterChange(event) {
    var that = this;
    this.setState({search: event.target.value});
    if (!_.isEmpty(event.target.value)) {
      this.props.getOptions(event.target.value, that.props.schema, function(result) {
        that.setState({suggestions: result.member.map(member =>({
          "@id": member.about["@id"],
          "@type": member.about["@type"],
          "name": member.about["name"],
          "narrower": member.about["narrower"]
        }))});
      });
    } else {
      this.setState( { suggestions: [] } );
    }
  }

  select(suggestion) {
    this.handleChange({
      target: {
        name: pointer.compile(this.props.parents),
        value: suggestion,
        type: "custom"
      }
    });
    this.setState( { search: '', suggestions: [] } );
  }

  suggestionList(suggestions) {
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
              <label htmlFor={suggestion['@id']} tabIndex="0">
                {this.props.getLabel(suggestion)}
              </label>
              {suggestion.narrower && this.suggestionList(suggestion.narrower)}
            </li>
          )
        }, this)}
      </ul>
    )
  }

  render() {
    if (_.isEmpty(this.state.value)) {
      return (
        <div key={this.props.name} className={"input dropdown " + this.props.property}>
          <input
            name={this.props.name}
            type="text"
            value={this.state.search || ''}
            onChange={this.handleFilterChange}
          />
          {this.state.suggestions && this.state.suggestions.length > 0 &&
            this.suggestionList(this.state.suggestions)
          }
        </div>
      )
    } else {
      return (
        <div className={"checkbox " + this.props.property}>
          <input
            name={this.props.name}
            id={this.props.name}
            type="checkbox"
            value={this.state.value}
            onChange={this.handleChange}
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
