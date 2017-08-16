import React from 'react';
import pointer from 'json-pointer';
import Ajv from 'ajv';
import Form from './Form';
import Fieldset from './Fieldset';
import Input from './Input';
import Checkbox from './Checkbox';
import Select from './Select';
import _ from 'lodash';

class Composer extends React.Component {

  constructor(props) {
    super(props);
    this.process = this.process.bind(this);
    this.property = this.property.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.getLabel = this.getLabel.bind(this);
  }

  getOptions(definition) {
    const url = 'http://localhost:9000/resource.json?filter.about.@type='
      + definition.properties['@type'].enum.join(",");
    return function(term, callback) {
      return fetch(url).then(function(response) {
        return response.json();
      }).then(function(json) {
        callback(json);
      });
    }
  }

  getLabel(value) {
    //FIXME: make configurable
    return value && value["name"]
      ? value["name"] : null;
  }

  process(schema) {
    if (schema.remote) {
      return <Checkbox property="@id" provider={this.getOptions(schema)} label={this.getLabel} />
    }
    const properties = [];
    for (let property in schema.properties) {
      const element = this.property(property, schema.properties[property]);
      if (element) {
        properties.push(element);
      }
    }
    return properties;
  }

  property(name, definition, multiple) {

    multiple = multiple || false;

    if ('$ref' in definition) {
      _.merge(definition, this.getSchema(definition['$ref']));
    }

    if ('allOf' in definition) {
      var allOf = {};
      definition.allOf.map(function(definition) {
        if ('$ref' in definition) {
          _.merge(allOf, this.getSchema(definition['$ref']));
        } else {
          _.merge(allOf, definition);
        }
      }, this);
      return (
        <Fieldset key={name} property={name} multiple={multiple}>
          { this.process(allOf) }
        </Fieldset>
      )
    }

    if (!definition.type && definition.enum) {
      definition.type = 'string';
    }

    switch(definition.type) {
      case 'array':
        const itemsDefinition = definition.items['$ref']
          ? this.getSchema(definition.items['$ref'])
          : definition.items
        return this.property(name, itemsDefinition, true);
      case 'string':
      case 'number':
      case 'integer':
        if (definition.enum) {
          return <Select key={name} property={name} multiple={multiple} options={definition.enum} />
        } else {
          return <Input key={name} property={name} multiple={multiple} {...definition._display} />
        }
      case 'object':
        return (
          <Fieldset key={name} property={name} multiple={multiple}>
            { this.process(definition) }
          </Fieldset>
        )
      default:
        console.warn("Unkown property type", name, definition);
    }

  }

  getSchema(ptr) {
    return ptr.charAt(0) == '#'
      ? pointer.get(this.props.schema, ptr.slice(1))
      : { "type" : "string", "remote": ptr };
  }

  render() {
    const type = this.props.value['@type'];
    const schema = this.getSchema('#/definitions/' + type);
    return (
      <Form
        schema={ this.props.schema }
        value={ this.props.value }
        submit={ this.props.submit }
      >
        { this.process(schema) }
      </Form>
    )
  }

}

export default Composer;
