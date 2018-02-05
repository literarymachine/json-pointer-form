import React from 'react';
import FormElement from './FormElement';

class Input extends FormElement {

  constructor(props) {
    super(props);
    this.getInput = this.getInput.bind(this);
  }

  getInput(name, value, handleChange, isFirst) {
    return (
      <div className={`${this.props.rows > 1 ? "textarea " : "input"} ${this.props.property} ${this.props.type || ''} ${this.props.className || ''}`}>
        <label htmlFor={name} className={`${this.props.errors[name] ? "error" : "title"}${isFirst ? "" : " hidden"}`}>
          {this.props.errors[name]
            ? this.props.getLabel(this.props.errors[name])
            : this.props.getLabel(this.props.title || this.props.property)}
          {this.props.description &&
            <i className="fa fa-question-circle" title={this.props.getLabel(this.props.description)}></i>
          }
        </label>
        {this.props.rows > 1 ? (
          <textarea
            name={name}
            id={name}
            value={value}
            onChange={handleChange}
            rows={this.props.rows}
            readOnly={this.props.readOnly}
            placeholder={this.props.getLabel(this.props.title || this.props.property)}
          />
        ) : (
          <input
            type={this.props.type || "text"}
            name={name}
            id={name}
            value={this.props.type === "checkbox" ? "true" : value}
            onChange={handleChange}
            readOnly={this.props.readOnly}
            placeholder={this.props.getLabel(this.props.title || this.props.property)}
          />
        )}
      </div>
    )
  }

  render() {
    if (this.props.multiple) {
      var values = this.state.value ? this.state.value.concat('') : [''];
      return (
        <fieldset className="multiple-container">
          {values.map(function(value, index) {
            return React.cloneElement(this.getInput(
              this.props.name + "/" + index, value, this.props.handleChange, index === 0
            ), { key: index })
          }, this)}
        </fieldset>
      )
    } else {
      return this.getInput(
        this.props.name, this.state.value, this.props.handleChange, true
      );
    }
  }

}

export default Input;
