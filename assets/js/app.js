import 'babel-polyfill';
import React from 'react';
import Handlebars from 'handlebars';
import { render, findDOMNode } from 'react-dom';
import { Provider, connect } from 'react-redux';
import StateSaver from './components/stateSaver';
import Modals from './components/modals';
import configureStore from './configureStore';
import Preview from './components/preview';
import Controls from './components/controls';
import { FieldWrapper, SectionWrapper } from './components/wrappers';
import { updateValues, renderDocument, setForm, hideError, openModal, setPageView, setFormView, setPreview, renderPreview, selectTemplate } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import './helpers';
import deepmerge from './deepmerge'
import moment from 'moment';
import FORMS from './schemas';
import validator from 'react-json-editor/lib/validate';
import Promise from 'bluebird';


const DEFAULT_DATA = {
    active: {
        values: {
        },
        errors: {},
        form: 'Conveyancing Superset'
    }
};

let data = DEFAULT_DATA;


const store = configureStore(data);


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

function applyAliases(values, aliases={}){
    values = deepmerge({}, values);
    Object.keys(aliases).map(k => {
        values[aliases[k]] = values[k];
    });
    return values;
}


class AppOLDDELETE extends React.Component {

    update(data) {
        this.props.dispatch(updateValues(data));
    }

    changePageView(e) {
        this.props.dispatch(setPageView(findDOMNode(this.refs.pageView).value));
    }

    changeFormView() {
        this.props.dispatch(setFormView(findDOMNode(this.refs.formView).value))
    }

    reset(e) {
        e.preventDefault();
        const defaults = {...DEFAULT_DATA.active.values, ...(FORMS[this.props.active.form].schema.defaults || {})};
        this.props.dispatch(updateValues({values: defaults, output: defaults}));
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
                values: {...applyAliases(this.props.active.output, FORMS[this.props.active.form].schema.aliases),
                    mappings: FORMS[this.props.active.form].schema.mappings }}))
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

    generatePreview(e) {
        e && e.preventDefault();
        if(this.props.preview.fetching || this.props.preview.error || this.props.preview.current || !this.valid()){
            return;
        }
        this.props.dispatch(renderPreview({formName: this.props.active.form,
                values: {...applyAliases(this.props.active.output, FORMS[this.props.active.form].schema.aliases),
                fileType: 'pdf', mappings: FORMS[this.props.active.form].schema.mappings }}))
            .then((response) => {
                return response.response.blob()
            })
            .then(blob => {

                const fileReader = new FileReader();
                fileReader.onload = () => {
                    this.props.dispatch(setPreview(fileReader.result));
                };
                fileReader.readAsArrayBuffer(blob);
            })
            .catch(() => {});
    }

    valid() {
        return !Object.keys(this.props.active.errors).length
    }

    componentDidMount() {
        this.eagerPreview();
        this.props.dispatch(setForm({form: this.props.active.form }));
    }

    componentDidUpdate() {
        this.eagerPreview();
    }

    eagerPreview() {
        if(this.props.pageView.mode === 'preview' && !this.props.preview.preview){
            this.generatePreview()
        }
    }

    renderPageViewSelect() {
        return <FieldWrapper label="select" title="Page View">
              <select ref="pageView" className="form-control" onChange={::this.changePageView} value={this.props.pageView.mode}>
                <option key={0} value={'single'}>Single</option>
                <option key={1} value={'columns'}>Columns</option>
                <option key={2} value={'preview'}>Preview</option>
              </select>
            </FieldWrapper>
    }

    renderFormViewSelect() {
        return <FieldWrapper label="select" title="Form View">
              <select ref="formView" className="form-control" onChange={::this.changeFormView} value={this.props.formView.mode}>
                <option key={0} value={'full'}>Full Form</option>
                <option key={1} value={'selected'}>Selected Forms Only</option>
              </select>
            </FieldWrapper>
    }

    renderTemplateSelect() {
        return <div className="container">
            <SectionWrapper label="select" title="Output Templates">
            { Object.keys(FORMS).map((key, i)=>{
                if(!FORMS[key].schema.SUPERSET){
                    return <div key={i} className="row"><div className="form-group ">
                        <label className="col-sm-4 control-label text-right">{ key }</label>
                        <div className="col-sm-1"><input  type="checkbox" /></div>
                    </div>
                    </div>
                }
            }) }

        </SectionWrapper>
        </div>
    }

    render() {
        let classes = '';
        if(this.props.pageView.mode === 'columns'){
            classes += 'container columns '
        }
        else if(this.props.pageView.mode === 'preview'){
            classes += 'container-fluid has-preview';
        }
        else{
            classes += "container ";
        }
        console.log(this.props)
        return <div className="main">
                <div className="container">
                    <form className="form-horizontal">
                        <div className="row">
                            <div className="col-md-4 col-md-offset-2">
                                { this.renderFormViewSelect() }
                            </div>
                            <div className="col-md-4">
                                { this.renderPageViewSelect() }
                            </div>
                        </div>
                         <div><p>
                            <button className="btn btn-warning" onClick={::this.reset}>New Matter</button>
                            <button className="btn btn-info" onClick={::this.load}>Load Matter</button>
                            <button className="btn btn-info" onClick={::this.save}>Save Matter</button>
                            </p></div>
                    </form>
                </div>
                <div className={classes}>
                    <Controls
                        generate={::this.generate}
                        valid={::this.valid}
                        active={this.props.active}
                        update={::this.update} />
                    { this.props.pageView.mode === 'preview' && <Preview data={this.props.preview.preview } update={ ::this.generatePreview } /> }
            </div>
            { this.props.status.fetching && <Fetching /> }
            { this.props.status.error && <ErrorDialog close={() => this.props.dispatch(hideError())}  /> }
            { FORMS[this.props.active.form].emails && <EmailView values={this.props.active.values} emails={FORMS[this.props.active.form].emails} /> }
            <StateSaver />
            <SaveLoadDialogs />
            { this.renderTemplateSelect() }
        </div>
    }
}


class Header extends React.Component {
    render() {
        return <nav className="navbar navbar-default navbar-static-top">
                <div className="container">
                <form className="navbar-form">
                    <div className="text-center">
                        <div className="form-group">
                        <button className="btn btn-warning" onClick={::this.props.createNew}>New Matter</button>
                            </div>
                        <div className="form-group">
                            <button className="btn btn-info" onClick={::this.props.load}>Load Matter</button>
                            </div>
                        <div className="form-group">
                            <button className="btn btn-info" onClick={::this.props.save}>Save Matter</button>
                            </div>
                            </div>
                        </form>
                </div>
            </nav>
    }
}


class Navs extends React.Component {
    render() {
        return <nav>
            <ul className="pager">
            <li><Link to='/full_populate' >Edit Mega Ultra Form</Link></li>
                <li><Link to='/create'>Create Templates</Link></li>
            </ul>
         </nav>
    }
}



class FullForm extends React.Component {
    componentDidMount() {
        //this.props.update()
    }

    render() {
        const classes = "container";
        return <div className={classes}>
                <Navs />

                    <Controls
                        active={{...this.props.active, form: 'Conveyancing Superset'}}
                        update={::this.props.update} />
            </div>
    }
}


class CreateTemplates extends React.Component {
    constructor(props) {
        super(props);
        this.handleDownload = ::this.handleDownload;
    }

    handleChange(key) {
        this.props.selectTemplate({[key]: findDOMNode(this.refs[key]).checked});
    }

    handleEdit(key) {
        this.props.setForm({form: key});
    }

    handleDownload() {
        const keys = Object.keys(this.props.templates).reduce((acc, key) => {
            if(this.props.templates[key]){
                acc.push(key)
            }
            return acc;
        }, []);
        this.props.generate(keys);
    }

    handlePreview(key) {
        this.props.generatePreview(key);
    }

    validate(key) {
        return validator(FORMS[key].schema, this.props.active.values, FORMS[key].schema);
    }

    reportValid(key) {
        if(this.props.templates[key]){
           const errors = this.validate(key);
           if(!errors.length){
                return <span className="validation-success">Valid</span>
           }
           return <span className="validation-errors">{errors.length} Errors</span>
        }
    }

    editButton(key) {
        if(this.props.templates[key]){
            return <a className="edit" href="#" onClick={() => this.handleEdit(key)}>Edit</a>
        }
    }

    previewButton(key) {
        if(this.props.templates[key] && !this.validate(key).length){
            return <a className="edit" href="#" onClick={() => this.handlePreview(key)}>Preview</a>
        }
    }

    renderTemplateSelect() {
        return <form><SectionWrapper label="select">
            { Object.keys(FORMS).map((key, i)=>{
                if(!FORMS[key].schema.SUPERSET){
                    return <div key={i} className="row"><div className="form-group ">
                        <label className="col-sm-6 control-label text-right">{ key }</label>
                        <div className="col-sm-3"><input  ref={key} type="checkbox"
                            onChange={() => this.handleChange(key)} checked={this.props.templates[key]}/>
                            { this.reportValid(key) }
                            { this.editButton(key) }
                            { this.previewButton(key) }
                        </div>
                    </div>
                    </div>
                }
            }) }

        </SectionWrapper>
        </form>
    }

    renderForm() {
        if(!FORMS[this.props.active.form].schema.SUPERSET){
            return <Controls
                        active={this.props.active}
                        update={::this.props.update} />
        }
    }

    render() {
        const classes = "container create-templates";
        return <div className={classes}>
                <Navs />
                { this.renderTemplateSelect() }
             <div className="btn-row">
                    <button className="btn btn-primary btn-lg" onClick={this.handleDownload}>Download</button>
                </div>
                { this.renderForm() }
                <Preview data={this.props.preview.preview } />
            </div>
    }
}



class App extends React.Component {

    constructor(props) {
        super(props);
        this.createNew = ::this.createNew;
        this.save = ::this.save;
        this.load = ::this.load;
        this.update = ::this.update;
        this.selectTemplate = ::this.selectTemplate;
        this.generate = ::this.generate;
        this.generatePreview = ::this.generatePreview;
        this.setForm = ::this.setForm;
    }

    createNew(e) {
        e.preventDefault();
        this.props.dispatch(openModal('new'))
    }

    update(data) {
        this.props.dispatch(updateValues(data));
    }

    save(e) {
        e.preventDefault();
        this.props.dispatch(openModal('save'))
    }

    load(e) {
        e.preventDefault();
        this.props.dispatch(openModal('load'));
    }

    selectTemplate(data) {
        this.props.dispatch(selectTemplate(data));
    }

    setForm(data) {
        this.props.dispatch(setForm(data));
    }

    generate(forms) {
        let filename;
        const filenameParts = [];
        const date = moment().format('D MMM YYYY');
        if(this.props.active.output.filename){
            filenameParts.push(this.props.active.output.filename);
        }
        filenameParts.concat(this.props.active.schema.description, this.props.active.output.matterId, date);
        Promise.each(forms, (formKey) => {
            return this.props.dispatch(renderDocument({formName: formKey,
                    values: {...applyAliases(this.props.active.output || {}, FORMS[formKey].schema.aliases || {}),
                        filename: filenameParts.join(' - '),
                        mappings: FORMS[formKey].schema.mappings }}))
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
        });
    }

    generatePreview(form) {
        if(this.props.preview.fetching || this.props.preview.error || this.props.preview.current){
            return;
        }
        this.props.dispatch(renderPreview({formName: this.props.active.form,
                values: {...applyAliases(this.props.active.output || {}, FORMS[this.props.active.form].schema.aliases),
                fileType: 'pdf', mappings: FORMS[this.props.active.form].schema.mappings }}))
            .then((response) => {
                return response.response.blob()
            })
            .then(blob => {

                const fileReader = new FileReader();
                fileReader.onload = () => {
                    this.props.dispatch(setPreview(fileReader.result));
                };
                fileReader.readAsArrayBuffer(blob);
            })
            .catch(() => {});
    }

    render(){
        return <div className="main">
            <Header createNew={this.createNew} save={this.save} load={this.load} />
            <Modals />
            { React.Children.map(this.props.children,
                 (child) => React.cloneElement(child, {
                    active: this.props.active,
                    update: this.update,
                    selectTemplate: this.selectTemplate,
                    templates: this.props.templates,
                    generate: this.generate,
                    generatePreview: this.generatePreview,
                    setForm: this.setForm,
                    preview: this.props.preview
                })) }
            { this.props.status.fetching && <Fetching />  }
        </div>
    }
}

class ModeChoice extends React.Component {
    render(){
        return <div className="container">
            <div className="col-md-6">
                <Link to='/full_populate' className="btn btn-lg btn-default">Edit Mega Ultra Form</Link>
            </div>
            <div className="col-md-6">
                <Link to='/form_check' className="btn btn-lg btn-default">Create Templates</Link>

            </div>
        </div>
    }
}

const ConnectedApp = connect(state => state)(App)

import { Router, Route, IndexRoute, browserHistory, Link } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

const history = syncHistoryWithStore(browserHistory, store);

render( <Provider store = {store} >
          <Router history={history}>
              <Route path="/" component={ConnectedApp}>
                    <IndexRoute component={FullForm} />
                    <Route path="/create" component={CreateTemplates} />
                    <Route path="/full_populate" component={FullForm} />
              </Route>
        </Router>
    </Provider>,
    document.getElementById('root')
)




