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
    this.submit = this.submit.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.getLabel = this.getLabel.bind(this);
  }

  getOptions(url) {
    return function(term, callback) {
      return fetch('http://oerworldmap.localhost' + url).then(function(response) {
        return response.json();
      }).then(function(json) {
        callback(json);
      });
    }
  }

  getLabel(value) {
    return value && value["name"] && value["name"][0]
      ? value["name"][0]["@value"] : null;
  }

  process(schema) {
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
        if (definition.remote) {
          return (
            <Fieldset key={name} property={name} multiple={multiple}>
              <Checkbox property="@id" provider={this.getOptions(definition.remote)} label={this.getLabel}/>
            </Fieldset>
          )
        } else if (definition.enum) {
          return <Select key={name} property={name} multiple={multiple} options={definition.enum}/>
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
        console.log(name, definition);
    }

  }

  submit(value) {
    console.log(value);
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
        submit={ this.submit }
      >
        { this.process(schema) }
      </Form>
    )
  }

}

export default Composer;
