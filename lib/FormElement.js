import React from 'react';
import pointer from 'json-pointer';


class FormElement extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      errors: props.errors || {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value || '',
      errors: nextProps.errors || {}
    });
  }

}

export default FormElement;
