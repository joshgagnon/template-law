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
import { updateValues, renderDocument, setForm, hideError, openModal, toggleColumns } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import './helpers';
import moment from 'moment';
import FORMS from './schemas';


export function numberWithCommas(x) {
    const parts = x.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


console.log(FORMS);

const DEFAULT_DATA = {
    active: {
        values: {
        },
        errors: {},
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


class ReadOnly extends React.Component {
    render() {
        return <div className="text read-only">{ this.props.value }</div>
    }
}

class ReadOnlyCurrency extends React.Component {
    render() {
        return <div className="text read-only">${ numberWithCommas(this.props.value || 0) }</div>
    }
}

const handlers = {
    'textarea': TextArea,
    'date': DateInput,
    "readOnly": ReadOnly,
    "readOnlyCurrency": ReadOnlyCurrency
}




class FieldWrapper extends React.Component {

    renderControlledField(classes){
        return <div className={classes} key={this.props.label} >
            <label htmlFor={this.props.label} className="col-sm-3 col-xs-12 control-label">{this.props.title}</label>
            <div className="col-sm-6 col-xs-7">
                {  this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
                {  this.props.children }
                { this.props.description && this.description() }
            </div>
            <div className="col-sm-3 col-xs-5">
                <div className="btn-group btn-group-xs " role="group">
                    <button className="btn btn-default" onClick={this.props.children.props.moveUp}>
                        <span className="glyphicon glyphicon-arrow-up" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.children.props.moveDown}>
                        <span className="glyphicon glyphicon-arrow-down" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.children.props.removeItem}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true" ></span>
                    </button>
                    </div>
            </div>
        </div>
    }

    description() {
        return <em className="description">{this.props.description}</em>
    }

    render() {
        const width = this.props.schema && this.props.schema['x-hints'] &&
            this.props.schema['x-hints'].form && this.props.schema['x-hints'].form.width;
        if(width && false){
            const classes = 'col-sm-' + (12/width);
            return <div className={classes}>
                { this.renderField() }
                </div>
        }
        return this.renderField();
    }

    renderField() {
        let classes = 'form-group ';
        if(this.props.errors){
            classes += 'has-error has-feedback ';
        }
        if(this.props.schema && this.props.schema.ignore){
            return false;
        }
        if(this.props.children.props.isArrayItem && !this.props.children.props.isLastItem){
            return this.renderControlledField(classes, this.props)
        }

        return <div className={classes} key={this.props.label} >
            <label htmlFor={this.props.label} className="col-sm-3 control-label">{this.props.title}</label>
                <div className="col-sm-9">
                    { this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
                    { this.props.children }
                    { this.props.description && this.description() }
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

    renderControlledSection(){
        let classes = "fieldset form-section form-subsection with-controls"
        return <div  className={ classes }>
            <div>
            {/*<label htmlFor={this.props.label} className="col-sm-2 col-xs-12 control-label">{this.props.title}</label> */}
            <div className="col-sm-9 col-xs-7">
                { this.props.children }
            </div>
            { <div className="col-sm-3 col-xs-5 list-controls">
                <div className="btn-group  btn-group-xs" role="group">
                    <button className="btn btn-default" onClick={this.props.moveUp}>
                        <span className="glyphicon glyphicon-arrow-up" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.moveDown}>
                        <span className="glyphicon glyphicon-arrow-down" aria-hidden="true" ></span>
                    </button>
                    <button className="btn btn-default" onClick={this.props.removeItem}>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true" ></span>
                    </button>
                    </div>
            </div> }
            <div className="row"><hr/></div>
        </div>
        </div>
    }

    renderSection() {
        if(this.props.canRemoveItem){
            return this.renderControlledSection()
        }
        return <div className="fieldset form-section form-subsection">
            { this.props.title && <legend>{ this.props.title } { this.props.errors && this.errors() }</legend>}
            { (!this.props.title && this.props.errors) &&  <legend>{ this.errors() }</legend>}
            <div>
            { this.props.children }
            { this.props.addItem && <div className="add-item"><button className="btn btn-default" onClick={this.props.addItem}>Add Entry</button></div>}
            </div>
            </div>
    }

    render() {
        return this.renderSection();

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
        this.props.dispatch(updateValues(data));
    }

    changeForm(e) {
        this.props.dispatch(setForm({form: findDOMNode(this.refs.formName).value }));
    }

    changeColumns() {
        this.props.dispatch(toggleColumns(findDOMNode(this.refs.columns).checked))
    }

    reset(e) {
        e.preventDefault();
        this.props.dispatch(updateValues({values: DEFAULT_DATA.active.values, output: DEFAULT_DATA.active.values}));
    }

    save(e) {
        e.preventDefault();
        this.props.dispatch(openModal('save'))
    }

    load(e) {
        e.preventDefault();
        this.props.dispatch(openModal('load'));
    }

    generate(e) {
        e.preventDefault();
        let filename;
        this.props.dispatch(renderDocument({formName: this.props.active.form,
                values: {...this.props.active.output, mappings: FORMS[this.props.active.form].schema.mappings }}))
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
            .catch(() => {});
    }

    buttons() {
        const valid = !Object.keys(this.props.active.errors).length
        return <p>
            <button className="btn btn-primary" onClick={::this.generate} ref='submit' disabled={!valid}>Generate File</button>
            </p>
    }

    render() {
        let classes = "controls "
        if(this.props.view.columns){
            classes += 'columns '
        }
        console.log('PROPS', this.props)
        return <div className="container">
            <div className={classes}>
                <form className="form-horizontal">
                    <div className="row">
                        <div className="col-md-8">
                        <FieldWrapper label="select" title="Form">
                          <select ref="formName" className="form-control" onChange={::this.changeForm} value={this.props.active.form}>
                                { Object.keys(FORMS).map((m, i)=>{
                                    return <option key={i} value={m}>{m}</option>
                                })}
                          </select>
                        </FieldWrapper>
                    </div>
                    <div className="col-md-4">
                        <FieldWrapper label="select" title="Columns">
                            <input ref="columns" type="checkbox" onChange={::this.changeColumns} value={this.props.view.columns}/>
                        </FieldWrapper>
                    </div>
                    </div>
                     <div><p>
                        <button className="btn btn-info" onClick={::this.load}>Load</button>
                        <button className="btn btn-info" onClick={::this.save}>Save</button>
                        <button className="btn btn-warning" onClick={::this.reset}>Reset</button>
                        </p></div>
                </form>
                <Form ref="form" className="form-horizontal"
                    buttons={::this.buttons}
                    fieldWrapper={FieldWrapper}
                    sectionWrapper={SectionWrapper}
                    schema={FORMS[this.props.active.form].schema}
                    update={::this.update}
                    values={this.props.active.values}
                    output={this.props.active.output || this.props.active.values}
                    errors={this.props.active.errors}
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




