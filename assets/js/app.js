import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './configureStore'
import Form from 'react-json-editor/lib';
import { updateValues } from './actions';
import './helpers';
import '../styles.scss';

import engagement from '../../templates/Letter of Engagement.html';
import engagementSchema from '../../templates/Letter of Engagement.json';

export function debounce(func, delay = 100) {
    let timeout;
    return function(){
        const args = arguments;
        if (timeout)
            clearTimeout(timeout)
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

const FORMS = {
    'Letter of Engagement': {
        template: engagement,
        schema: engagementSchema
    }
}


const store = configureStore()


class App extends React.Component {

    componentWillMount() {

        this._update = debounce((value) => {
            console.log(value)

        });
    }

    update(data) {
        //this._update(value);
        this.props.dispatch(updateValues(data.values));
    }

    render() {
        console.log('render', this.props.valu)
        return <div className="container-fluid">
            <div className="row">
            <div className="col-md-4 controls">
                <Form className="form-horizontal" schema={FORMS[this.props.form].schema} update={::this.update} values={this.props.values} onSubmit={::this.update} />
            </div>
            <div className="col-md-8 preview">
                <div className="">
                    <div dangerouslySetInnerHTML={{__html: FORMS[this.props.form].template(this.props.values)}} />
                </div>
            </div>
        </div>

        </div >
    }
}

const ConnectedApp = connect(state => state.active)(App)

render( <Provider store = {store} >
    <ConnectedApp />
    </Provider>,
    document.getElementById('root')
)