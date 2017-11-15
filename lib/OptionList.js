import React from 'react';
import FormElement from './FormElement';

class OptionList extends FormElement {

  constructor(props) {
    super(props);
    this.state = {
      filter: false,
      dropdown: false,
      value: props.value || '',
      errors: props.errors || {}
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
      : (this.state.value ? [this.state.value] : []);

    var options = this.props.options.filter(
      option => (!this.state.filter || option.search(this.state.filter.trim()) !== -1)
                && (values.indexOf(option) === -1)
      );

    return(
      <div className={`optionlistContainer ${this.props.className || ''}`}>
        <ul className={`optionlist ${this.props.property} ${this.props.className || ''}`}>
          {values.map((option, index) => (
            <li key={option}>
              <input
                className="checkBox"
                type="checkbox"
                name={this.props.multiple ? `${this.props.name}/${index}` : this.props.name}
                id={`${this.props.name}-${option}`}
                onChange={(e) => {this.props.handleChange(e); this.setState({filter: ""})}}
                defaultChecked={true}
                value={option}
              />
              <label htmlFor={`${this.props.name}-${option}`}>{option}</label>
            </li>
          ))}
        </ul>
        {(this.props.multiple || values.length === 0) &&
          <div>
            {this.state.filter !== false &&
              <button className="toggleDropdown" onClick={e => {
                e.preventDefault()
                this.setState({dropdown: !this.state.dropdown})
              }}>
                {this.props.property}
              </button>
            }
            <ul className={this.state.dropdown ? 'showDropdown' : 'hideDropdown'}>
              {this.state.filter !== false &&
                <li>
                  <div className="filterContainer">
                    <input
                      type="text"
                      className="filter"
                      placeholder="..."
                      onChange={this.handleFilterChange}
                      value={this.state.filter}
                    />
                  </div>
                </li>
              }
              {options.map((option, index) => {
                return (
                  <li key={option}>
                    <input
                      type="checkbox"
                      name={this.props.multiple
                        ? `${this.props.name}/${index + values.length}`
                        : this.props.name
                      }
                      id={`${this.props.name}-${option}`}
                      onChange={(e) => {this.props.handleChange(e); this.setState({filter: "", dropdown: false})}}
                      defaultChecked={false}
                      value={option}
                    />
                    <label htmlFor={`${this.props.name}-${option}`}>{option}</label>
                  </li>
                )
              })}
            </ul>
          </div>
        }
      </div>
    )
  }

}

export default OptionList;
