import React from 'react';
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux';
import Modal from 'react-bootstrap/lib/Modal'
import { closeModal, setActiveState, load, save } from '../actions';

class LoadDialog extends React.Component {

    componentDidMount() {
        this.props.fetch();
    }

    render() {
        return <Modal show={true} bsSize="large" onHide={this.props.close} backdrop={'static'}>
            <Modal.Header >
                <Modal.Title>Load</Modal.Title>
            </Modal.Header>
             <Modal.Body>
                <div className="list-group">
                { (this.props.savedStates.data || []).map(row => {
                    return <button key={row.title} className="list-group-item" onClick={() => this.props.load(row.data) }>{ row.title }</button>
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

    componentDidMount() {
        this.props.fetch();
    }

    save() {
        const name = findDOMNode(this.refs.name).value;
        this.props.save(name || 'Default');
    }

    select(name) {
        findDOMNode(this.refs.name).value = name;
    }

    render() {
        return <Modal show={true} bsSize="large" onHide={this.props.close} backdrop={'static'}>
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
                { (this.props.savedStates.data || []).map(row => {
                    return <button key={row.title} className="list-group-item" onClick={() => this.select(row.title) }>{ row.title }</button>
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
        this.props.dispatch(closeModal('save'));
        this.props.dispatch(save({
            title: name,
            data: this.props.active
        }))
    }

    load(data) {
        this.props.dispatch(setActiveState(data));
        this.props.dispatch(closeModal('load'));
    }

    fetch() {
        this.props.dispatch(load())
    }

    render() {
        if(this.props.modals.save){
            return <SaveDialog save={::this.save}  fetch={::this.fetch} close={() => this.props.dispatch(closeModal('save')) } savedStates={this.props.savedStates} />
        }
        else if(this.props.modals.load){
            return <LoadDialog load={::this.load} fetch={::this.fetch} close={() => this.props.dispatch(closeModal('load')) } savedStates={this.props.savedStates} />
        }
        return false;
    }
};


export default connect(state => ({modals: state.modals, active: state.active, savedStates: state.savedStates}))(SaveLoadDialogs);