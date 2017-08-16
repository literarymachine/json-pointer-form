import React from 'react';
import FormElement from './FormElement';
import pointer from 'json-pointer';
import _ from 'lodash';

class Checkbox extends FormElement {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    var that = this;
    this.setState({search: event.target.value});
    if (!_.isEmpty(event.target.value)) {
      this.props.provider(event.target.value, function(result) {
        that.setState( { suggestions: result.member.map(member => member.about) } );
      });
    } else {
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
    this.setState( { search: '', suggestions: [] } );
  }

  render() {
    if (_.isEmpty(this.state.value)) {
      return (
        <div key={this.props.name} className={"input " + this.props.property}>
          <input
            name={this.props.name}
            type="text"
            value={this.state.search || ''}
            onChange={this.handleChange}
          />
          {this.state.suggestions && this.state.suggestions.length > 0 &&
            <ul>
              {this.state.suggestions.map(function(suggestion) {
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
                      {suggestion.name}
                    </label>
                  </li>
                )
              }, this)}
            </ul>
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
            onChange={this.props.handleChange}
            checked
          />
          <label htmlFor={this.props.name}>
            {this.props.label ? this.props.label : this.props.value}
          </label>
        </div>
      )
    }
  }

}

export default Checkbox;
