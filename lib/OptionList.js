import React from 'react';
import FormElement from './FormElement';

class OptionList extends FormElement {

  constructor(props) {
    super(props);
  }

  render() {

    var value = this.props.multiple
      ? (this.state.value ? this.state.value : [])
      : (this.state.value ? ['', this.state.value] : ['']);

    var options = Array.from(new Set(value.concat(this.props.options)));

    return(
      <ul className={`optionlist ${this.props.property} ${this.props.className}`}>
        {options.map((option, index) => {
          return (
            <li key={option}>
              <input
                type={this.props.multiple ? "checkbox" : "radio"}
                name={this.props.multiple ? `${this.props.name}/${index}` : this.props.name}
                id={`${this.props.name}-${option}`}
                onChange={this.props.handleChange}
                checked={this.props.multiple
                  ? this.state.value.indexOf(option) > -1
                  : this.state.value == option
                }
                value={option}
              />
              <label htmlFor={`${this.props.name}-${option}`}>{option}</label>
            </li>
          )
        })}
      </ul>
    )
  }

}

export default OptionList;
