import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import configureStore from './configureStore'
import Subschema, { Form, ValueManager }  from 'subschema/dist/subschema-noreact';
import './helpers';
import '../styles.scss';

import engagement from '../../templates/Letter of Engagement.html';
import engagementSchema from '../../templates/Letter of Engagement.json';


const FORMS = {
    'Letter of Engagement': {
        template: engagement,
        schema: engagementSchema
    }
}


const store = configureStore()


const values={}, errors={};
const vm = ValueManager(values, errors);

vm.addListener(null, function(newValue, oldValue, path){
 console.log(arguments)
});



class App extends React.Component {

    render() {
        return <div className="container-fluid">
            <div className="row">
            <div className="col-md-4">
                <Form className="form-horizontal" onSubmit={(e, error, val)=>{}} schema={FORMS[this.props.form].schema} valueManager={vm}/>
            </div>
            <div className="col-md-8">
                <div className="preview">
                    <div dangerouslySetInnerHTML={{__html: FORMS[this.props.form].template({})}} />
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