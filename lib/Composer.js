import React from 'react';
import pointer from 'json-pointer';
import Ajv from 'ajv';
import Form from './Form';
import Fieldset from './Fieldset';
import Input from './Input';
import Checkbox from './Checkbox';
import OptionList from './OptionList';
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
        schema={schema}
        getOptions={this.props.getOptions}
        {...schema._display}
        getLabel={this.props.getLabel}
        title={schema.title}
        description={schema.description}
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
      const ref = this.getSchema(definition['$ref'])
      _.merge(ref, definition);
      definition = ref;
    }

    if ('allOf' in definition) {
      var allOf = {};
      definition.allOf.map(function(definition) {
        if ('$ref' in definition) {
          const ref = this.getSchema(definition['$ref']);
          _.merge(ref, allOf);
          allOf = ref;
        } else {
          _.merge(allOf, definition);
        }
      }, this);
      return (
        <Fieldset
          key={name}
          property={name}
          multiple={multiple}
          {...definition._display}
          getLabel={this.props.getLabel}
          title={definition.title}
          description={definition.description}
        >
          { this.process(allOf) }
        </Fieldset>
      )
    }

    // FIXME: workaround until proper UI solution is implemented
    if ('oneOf' in definition) {
      definition = definition.oneOf[0]
    }

    if (!definition.type && definition.enum) {
      definition.type = 'string';
    }

    if (definition._widget && this.props.widgets[definition._widget]) {
      const Widget = this.props.widgets[definition._widget]
      console.info("Using custom widget", definition._widget, Widget)
      return (
        <Widget
          key={name}
          property={name}
          multiple={multiple}
          {...definition._display}
          getOptions={this.props.getOptions}
          getLabel={this.props.getLabel}
          title={definition.title}
          description={definition.description}
        >
          { this.process(definition) }
        </Widget>
      )
    } else if (definition._widget) {
      console.warn("Unregistered widget referenced", definition._widget)
    }

    switch(definition.type) {
      case 'array':
        const itemsDefinition = definition.items['$ref']
          ? this.getSchema(definition.items['$ref'])
          : definition.items
        itemsDefinition._display = definition._display
        itemsDefinition.title = definition.title
        itemsDefinition.description = definition.description
        return this.property(name, itemsDefinition, true);
      case 'string':
      case 'number':
      case 'integer':
        if (definition.enum) {
          return <OptionList
            key={name}
            property={name}
            multiple={multiple}
            options={definition.enum}
            {...definition._display}
            getLabel={this.props.getLabel}
            title={definition.title}
            description={definition.description}
          />
        } else {
          return <Input
            key={name}
            property={name}
            multiple={multiple}
            {...definition._display}
            getLabel={this.props.getLabel}
            title={definition.title}
            description={definition.description}
          />
        }
      case 'boolean':
        return <Input
          key={name}
          type="checkbox"
          property={name}
          multiple={multiple}
          {...definition._display}
          getLabel={this.props.getLabel}
          title={definition.title}
          description={definition.description}
        />
      case 'object':
        return (
          <Fieldset
            key={name}
            property={name}
            multiple={multiple}
            {...definition._display}
            getLabel={this.props.getLabel}
            title={definition.title}
            description={definition.description}
          >
              { this.process(definition) }
          </Fieldset>
        )
      default:
        console.warn("Unkown property type", name, definition);
    }

  }

  getSchema(ptr) {
    return JSON.parse(JSON.stringify(ptr.charAt(0) == '#'
      ? pointer.get(this.props.schema, ptr.slice(1))
      : { "type" : "string", "remote": ptr }));
  }

  render() {
    const type = this.props.value['@type'];
    const schema = this.getSchema('#/definitions/' + type);
    return (
      <div className={ this.props.className || 'Forms' }>
        {schema.title &&
          <h1>{this.props.getLabel(schema.title)}</h1>
        }
        {schema.description &&
          <p>{this.props.getLabel(schema.description)}</p>
        }
        <Form
          schema={ this.props.schema }
          value={ this.props.value }
          submit={ this.props.submit }
          error={ this.props.error || console.error }
          submitLabel={ this.props.submitLabel }
          submitNote={ this.props.submitNote }
          action={ this.props.action }
          method={ this.props.method }
        >
          { this.process(schema) }
        </Form>
      </div>
    )
  }

}

export default Composer;
