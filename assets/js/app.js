import 'babel-polyfill';
import React from 'react';
import Handlebars from 'handlebars';
import { render, findDOMNode } from 'react-dom';
import { Provider, connect } from 'react-redux';
import StateSaver from './stateSaver';
import DateInput from './datePicker';
import SaveLoadDialogs from './SaveLoadDialogs';
import configureStore from './configureStore';
import Form from 'react-json-editor/lib';
import { updateValues, renderDocument, setForm, hideError, openModal } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import letterTemplateSchema from '../../templates/Letter Template.json';
import letterOfEngagementSchema from '../../templates/Letter of Engagement (General).json'
import './helpers';
import moment from 'moment';
import merge from 'deepmerge'

const FORMS = {
    /*'Land Transfer Tax Statement': {
        schema: landTransferTaxStatementSchema
    },*/
    'G01: Letter': {
        schema: letterTemplateSchema
    },
    'G02: Letter of Engagement': {
        schema: merge(letterTemplateSchema, letterOfEngagementSchema)
    }
}


console.log(merge(letterTemplateSchema, letterOfEngagementSchema));
const DEFAULT_DATA = {
    active: {
        values: {
            dateString: moment().format("DD MMMM YYYY")
        },
        errors: {__: 'invalid'},
        form: 'G01: Letter'
    }
};
let data;

try{
    data = JSON.parse(localStorage['currentView']);
}
catch(e){
    data = DEFAULT_DATA;
}

if(!FORMS[data.active.form]){
    data.active.form = DEFAULT_DATA.active.form;
}

const store = configureStore(data);


class TextArea extends React.Component {
    render() {
        return <input/>
    }
}


const handlers = {
    'textarea': TextArea,
    'date': DateInput
}


class FieldWrapper extends React.Component {
  render() {
    let classes = 'form-group ';
    if(this.props.errors){
        classes += 'has-error has-feedback ';
    }
    if(this.props.schema && this.props.schema.ignore){
        return false;
    }
    return <div className={classes} key={this.props.label} >
        <label htmlFor={this.props.label} className="col-sm-4 control-label">{this.props.title}</label>
        <div className="col-sm-6">
            { this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
            { this.props.children }
        </div>
      </div>
  }
}

class SectionWrapper extends React.Component {
    errors() {
        return <div className="form-group has-error has-feedback">
            { this.props.errors.map((e, i) => {
                return <label key={i} className="control-label">{ e }</label>
            }) }
        </div>
    }


    render() {
        return <fieldset className="form-section form-subsection">
        { this.props.title && <legend>{ this.props.title } { this.props.errors && this.errors() }</legend>}
            { this.props.children }
            </fieldset>
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

class Fetching extends React.Component {
    render() {
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
}


class ErrorDialog extends React.Component {
    render() {
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
                    <button className="btn btn-primary" onClick={this.props.close}>Ok</button>
                </div>
            </div>
            </div>
        </div>
    }
}

class App extends React.Component {

    update(data) {
        this.props.dispatch(updateValues(data.values, data.errors));
    }

    changeForm(e) {
        this.props.dispatch(setForm({form: findDOMNode(this.refs.formName).value }));
    }

    reset() {
        this.props.dispatch(updateValues(DEFAULT_DATA.active.values, DEFAULT_DATA.active.errors));
    }

    save() {
        this.props.dispatch(openModal('save'))
    }

    load() {
        this.props.dispatch(openModal('load'));
    }

    generate() {
        let filename;
        this.props.dispatch(renderDocument({formName: this.props.active.form,
                values: {...this.props.active.values, mappings: FORMS[this.props.active.form].schema.mappings }}))
            .then((response) => {
                if(response.error){
                    throw response.error;
                }
                const disposition = response.response.headers.get('Content-Disposition')
                filename = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)[1].replace(/"/g, '');
                return response.response.blob()
            })
            .then(blob => {
                saveAs(blob, filename);
            })
            .catch(() => {
            });
    }

    buttons() {
        const valid = !Object.keys(this.props.active.errors || DEFAULT_DATA.active.errors).length;
        return <p>
            <button className="btn btn-info" onClick={::this.load}>Load</button>
            <button className="btn btn-info" onClick={::this.save}>Save</button>
            <button className="btn btn-warning" onClick={::this.reset}>Reset</button>
            <button className="btn btn-primary" onClick={::this.generate} disabled={!valid}>Generate File</button>
            </p>
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
                <Form ref="form" className="form-horizontal"
                    buttons={::this.buttons}
                    fieldWrapper={FieldWrapper}
                    sectionWrapper={SectionWrapper}
                    schema={FORMS[this.props.active.form].schema}
                    update={::this.update}
                    values={this.props.active.values}
                    handlers={handlers} />
            </div>
            { this.props.status.fetching && <Fetching /> }
            { this.props.status.error && <ErrorDialog close={() => this.props.dispatch(hideError())}  /> }
            { FORMS[this.props.active.form].emails && <EmailView values={this.props.active.values} emails={FORMS[this.props.active.form].emails} /> }
            <StateSaver />
            <SaveLoadDialogs />
        </div>
    }
}

const ConnectedApp = connect(state => state)(App)

render( <Provider store = {store} >
        <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)




