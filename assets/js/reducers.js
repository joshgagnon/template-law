import { combineReducers } from 'redux';


function active(state = {form: 'Letter of Engagement'}, action) {
    return state;
}


const rootReducer = combineReducers({
    active
});


export default rootReducer;