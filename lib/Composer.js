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
  }

  process(schema) {
    if (schema.remote) {
      return <Checkbox
        property="@id"
        types={schema.properties['@type'].enum}
        provider={this.props.getOptions}
        label={this.props.getLabel}
      />
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
          return <Select
            key={name}
            property={name}
            multiple={multiple}
            options={definition.enum}
            {...definition._display}
          />
        } else {
          return <Input
            key={name}
            property={name}
            multiple={multiple}
            {...definition._display}
          />
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
