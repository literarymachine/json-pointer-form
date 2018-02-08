import React from 'react';
import FormElement from './FormElement';

class Select extends FormElement {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className={`select ${this.props.property} ${this.props.className || ''}`}>
        <label
          htmlFor={this.props.name}
          className={this.props.errors[this.props.name] ? "error" : "label"}
        >
          {this.props.errors[this.props.name]
            ? this.props.errors[this.props.name]
            : this.props.property
          }
        </label>
        <select
          name={this.props.name}
          id={this.props.name}
          value={this.state.value ? this.state.value : undefined}
          onChange={this.props.handleChange}
          multiple={this.props.multiple}
        >
          <option
            className={this.props.errors[this.props.name] ? "error" : "label"}
            value=""
          >
            {this.props.errors[this.props.name]
              ? this.props.errors[this.props.name]
              : this.props.property
            }
          </option>
          {this.props.options.map(function(value, index) {
            return <option key={value} value={value}>{value}</option>
          })}
        </select>
      </div>
    )
  }

}

export default Select;
