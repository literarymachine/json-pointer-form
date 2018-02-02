import React from 'react';
import pointer from 'json-pointer';
import _ from 'lodash';

class Fieldset extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value || (props.multiple ? [] : {} ),
      errors: props.errors || {}
    };
    this.getChildren = this.getChildren.bind(this);
    this.cloneChildren = this.cloneChildren.bind(this);
    this.getParentPath = this.getParentPath.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value || (this.props.multiple ? [] : {} ),
      errors: nextProps.errors || {}
    });
  }

  cloneChildren(value, index) {
    return React.Children.map(this.props.children, function(child) {
      var parents = this.getParentPath();
      if (index != null) {
        parents = parents.concat(index);
      }
      var name = pointer.compile(parents.concat(child.props.property));
      return React.cloneElement(child, {
        handleChange: this.handleChange || this.props.handleChange,
        parents: parents,
        parent: value,
        value: value[child.props.property],
        name: name,
        getLabel: child.props.getLabel,
        errors: this.state.errors,
        title: child.props.title
      })
    }, this);
  }

  getParentPath() {
    return this.props.parents && this.props.property
      ? this.props.parents.concat(this.props.property) : []
  }

  getChildren() {
    if (this.props.multiple) {
      var children = [];
      var values = this.state.value ? this.state.value.concat({}) : [{}];
      values.map(function(value, index) {
        children.push(
          <fieldset key={index} className="multiple-container">
            { this.cloneChildren(value, index) }
          </fieldset>
        );
      }, this);
      return children;
    } else {
      return this.cloneChildren(this.state.value);
    }
  }

  render() {
    const name = pointer.compile(this.getParentPath());
    return(
      <fieldset className={`${this.props.property} ${this.props.className || ''}` }>
        <legend className={ this.props.errors[name] ? "error" : "title"}>
          {this.props.errors[name]
            ? this.props.getLabel(this.props.errors[name])
            : this.props.getLabel(this.props.title || this.props.property)}
        </legend>
        {this.getChildren()}
      </fieldset>
    )
  }

}

export default Fieldset;
