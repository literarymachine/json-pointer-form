import React from 'react';
import pointer from 'json-pointer';


class FormElement extends React.Component {

  constructor(props) {
    super(props);
    this.modified = false;
    this.state = {
      value: props.value || props.default || '',
      errors: props.errors || {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.modified = true;
    this.props.handleChange(event);
  }

  componentWillReceiveProps(nextProps) {
    if (this.modified && nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value || '',
        errors: nextProps.errors || {}
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.modified || nextProps.value !== this.state.value;
  }

}

export default FormElement;
