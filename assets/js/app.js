import 'babel-polyfill';
import React from 'react';
import Handlebars from 'handlebars';
import { render, findDOMNode } from 'react-dom';
import { Provider, connect } from 'react-redux';
import configureStore from './configureStore';
import Form from 'react-json-editor/lib';
import { updateValues, renderDocument, setForm, hideError } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import engagementSchema from '../../templates/Letter of Engagement.json';
import engagementEmail from '../../templates/emails/Letter of Engagement.html';
import clientAuthoritySchema from '../../templates/Client Authority.json';
import letterTemplateSchema from '../../templates/Letter Template.json';
import landTransferTaxStatementSchema from '../../templates/Land Transfer Tax Statement.json';
import './helpers';
import moment from 'moment';


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
    'Land Transfer Tax Statement': {
        schema: landTransferTaxStatementSchema
    },
    'Letter Template': {
        schema: letterTemplateSchema
    },
    'Letter of Engagement': {
        schema: engagementSchema,
        emails: [
            engagementEmail
        ]
    },
    'Client Authority and Instruction': {
        schema: clientAuthoritySchema
    }
}

const DEFAULT_DATA = {
    dateString: moment().format("DD MMMM YYYY"),
    recipient: {},
    matter: {}
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

class EmailView extends React.Component {
    render() {

        return <div>
            <h3>Emails</h3>
                { this.props.emails.map((e, i) => {
                    const template = e(this.props.values);
                    return <div key={i} dangerouslySetInnerHTML={{__html: template}} />
                })
            }
        </div>
    }
};


class App extends React.Component {

    update(data) {
        this.props.dispatch(updateValues(data.values));
    }

    changeForm(e) {
        this.props.dispatch(setForm({form: findDOMNode(this.refs.formName).value }));
    }

    submit(data, type) {
        if(type === 'Reset'){
            this.props.dispatch(updateValues(DEFAULT_DATA));
        }
        else{
            let filename;
            this.props.dispatch(renderDocument({formName: this.props.active.form,
                    values: {...this.props.active.values, mappings: FORMS[this.props.active.form].schema.mappings }}))
                .then((response) => {
                    if(response.error){
                        throw response.error;
                    }
                    const disposition = response.response.headers.get('Content-Disposition')
                    filename = /filename[^;=\n]*="?((['"]).*?\2|[^;\n]*)"?/.exec(disposition)[1];
                    debugger
                    return response.response.blob()
                })
                .then(blob => {
                    saveAs(blob, filename);
                })
                .catch(() => {
                });
            }
    }

    fetching() {
        return <div className="modal" tabIndex="-1" role="dialog" style={{display: 'block'}}>
            <div className="modal-dialog">
            <div className="modal-content">
            <div className="modal-header">
            <h3>Processing...</h3>
            </div>
            <div className="modal-body">
            <div className="progress">
                 <div className="progress-bar progress-bar-striped active" style={{width: "100%"}}>

                </div>
                </div>
            </div>
            </div>
            </div>
        </div>
    }

    error() {
        return <div className="modal" tabIndex="-1" role="dialog" style={{display: 'block'}}>
            <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Could not generate file</h3>
                </div>
                <div className="modal-body">
                    Probably due to missing values.
                </div>
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={() => this.props.dispatch(hideError())}>Ok</button>
                </div>
            </div>
            </div>
        </div>
    }

    render() {
        console.log(this.props)
        return <div className="container">
            <div className="controls">
                <form className="form-horizontal">
                    <FieldWrapper label="select" title="Form">
                      <select ref="formName" className="form-control" onChange={::this.changeForm} value={this.props.active.form}>
                            { Object.keys(FORMS).map((m, i)=>{
                                return <option key={i} value={m}>{m}</option>
                            })}
                      </select>
                    </FieldWrapper>
                </form>
                <Form className="form-horizontal"
                    buttons={['Reset', 'Generate File']}
                    fieldWrapper={FieldWrapper}
                    schema={FORMS[this.props.active.form].schema}
                    update={::this.update}
                    values={this.props.active.values}
                    handlers={handlers}
                    onSubmit={::this.submit} />
            </div>
            { this.props.status.fetching && this.fetching() }
            { this.props.status.error && this.error() }
            { FORMS[this.props.active.form].emails && <EmailView values={this.props.active.values} emails={FORMS[this.props.active.form].emails} /> }
        </div>
    }
}

const ConnectedApp = connect(state => state)(App)

render( <Provider store = {store} >
    <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)




