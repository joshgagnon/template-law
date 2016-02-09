import React from 'react';
import { connect } from 'react-redux';

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

function save(state){
    if(localStorage){
        localStorage['currentView'] = JSON.stringify(state);
    }
}


class StateSaver extends React.Component {

    update() {
        save({active: this.props.active, view: this.props.view});
    }

    componentDidMount() {
        this._update = debounce(::this.update, 3000);
    }

    componentDidUpdate() {
        this._update();
    }

    render() {
        return false;
    }
};


export default connect(state => state)(StateSaver);