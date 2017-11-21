import React from 'react';
import Fieldset from './Fieldset';
import pointer from 'json-pointer';
import _ from 'lodash';
import Ajv from 'ajv';

class Form extends Fieldset {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadSchema = this.loadSchema.bind(this);
    this.validate = this.validate.bind(this);
  }

  handleChange(event) {

    var path = pointer.parse(event.target.name);
    var property = path.pop();

    // If unsetting an @id via a checkbox, unset the entire object
    var target = property == "@id" && event.target.type == "checkbox"
      ? pointer.compile(path)
      : event.target.name;
    var value = event.target.value;
    switch (event.target.type) {
      case "checkbox":
        value = event.target.checked ? value : null;
        break;
      case "select-multiple":
        var options = event.target.options;
        var selected = [];
        for (var i = 0, l = options.length; i < l; i++) {
          if (options[i].selected) {
            selected.push(options[i].value);
          }
        }
        value = selected;
    }

    // Clone current state so it is not modified in place
    var update = JSON.parse(JSON.stringify(this.state.value));
    if (!_.isEmpty(value)) {
      pointer.set(update, target, value);
    } else if (pointer.has(update, target)) {
      pointer.remove(update, target, value);
    }

    // This is necessary to remove potential empty array values
    var dict = pointer.dict(update);
    var cleaned = {};
    for (var p in dict) {
      if (dict[p]) {
        pointer.set(cleaned, p, dict[p]);
      }
    }

    this.setState( { value: cleaned } );
    this.props.change(cleaned);
    this.validate()
      .then(function() {
        this.setState( { errors: {} } );
      }.bind(this))
      .catch(function(errors) {
        this.setState( { errors: errors } );
      }.bind(this))
  }

  handleSubmit(event) {
    event.preventDefault();
    this.validate()
      .then(function() {
        this.setState( { errors: {} } );
        this.props.submit(this.state.value);
      }.bind(this))
      .catch(function(errors) {
        this.setState( { errors: errors } );
      }.bind(this));
    console.info(this.state.value);
  }

  loadSchema(uri, callback) {
    return fetch('http://oerworldmap.localhost' + uri).then(function(response) {
      return response.json();
    }).then(function(json) {
      callback(null, json);
    });
  }

  validate() {
    var ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
      jsonPointers: true,
      extendRefs: true,
      useDefaults: true,
      loadSchema: this.loadSchema
    });
    var that = this;
    for (var definition in this.props.schema.definitions) {
      ajv.addSchema(
        this.props.schema.definitions[definition],
        "#/definitions/" + definition
      );
    }
    var definition = this.props.schema.definitions[this.state.value['@type']];
    return new Promise(function(resolve, reject) {
      ajv.compileAsync(definition, function (err, validate) {
        if (err) {
          console.error(err);
          return;
        }
        // Create a copy of value because AJV will modify it by
        // coercing types and setting defaults
        var value = JSON.parse(JSON.stringify(that.state.value));
        var valid = validate(value);
        var errors = {};
        if (!valid) {
          for (var i = 0; i < validate.errors.length; i++) {
            var errorPath = validate.errors[i].dataPath + (
              validate.errors[i].params.missingProperty
                ? '/' + validate.errors[i].params.missingProperty : ''
            );
            errors[errorPath] = validate.errors[i].message;
            console.error(validate.errors[i]);
          }
          reject(errors);
        } else {
          resolve(errors);
        }
      });
    });
  }

  componentDidMount() {
    this.validate()
      .then(function() {
        this.setState( { errors: {} } );
      }.bind(this))
      .catch(function(errors) {
        this.setState( { errors: errors } );
      }.bind(this));
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit} className={this.props.className}>
        {this.getChildren()}
        <input type="submit" value={this.props.submitLabel} />
      </form>
    )
  }

}

export default Form;
