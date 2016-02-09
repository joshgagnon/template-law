import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Handlebars from 'handlebars';
import { render, findDOMNode } from 'react-dom';
import { Provider, connect } from 'react-redux';
import StateSaver from './stateSaver';
import DateInput from './datePicker';
import SaveLoadDialogs from './SaveLoadDialogs';
import configureStore from './configureStore';
import Form from 'react-json-editor/lib';
import { updateValues, renderDocument, setForm, hideError, openModal, setView, setPreview, renderPreview } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import './helpers';
import moment from 'moment';
import FORMS from './schemas';
import PDFJS from 'pdfjs-dist'

PDFJS.disableWorker = true;

export function numberWithCommas(x) {
    if(!x.toFixed){
        return "ERROR"
    }
    const parts = x.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

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

class PDF extends React.Component {

    constructor(props) {
        super(props);
        this.state = { };
    }

     _loadPDFDocument(props) {
        if(props.data){
            return PDFJS.getDocument({data: props.data}).then(::this._onDocumentComplete);
        }
    }

    componentDidMount() {
        this._loadPDFDocument(this.props);
    }

    componentWillReceiveProps(newProps) {
        if ((newProps.data && newProps.data !== this.props.data)) {
          this._loadPDFDocument(newProps);
        }
        if (!!this.state.pdf && !!newProps.page && newProps.page !== this.props.page) {
          this.setState({page: null});
          this.state.pdf.getPage(newProps.page)
            .then(::this._onPageComplete);
        }
    }

    shouldComponentUpdate(newProps, newState) {
        if ((newProps.data && newProps.data !== this.props.data)){
            return true;
        }
        if ((newProps.page && newProps.page !== this.props.page)){
            return true;
        }
        if((newState.pdf && newState.pdf !== this.state.pdf) ||
            (newState.page && newState.page !== this.state.page)){
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        clearTimeout(this._renderTimeout);
        this._unmounted = true;
    }

    render() {
        if (!!this.state.page){
            clearTimeout(this._renderTimeout)
            this._renderTimeout = setTimeout(() => {
                const canvas = ReactDOM.findDOMNode(this.refs.pdfCanvas),
                    context = canvas.getContext('2d'),
                    scale = this.props.scale || 1,
                    viewport = this.state.page.getViewport(canvas.width / this.state.page.getViewport(1.0).width);

                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                  };
                this.state.page.render(renderContext);
          });
          return <canvas ref="pdfCanvas" width={1500} heigth={2250}/>
        }
        return <div>Could not load preview.  Please complete all required fields.</div>
    }

    _onDocumentComplete(pdf) {
        if (!this._unmounted) {
            this.setState({ pdf: pdf });
            pdf
                .getPage(this.props.page)
                .then(::this._onPageComplete);
            this.props.onDocumentComplete(pdf.numPages);
        }
    }

    _onPageComplete(page) {
        if(!this._ummounted){
            this.setState({ page: page });
        }
    }
}

class Preview extends React.Component {

    constructor(props) {
        super(props);
        this.state = { pages: 1, page: 0 };
    }

    pdfLoaded(pages) {
        this.setState({pages: pages})
    }

    prev(e) {
        e.preventDefault();
        this.setState({page: Math.abs((this.state.page - 1) % this.state.pages)})
    }

    next(e) {
        e.preventDefault();
        this.setState({page: Math.abs((this.state.page + 1) % this.state.pages)})
    }

    render() {
        return <div className="preview">
            <p>
            <button className="btn btn-info" onClick={this.props.update}>Update</button>
            </p>
            { this.state.pages > 1 && <p>
                <button className="btn btn-info" onClick={::this.prev}><span className="glyphicon glyphicon-arrow-left"/></button>
                <button className="btn btn-info" onClick={::this.next}><span className="glyphicon glyphicon-arrow-right"/></button>
                </p>
            }
            <PDF onDocumentComplete={::this.pdfLoaded} data={this.props.data} page={this.state.page+1} />
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

    changeView() {
        this.props.dispatch(setView(findDOMNode(this.refs.view).value))
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

    generatePreview(e) {
        e && e.preventDefault();
        if(this.props.preview.fetching || this.props.preview.error || this.props.preview.current || !this.valid()){
            return;
        }
        this.props.dispatch(renderPreview({formName: this.props.active.form,
                values: {...this.props.active.output, fileType: 'pdf', mappings: FORMS[this.props.active.form].schema.mappings }}))
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

    buttons() {
        return <p>
            <button className="btn btn-primary" onClick={::this.generate} ref='submit' disabled={!this.valid()}>Generate File</button>
            </p>
    }

    valid() {
        return !Object.keys(this.props.active.errors).length
    }

    componentDidMount() {
        this.eagerPreview();
    }

    componentDidUpdate() {
        this.eagerPreview();
    }

    eagerPreview() {
        if(this.props.view.mode === 'preview' && !this.props.preview.preview){
            this.generatePreview()
        }
    }

    render() {
        let classes = '';
        if(this.props.view.mode === 'columns'){
            classes += 'container columns '
        }
        else if(this.props.view.mode === 'preview'){
            classes += 'container-fluid has-preview';
        }
        else{
            classes += "container ";
        }
        console.log('PROPS', this.props)
        return <div className="main">
                <div className="container">
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
                            <FieldWrapper label="select" title="View">
                              <select ref="view" className="form-control" onChange={::this.changeView} value={this.props.view.mode}>
                                <option key={0} value={'single'}>Single</option>
                                <option key={1} value={'columns'}>Columns</option>
                                <option key={2} value={'preview'}>Preview</option>
                              </select>
                            </FieldWrapper>
                        </div>
                        </div>
                         <div><p>
                            <button className="btn btn-info" onClick={::this.load}>Load</button>
                            <button className="btn btn-info" onClick={::this.save}>Save</button>
                            <button className="btn btn-warning" onClick={::this.reset}>Reset</button>
                            </p></div>
                    </form>
                </div>
                <div className={classes}>
                    <div className="controls">
                        <Form ref="form" className="form-horizontal form-controls"
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
                    { this.props.view.mode === 'preview' && <Preview data={this.props.preview.preview } update={ ::this.generatePreview } /> }
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




