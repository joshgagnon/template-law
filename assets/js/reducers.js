import { combineReducers } from 'redux';
import { UPDATE_VALUES } from './actions';

function active(state = {form: 'Letter of Engagement', values: {}}, action) {
    switch(action.type){
        case UPDATE_VALUES:
            return {...state, values: {...action.data}};
    }
    return state;
}


const rootReducer = combineReducers({
    active
});


export default rootReducer;