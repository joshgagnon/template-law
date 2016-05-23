import React from 'react';
import { findDOMNode } from 'react-dom';
import DateInput from './datePicker';
import Form from 'react-json-editor/lib';
import { FieldWrapper, SectionWrapper } from './wrappers';
import FORMS, { PARTIES } from '../schemas';
import { mergeValues } from '../actions';
import { connect } from 'react-redux';

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


class Populate extends React.Component {
    constructor(props) {
        super(props);
        this.change= ::this.change;
    }

    change(e) {
        const path = this.props.path.slice(0);
        path.pop();
        const value = e.target.value;
        if(value){
            let data = PARTIES[value];
            path.reverse();
            path.map(p => {
                let newData = Number.isInteger(p) ? [] : {}
                newData[p] = data;
                data = newData;
            });

            this.props.dispatch(mergeValues({values: data, output: data, mergeOptions: {replaceArray: true}}));
        }
    }

    render() {
        const target = this.props.schema.srcData === 'parties' ? PARTIES : {};
        const keys = Object.keys(target);
        return <select onChange={this.change}>
            <option></option>
            { keys.map((k, i) => <option key={i} value={k}>{k}</option>)}
        </select>
    }
}


const ConnectedPopulate = connect(state => ({}))(Populate);

const handlers = {
    'textarea': TextArea,
    'date': DateInput,
    "readOnly": ReadOnly,
    "readOnlyCurrency": ReadOnlyCurrency,
    'invisible': Invisible,
    "populate": ConnectedPopulate
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
                buttons={() => false}
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
