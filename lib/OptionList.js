import React from 'react';
import FormElement from './FormElement';

class OptionList extends FormElement {

  constructor(props) {
    super(props);
    this.state = {
      filter: false
    }
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    this.setState({filter: ""})
  }

  handleFilterChange(event) {
    this.setState({filter: event.target.value});
  }

  render() {

    var values = this.props.multiple
      ? (this.state.value ? this.state.value : [])
      : (this.state.value ? [this.state.value] : ['']);

    var options = (this.props.multiple ? [] : ['']).concat(this.props.options).filter(
      option => (!this.state.filter || option.search(this.state.filter.trim()) !== -1)
                && (values.indexOf(option) === -1)
    );

    return(
      <ul className={`optionlist ${this.props.property} ${this.props.className}`}>
        {values.map((option, index) => (
          <li key={option}>
            <input
              type={this.props.multiple ? "checkbox" : "radio"}
              name={this.props.multiple ? `${this.props.name}/${index}` : this.props.name}
              id={`${this.props.name}-${option}`}
              onChange={(e) => {this.props.handleChange(e); this.setState({filter: ""})}}
              defaultChecked={true}
              value={option}
            />
            <label htmlFor={`${this.props.name}-${option}`}>{option}</label>
          </li>
        ))}
        {this.state.filter !== false &&
          <li>
            <input
              placeholder="Filter"
              onChange={this.handleFilterChange}
              value={this.state.filter}
            />
          </li>
        }
        {options.map((option, index) => {
          return (
            <li key={option}>
              <input
                type={this.props.multiple ? "checkbox" : "radio"}
                name={this.props.multiple
                  ? `${this.props.name}/${index + values.length}`
                  : this.props.name
                }
                id={`${this.props.name}-${option}`}
                onChange={(e) => {this.props.handleChange(e); this.setState({filter: ""})}}
                defaultChecked={false}
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
