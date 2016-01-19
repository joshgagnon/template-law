import 'babel-polyfill'
import React from 'react';
import { render, findDOMNode } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './configureStore'
import Form from 'react-json-editor/lib';
import { updateValues, renderDocument, setForm, hideError } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import engagementSchema from '../../templates/Letter of Engagement.json';
import clientAuthoritySchema from '../../templates/Client Authority.json';
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
    'Letter of Engagement': {
        schema: engagementSchema
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
                    filename = /filename[^;=\n]*="((['"]).*?\2|[^;\n]*)"/.exec(disposition)[1];
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
        return <div className="container">
            <div className="controls">
                <form className="form-horizontal">
                    <FieldWrapper label="select" title="Form">
                      <select ref="formName" className="form-control" onChange={::this.changeForm}>
                            { Object.keys(FORMS).map((m, i)=>{
                                return <option key={i}>{m}</option>
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
            {this.props.status.fetching && this.fetching() }
            {this.props.status.error && this.error() }
        </div >
    }
}

const ConnectedApp = connect(state => state)(App)

render( <Provider store = {store} >
    <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)




