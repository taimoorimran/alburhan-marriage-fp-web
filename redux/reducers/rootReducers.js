import { combineReducers } from 'redux';
import systemSettings from "./systemSettingsReducer"
const rootReducer = combineReducers({
    systemSettings: systemSettings
});
export default rootReducer;