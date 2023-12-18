import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk'

const initialState = {
    myState:0,
};


const userChanges = {
    changeState: 0
};


const reducer = (state = initialState, action) =>{
    switch(action.type){
        case 'UPDATE_STATE':
            return {
                ...state, 
                myState:state.myState + 1//replaces myState value with 1, changing the array
            };
    

        default:
            return state;
        
    }
}

const changeUser = (state= userChanges, action) =>{
    switch(action.type){
        case 'UPDATE_USER_STATE':
            return {
                ...state, 
                changeState: state.changeState + 1//replaces myState value with 1, changing the array
            };
         default:
                return state;

    }

}


const rootReducer = combineReducers({
    reducer,
    changeUser,
  });

const store = createStore(rootReducer, applyMiddleware(thunk))
export default store;