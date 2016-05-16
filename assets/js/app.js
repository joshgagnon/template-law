import 'babel-polyfill';
import React from 'react';
import Handlebars from 'handlebars';
import { render, findDOMNode } from 'react-dom';
import { Provider, connect } from 'react-redux';
import StateSaver from './components/stateSaver';
import SaveLoadDialogs from './components/saveLoadDialogs';
import configureStore from './configureStore';
import Preview from './components/preview';
import Controls from './components/controls';
import { FieldWrapper, SectionWrapper } from './components/wrappers';
import { updateValues, renderDocument, setForm, hideError, openModal, setPageView, setFormView, setPreview, renderPreview } from './actions';
import '../styles.scss';
import { saveAs } from 'filesaver.js';
import './helpers';
import deepmerge from './deepmerge'
import moment from 'moment';
import FORMS from './schemas';


const DEFAULT_DATA = {
    active: {
        values: {
        },
        errors: {},
        form: 'Super Set'
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


class App extends React.Component {

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
                <option key={0} value={'single'}>Full Form</option>
                <option key={1} value={'columns'}>Errors Only</option>
              </select>
            </FieldWrapper>
    }

    renderTemplateSelect() {
        return <div className="container">
            <SectionWrapper label="select" title="Output Templates">
            { Object.keys(FORMS).map((key, i)=>{
                if(!FORMS[key].SUPERSET){
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
                            <button className="btn btn-info" onClick={::this.load}>Load</button>
                            <button className="btn btn-info" onClick={::this.save}>Save</button>
                            <button className="btn btn-warning" onClick={::this.reset}>Reset</button>
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

const ConnectedApp = connect(state => state)(App)

render( <Provider store = {store} >
        <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)




