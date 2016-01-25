import React from 'react';
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal'
import { closeModal, setActiveState } from './actions';

class LoadDialog extends React.Component {
    render() {
        return <Modal show={true}>
            <Modal.Header >
                <Modal.Title>Load</Modal.Title>
            </Modal.Header>
             <Modal.Body>
                <div className="list-group">
                { this.props.names.map(name => {
                    return <button key={name} className="list-group-item" onClick={() => this.props.load(name)}>{ name }</button>
                })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-default" onClick={this.props.close}>Close</button>
            </Modal.Footer>
        </Modal>
    }
}

class SaveDialog extends React.Component {

    save() {
        const name = findDOMNode(this.refs.name).value;
        this.props.save(name || 'Default');
    }

    select(name) {
        findDOMNode(this.refs.name).value = name;
    }

    render() {
        return <Modal show={true}>
            <Modal.Header >
                <Modal.Title>Save</Modal.Title>
            </Modal.Header>
             <Modal.Body>
                <div className="input-group">
                    <input ref="name" type="text" className="form-control" placeholder="Name..." />
                    <span className="input-group-btn">
                        <button className="btn btn-primary" type="button" onClick={::this.save}>Save</button>
                    </span>
                </div>
                <br/>
                <div className="list-group">
                { this.props.names.map(name => {
                    return <button key={name} className="list-group-item" onClick={() => this.select(name)}>{ name }</button>
                })}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-default" onClick={this.props.close}>Close</button>
            </Modal.Footer>
        </Modal>
    }
}


class SaveLoadDialogs extends React.Component {

    save(name) {
        localStorage[name] = JSON.stringify(this.props.active);
        this.props.dispatch(closeModal('save'));
    }

    load(name) {
        this.props.dispatch(setActiveState(JSON.parse(localStorage[name])));
        this.props.dispatch(closeModal('load'));
    }

    names() {
        return Object.keys(localStorage);
    }

    render() {
        if(this.props.modals.save){
            return <SaveDialog names={this.names()} save={::this.save} close={() => this.props.dispatch(closeModal('save')) } />
        }
        else if(this.props.modals.load){
            return <LoadDialog names={this.names()} load={::this.load} close={() => this.props.dispatch(closeModal('load')) } />
        }
        return false;
    }
};


export default connect(state => ({modals: state.modals, active: state.active}))(SaveLoadDialogs);