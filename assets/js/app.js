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
import engagementSchema from '../../templates/Letter of Engagement.json';
import engagementEmail from '../../templates/emails/Letter of Engagement.html';
import clientAuthoritySchema from '../../templates/Client Authority.json';
import letterTemplateSchema from '../../templates/Letter Template.json';
import landTransferTaxStatementSchema from '../../templates/Land Transfer Tax Statement.json';
import './helpers';
import moment from 'moment';
//import validator from 'is-my-json-valid';
//import jjv from 'jjv';
//import jsonGate from 'json-gate';
import ajv from 'ajv';

//const env = jjv()


const FORMS = {
    /*'Land Transfer Tax Statement': {
        schema: landTransferTaxStatementSchema
    },*/
    'Letter Template': {
        schema: letterTemplateSchema
    },
   /* 'Letter of Engagement': {
        schema: engagementSchema,
        emails: [
            engagementEmail
        ]
    },
    'Client Authority and Instruction': {
        schema: clientAuthoritySchema
    }*/
}

const DEFAULT_DATA = {
    active: {
        values: {
            dateString: moment().format("DD MMMM YYYY")
        },
        form: 'Letter of Engagement'
    }
};
let data;

try{
    data = JSON.parse(localStorage['currentView']);
}
catch(e){
    data = DEFAULT_DATA;
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
        <label htmlFor={this.props.label} className="col-sm-4 control-label">Errors</label>
        <div className="col-sm-6">
            { this.props.errors.map((e, i) => {
                return <label key={i} className="control-label">{ e }</label>
            }) }
        </div>
        </div>
    }


    render() {
        return <fieldset className="form-section form-subsection">
        { this.props.title && <legend>{ this.props.title }</legend>}
            { this.props.children }
            { this.props.errors && this.errors() }
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

    /*componentWillMount() {
        this.validators = Object.keys(FORMS).reduce((acc, key) => {
            acc[key] = validator(FORMS[key].schema, {
              verbose: true,
              greedy: true});
            return acc;
        }, {});
    }*/

    /*componentWillMount() {
        this.validators = Object.keys(FORMS).reduce((acc, key) => {
            acc[key] = jsonGate.createSchema(FORMS[key].schema);
            return acc;
        }, {});
    }*/

    update(data) {
        this.props.dispatch(updateValues(data.values));
    }

    changeForm(e) {
        this.props.dispatch(setForm({form: findDOMNode(this.refs.formName).value }));
    }

    submit(data, type) {
        switch(type){
            case 'Reset':
                this.props.dispatch(updateValues(DEFAULT_DATA));
                break;
            case 'Save':
                this.props.dispatch(openModal('save'))
                break;
            case 'Load':
                this.props.dispatch(openModal('load'));
                break;
            default:
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
    }
    validate(schema, data, context) {
        const a = ajv({allErrors: true, errorDataPath: 'property'});
        const validator = a.compile(schema);
        validator(data);
        console.log(validator.errors)
        if(!validator.errors){
            return [];
        }
        const errors = validator.errors.map(e => {
            if(e.dataPath){
                const path = e.dataPath.replace(/^./, '').split('.');
                if(e.params.missingProperty){
                    path.push(e.params.missingProperty)
                }
                return {path: path, errors: [e.message]}
            }
            else if(e.params.missingProperty){
                return {path: [e.params.missingProperty], errors: [e.message]}
            }
            else
                return null;
        }).filter(x => x)
        return errors

    }

    /*validate(schema, output, context) {
        const valid = this.validators[this.props.active.form](output);
        console.log(this.validators[this.props.active.form].errors)
        const errors = this.validators[this.props.active.form].errors.map(e => {
            return {path: e.field.replace(/^data./, '').split('_'), errors: [e.message]}
        })
        console.log(errors);
        return errors;

    }

    validate(schema, output, context) {
        const valid = env.validate(schema, output);
        console.log(valid)
        return [];
        return errors;

    }*/

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
                    buttons={['Load', 'Save', 'Reset', 'Generate File']}
                    fieldWrapper={FieldWrapper}
                    sectionWrapper={SectionWrapper}
                    schema={FORMS[this.props.active.form].schema}
                    update={::this.update}
                    validate={::this.validate}
                    values={this.props.active.values}
                    handlers={handlers}
                    onSubmit={::this.submit} />
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




