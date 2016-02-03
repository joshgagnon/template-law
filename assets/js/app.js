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
import './helpers';
import moment from 'moment';
import FORMS from './schemas';



console.log(FORMS);

const DEFAULT_DATA = {
    active: {
        values: {
            dateString: moment().format("DD MMMM YYYY")
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


const handlers = {
    'textarea': TextArea,
    'date': DateInput
}




class FieldWrapper extends React.Component {

    renderControlledField(classes){
        return <div className={classes} key={this.props.label} >
            <label htmlFor={this.props.label} className="col-sm-3 col-xs-12 control-label">{this.props.title}</label>
            <div className="col-sm-7 col-xs-7">
                {  this.props.errors && <span className="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span> }
                {  this.props.children }
                { this.props.description && this.description() }
            </div>
            <div className="col-sm-2 col-xs-5">
                <div className="btn-group" role="group">
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
        return <em>{this.props.description}</em>
    }

    render() {
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
        return <fieldset className="form-section form-subsection">
            <label htmlFor={this.props.label} className="col-sm-2 col-xs-12 control-label">{this.props.title}</label>
            <div className="col-sm-7 col-xs-7">
                { this.props.children }
            </div>
            {!this.props.isLastItem  && <div className="col-sm-2 col-xs-5">
                <div className="btn-group" role="group">
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
        </fieldset>
    }

    render() {
        if(this.props.schema && this.props.schema.ignore){
            return false;
        }
        if(this.props.canRemoveItem){
            return this.renderControlledSection()
        }
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
        this.props.dispatch(updateValues(data.output));
    }

    changeForm(e) {
        this.props.dispatch(setForm({form: findDOMNode(this.refs.formName).value }));
    }

    reset() {
        this.props.dispatch(updateValues(DEFAULT_DATA.active.values));
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
            .catch(() => {});
    }

    buttons() {
        const valid = !Object.keys(this.props.active.errors).length
        return <p>
            <button className="btn btn-info" onClick={::this.load}>Load</button>
            <button className="btn btn-info" onClick={::this.save}>Save</button>
            <button className="btn btn-warning" onClick={::this.reset}>Reset</button>
            <button className="btn btn-primary" onClick={::this.generate} ref='submit' disabled={!valid}>Generate File</button>
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




