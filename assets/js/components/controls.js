import React from 'react';
import { findDOMNode } from 'react-dom';
import DateInput from './datePicker';
import Form from 'react-json-editor/lib';
import { FieldWrapper, SectionWrapper } from './wrappers';
import FORMS from '../schemas';

function numberWithCommas(x) {
    if(!x.toFixed){
        return "ERROR"
    }
    const parts = x.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

class TextArea extends React.Component {
    render() {
        return <textarea ref="textarea" {...this.props}
        onChange={(e) => this.props.onChange(findDOMNode(this.refs['textarea']).value) }
        className="form-control" rows={3}/>
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

class Invisible extends React.Component {
    render() {
        return null;
    }
}

const handlers = {
    'textarea': TextArea,
    'date': DateInput,
    "readOnly": ReadOnly,
    "readOnlyCurrency": ReadOnlyCurrency,
    'invisible': Invisible
}


export default class Controls extends React.Component {

    buttons() {
        return <p>
            <button className="btn btn-primary"
                onClick={this.props.generate}
                ref='submit'
                disabled={!this.props.valid()}>Generate File</button>
            </p>
    }
    render() {
        return <div className="controls">
                <Form ref="form" className="form-horizontal form-controls"
                buttons={::this.buttons}
                fieldWrapper={FieldWrapper}
                sectionWrapper={SectionWrapper}
                schema={FORMS[this.props.active.form].schema}
                update={this.props.update}
                values={this.props.active.values}
                output={this.props.active.output || this.props.active.values}
                errors={this.props.active.errors}
                handlers={handlers} />
            </div>
    }
}
