import 'babel-polyfill'
import React from 'react';
import { render, findDOMNode } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './configureStore'
import Form from 'react-json-editor/lib';
import { updateValues, renderDocument } from './actions';
import './helpers';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import engagement from '../../templates/Letter of Engagement.html';
import engagementSchema from '../../templates/Letter of Engagement.json';
import pagify from './pagify';

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

const DEFAULT_DATA = {
    "recipient": {
        "individuals": [
            {
                "firstName": "Mike",
                "lastName": "Jones"
            },
            {
                "firstName": "Denny",
                "lastName": "Dennysingers"
            }
        ],
        "recipientType": "individuals",
        "email": "kapow@pewpew.com",
        "address": {
            "street": "90 Power Ave",
            "suburb": "Kingbo",
            "postcode": "9666",
            "city": "Sincity",
            "country": "Atroika"
        },
    },
    "matter": {
        "matterType": "purchase",
        "assets": [
            {
                "address": "60 Binge St"
            },
            {
                "address": "66 Catwalk Blv"
            }]
    },
    "sender": "Thomas Bloy"

};

const store = configureStore({active: {values: DEFAULT_DATA, form: 'Letter of Engagement'}})

class TextArea extends React.Component {
    render() {
        debugger
    }
}

const handlers = {
    'textarea': TextArea
}

class FieldWrapper extends React.Component {
  render() {
    return <div className='form-group' key={this.props.label} >
      <label htmlFor={this.props.label} className="col-sm-4 control-label">{this.props.title}</label>
        <div className="col-sm-6">
            { this.props.children }
        </div>
      </div>
  }
}

class App extends React.Component {

    componentWillMount() {
        /*this.props.dispatch(updateValues({

        }));*/
    }

    update(data) {
        this.props.dispatch(updateValues(data.values));
    }

    pagify() {
        const node = findDOMNode(this.refs.doc).querySelector('.document');
        pagify(node);
    }

    componentDidMount() {
        this.pagify();
    }

    componentDidUpdate() {
        // split into pages
        this.pagify();
    }

    submit(data, type) {
        if(type === 'Reset'){
            this.props.dispatch(updateValues({}));
        }
        else{
            this.props.dispatch(renderDocument({formName: this.props.form, values: this.props.values}))
                .then((response) => {
                    return response.response.blob()
                })
                .then(blob => {
                    saveAs(blob, "result.pdf");
                });
            }
    }

    render() {
        return <div className="">
            <div className="controls">
                <form className="form-horizontal">
                    <FieldWrapper label="select" title="Form">
                      <select className="form-control">
                            { Object.keys(FORMS).map((m, i)=>{
                                return <option key={i}>{m}</option>
                            })}
                      </select>
                    </FieldWrapper>
                </form>
                <Form className="form-horizontal"
                    buttons={['Reset', 'Generate PDF']}
                    fieldWrapper={FieldWrapper}
                    schema={FORMS[this.props.form].schema}
                    update={::this.update}
                    values={this.props.values}
                    handlers={handlers}
                    onSubmit={::this.submit} />
            </div>
            <div className="preview">
                <div className="">
                    <div ref="doc" dangerouslySetInnerHTML={{
                        __html: FORMS[this.props.form].template({...this.props.values,
                        mappings: FORMS[this.props.form].schema.mappings})
                    }} />
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




