import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './configureStore'
import Form from 'react-json-editor';
import { updateValues } from './actions';
import './helpers';
import '../styles.scss';

import engagement from '../../templates/Letter of Engagement.html';
import engagementSchema from '../../templates/Letter of Engagement.json';

export function debounce(func, delay = 100) {
    let timeout;
    return function(){
        const args = arguments;
        if (timeout)
            clearTimeout(timeout)
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

const FORMS = {
    'Letter of Engagement': {
        template: engagement,
        schema: engagementSchema
    }
}

FORMS['Letter of Engagement'].schema = {
  "definitions": {
    "weight": {
      "title": "Weight",
      "type": "object",
      "properties": {
        "amount": {
          "type": "number",
          "minimum": 0,
          "exclusiveMinimum": true
        },
        "unit": {
          "enum": [
            "kg",
            "lbs"
          ],
          "enumNames": [
            "KG",
            "lbs"
          ]
        }
      }
    }
  },
  "title": "Example form",
  "description": "A form based on a schema",
  "type": "object",
  "required": [
    "name",
    "age"
  ],
  "x-hints": {
    "form": {
      "classes": "my-nice-form"
    }
  },
  "properties": {
    "name": {
      "title": "Your name",
      "description": "Your full name",
      "type": "string",
      "minLength": 3,
      "maxLength": 40,
      "pattern": "^[A-Z][a-z]*(\\s[A-Z][a-z]*)*$",
      "x-hints": {
        "form": {
          "classes": "important-field"
        }
      }
    },
    "age": {
      "title": "Your age",
      "type": "integer",
      "minimum": 1
    },
    "weight": {
      "title": "Your weight",
      "$ref": "#/definitions/weight"
    },
    "color": {
      "title": "Favourite colour",
      "type": "object",
      "properties": {
        "hasFave": {
          "title": "Do you have a favourite colour?",
          "type": "string"
        }
      },
      "oneOf": [
        {},
        {
          "properties": {
            "hasFave": {
              "enum": [
                "no"
              ]
            }
          }
        },
        {
          "properties": {
            "hasFave": {
              "enum": [
                "yes"
              ]
            },
            "fave": {
              "title": "Your favourite colour",
              "type": "string",
              "enum": [
                "",
                "red",
                "green",
                "blue",
                "yellow",
                "orange",
                "purple",
                "other"
              ]
            }
          }
        }
      ],
      "x-hints": {
        "form": {
          "selector": "hasFave"
        }
      }
    },
    "interests": {
      "title": "Your interests",
      "type": "array",
      "minItems": 2,
      "items": {
        "type": "string",
        "minLength": 2
      }
    },
    "languages": {
      "title": "Languages you speak",
      "type": "array",
      "maxItems": 2,
      "items": {
        "type": "string"
      }
    }
  }
};

const store = configureStore()


var schema = {
  definitions: {
    weight: {
      title: "Weight",
      type: "object",
      properties: {
        amount: {
          type: "number",
          minimum: 0,
          exclusiveMinimum: true
        },
        unit: {
          enum: [ "kg", "lbs" ],
          // optional, see https://github.com/json-schema/json-schema/wiki/enumNames-(v5-proposal)
          // this is handy for i18n since then you want to separate values/names
          enumNames: [ "KG", "lbs"]
        }
      }
    }
  },
  title: "Example form",
  description: "A form based on a schema",
  type: "object",
  required: ["name", "age"],
  'x-hints': {
    form: {
      classes: 'my-nice-form'
    }
  },
  properties: {
    name: {
      title: "Your name",
      description: "Your full name",
      type: "string",
      minLength: 3,
      maxLength: 40,
      pattern: "^[A-Z][a-z]*(\\s[A-Z][a-z]*)*$",
      'x-hints': {
        form: {
          classes: 'important-field'
        }
      }
    },
    age: {
      title: "Your age",
      type: "integer",
      minimum: 1
    },
    weight: {
      title: "Your weight",
      "$ref": "#/definitions/weight"
    },
    color: {
      title: "Favourite colour",
      type: "object",
      properties: {
        hasFave: {
          title: "Do you have a favourite colour?",
          type: "string"
        }
      },
      oneOf: [
        {
        },
        {
          properties: {
            hasFave: {
              enum: [ "no" ]
            }
          }
        },
        {
          properties: {
            hasFave: {
              enum: [ "yes" ]
            },
            fave: {
              title: "Your favourite colour",
              type: "string",
              enum: [
                "", "red", "green", "blue", "yellow", "orange", "purple", "other"
              ]
            }
          }
        }
      ],
      "x-hints": {
        form: {
          selector: "hasFave",
        }
      }
    },
    interests: {
      title: "Your interests",
      type: "array",
      minItems: 2,
      items: {
        type: "string",
        minLength: 2
      }
    },
    languages: {
      title: "Languages you speak",
      type: "array",
      maxItems: 2,
      items: {
        type: "string"
      }
    }
  }
};



class App extends React.Component {

    componentWillMount() {

        this._update = debounce((value) => {
            console.log(value)
                this.props.dispatch(updateValues(value));
        });
    }

    update(value) {
        this._update(value);
        return true;
    }

    render() {
        console.log('render', this.props)
        return <div className="container-fluid">
            <div className="row">
            <div className="col-md-4">
                <Form className="form-horizontal" schema={FORMS[this.props.form].schema} submitOnChange={true}  onSubmit={::this.update}/>
            </div>
            <div className="col-md-8">
                <div className="preview">
                    <div dangerouslySetInnerHTML={{__html: FORMS[this.props.form].template(this.props.values)}} />
                </div>
            </div>
        </div>

        </div >
    }
}

const ConnectedApp = connect(state => state.active)(App)

render( <Provider store = {store} >
    <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)