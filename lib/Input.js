import React from 'react';
import FormElement from './FormElement';

class Input extends FormElement {

  constructor(props) {
    super(props);
    this.getInput = this.getInput.bind(this);
  }

  getInput(name, value, handleChange) {
    return (
      <div className={(this.props.rows > 1 ? "textarea " : "input ") + this.props.property}>
        {this.props.rows > 1 ? (
          <textarea
            name={name}
            id={name}
            value={value}
            onChange={handleChange}
            rows={this.props.rows}
            readOnly={this.props.readOnly}
            placeholder={this.props.property}
          />
        ) : (
          <input
            type={this.props.type || "text"}
            name={name}
            id={name}
            value={value}
            onChange={handleChange}
            readOnly={this.props.readOnly}
            placeholder={this.props.property}
          />
        )}
        <label htmlFor={name}>
          {this.props.errors[name]
            ? <span className="error">{this.props.errors[name]}</span>
            : <span className="label">{this.props.property}</span>
          }
        </label>
      </div>
    )
  }

  render() {
    if (this.props.multiple) {
      var values = this.state.value ? this.state.value.concat('') : [''];
      return (
        <fieldset className="multiple-container">
          {values.map(function(value, index) {
            return (
              <div key={index}>
                {this.getInput(
                  this.props.name + "/" + index, value, this.props.handleChange
                )}
              </div>
            )
          }, this)}
        </fieldset>
      )
    } else {
      return this.getInput(
        this.props.name, this.state.value, this.props.handleChange
      );
    }
  }

}

export default Input;
