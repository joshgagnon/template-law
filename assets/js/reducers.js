import { combineReducers } from 'redux';
import { UPDATE_VALUES, SET_FORM } from './actions';

function active(state = {form: 'Letter of Engagement', values: {}}, action) {
    switch(action.type){
        case UPDATE_VALUES:
            return {...state, values: {...action.data}};
        case SET_FORM:
            return {...state, form: action.data.form}
    }
    return state;
}


const rootReducer = combineReducers({
    active
});


export default rootReducer;